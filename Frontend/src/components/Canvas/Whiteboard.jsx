import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDraw } from '../../hooks/useDraw';
import { socket } from '../../services/socket';
import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  LogOut,
  Copy,
  Check,
  Palette,
  Share2,
  Users,
} from 'lucide-react';
import { DRAW_LINE, CLEAR_BOARD, JOIN_ROOM, UPDATE_USERS, CURSOR_MOVE, CURSOR_LEAVE, CANVAS_STATE, LEAVE_ROOM } from '../../constants/events';
import UserCursor from './UserCursor';

const Whiteboard = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [color, setColor] = useState('#1e293b');
  const [isErasing, setIsErasing] = useState(false);
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [showCopied, setShowCopied] = useState(false);

  const getCanvasSize = () => ({
    width: window.visualViewport ? window.visualViewport.width : window.innerWidth,
    height: window.visualViewport ? window.visualViewport.height : window.innerHeight
  });

  const [canvasDimensions, setCanvasDimensions] = useState(getCanvasSize());

  const currentUserIdRef = useRef(socket.id);
  const historyRef = useRef([]);

  const getUserColor = (userId) => {
    if (!userId) return '#000000';
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const palette = [
    '#1e293b', // Slate
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#a855f7', // Purple
  ];

  function drawLine({ prevPoint, currentPoint, ctx, color, width, isErasing }) {
    const { x: currX, y: currY } = currentPoint;
    const startPoint = prevPoint ?? currentPoint;

    ctx.save();
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.lineWidth = isErasing ? 24 : width;
    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.restore();
  }

  const drawLocal = useCallback(({ ctx, currentPoint, prevPoint }) => {
    const strokeData = { prevPoint, currentPoint, ctx, color, width: 4, isErasing };
    drawLine(strokeData);

  }, [color, isErasing]);

  const emitLine = useCallback(({ prevPoint, currentPoint }) => {
    socket.emit(DRAW_LINE, {
      prevPoint, currentPoint, color, width: 4, room: roomId, isErasing
    });
  }, [color, isErasing, roomId]);

  const { canvasRef, onMouseDown, undo, redo, clearCanvas } = useDraw(drawLocal, emitLine);

  const handleClearBoard = () => {
    if (window.confirm("Are you sure you want to clear the entire board?")) {
      clearCanvas();
      historyRef.current = [];
      socket.emit(CLEAR_BOARD, roomId);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    socket.emit(LEAVE_ROOM, { roomId });
    navigate('/');
  };

  useEffect(() => {
    let username = location.state?.username;
    if (!username) {
      username = prompt("Enter your name to join:");
      if (!username) { navigate('/'); return; }
    }

    const handleConnect = () => { currentUserIdRef.current = socket.id; };
    if (socket.connected) currentUserIdRef.current = socket.id;
    socket.on('connect', handleConnect);

    socket.emit(JOIN_ROOM, { roomId, username });
    socket.on(UPDATE_USERS, setUsers);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions(getCanvasSize());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      socket.off(UPDATE_USERS);
      socket.off('connect', handleConnect);
      clearTimeout(resizeTimeout);
    };
  }, [roomId, navigate, location]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!currentUserIdRef.current) return;

      const cursorData = {
        x: e.clientX,
        y: e.clientY,
        userId: currentUserIdRef.current,
        userName: location.state?.username || 'Anon',
        room: roomId
      };
      socket.emit(CURSOR_MOVE, cursorData);
    };

    const handleMouseLeave = () => {
      if (currentUserIdRef.current) {
        socket.emit(CURSOR_LEAVE, { userId: currentUserIdRef.current, room: roomId });
      }
    };

    const el = canvasRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);

      const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
          handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        }
      };
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchstart', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleMouseLeave);
      el.addEventListener('touchcancel', handleMouseLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [roomId, location.state, canvasRef]);
  useEffect(() => {
    const handleCursorMove = (data) => {
      if (data.userId === currentUserIdRef.current) return;
      setCursors(prev => ({ ...prev, [data.userId]: { ...data, color: getUserColor(data.userId) } }));
    };
    const handleCursorLeave = ({ userId }) => {
      setCursors(prev => { const n = { ...prev }; delete n[userId]; return n; });
    };
    socket.on(CURSOR_MOVE, handleCursorMove);
    socket.on(CURSOR_LEAVE, handleCursorLeave);
    return () => {
      socket.off(CURSOR_MOVE);
      socket.off(CURSOR_LEAVE);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    const handleDraw = (data) => {
      if (!ctx) return;
      drawLine({ ...data, ctx });
      historyRef.current.push(data);
    };

    const handleClear = () => {
      clearCanvas();
      historyRef.current = [];
    };

    const handleState = (strokes) => {
      if (!ctx) return;
      historyRef.current = strokes;
      strokes.forEach(s => drawLine({ ...s, ctx }));
    };

    socket.on(DRAW_LINE, handleDraw);
    socket.on(CLEAR_BOARD, handleClear);
    socket.on(CANVAS_STATE, handleState);

    if (ctx && historyRef.current.length > 0) {
      requestAnimationFrame(() => {
        historyRef.current.forEach(s => drawLine({ ...s, ctx }));
      });
    }

    return () => {
      socket.off(DRAW_LINE);
      socket.off(CLEAR_BOARD);
      socket.off(CANVAS_STATE);
    };
  }, [canvasRef, clearCanvas, canvasDimensions]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      onMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window,
      });
      window.dispatchEvent(mouseEvent);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    const mouseEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    window.dispatchEvent(mouseEvent);
  };


  return (
    <div className='fixed inset-0 w-full h-full overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100 touch-none'>

      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 md:p-8">

        <div className="w-full flex justify-between items-start">

          <div className="pointer-events-auto flex items-center gap-3 bg-white/60 backdrop-blur-2xl shadow-lg shadow-slate-200/50 border border-white/40 px-5 py-3 rounded-full transition-all hover:bg-white/80">
            <div className="bg-linear-to-br from-indigo-500 to-violet-600 p-2.5 rounded-full text-white shadow-md shadow-indigo-500/30">
              <Palette size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="hidden md:block text-base font-bold text-slate-800 tracking-tight leading-none">CollabBoard</h1>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">
                  {roomId.slice(0, 6)}...
                </span>
                <button
                  onClick={handleCopyLink}
                  className="pointer-events-auto flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wide transition-colors"
                >
                  {showCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="hidden sm:inline">{showCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex gap-3">
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-2xl shadow-lg shadow-slate-200/50 border border-white/40 px-2 py-2 pl-4 rounded-full">

              <div className="flex -space-x-3 items-center">
                {users.length === 0 && (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center animate-pulse">
                    <Users size={14} className="text-slate-400" />
                  </div>
                )}
                {users.slice(0, 4).map((user, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-110 z-10"
                    title={user.username}
                    style={{
                      backgroundColor: `hsl(${user.username.length * 45}, 85%, 94%)`,
                      color: `hsl(${user.username.length * 45}, 70%, 40%)`
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>

              <div className="w-px h-6 bg-slate-300/50 mx-1"></div>

              <div className="flex gap-1 pr-1">
                <button
                  className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-full transition-all active:scale-95"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-full transition-all active:scale-95"
                  title="Leave Room"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full flex justify-center pointer-events-none"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
        >
          <div className="pointer-events-auto flex flex-row items-center gap-4 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 px-4 py-3 rounded-[2.5rem] max-w-[95vw] md:max-w-fit overflow-x-auto no-scrollbar mb-2">

            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 shrink-0">
              <button
                onClick={() => setIsErasing(false)}
                className={`p-3 rounded-xl transition-all duration-300 ${!isErasing
                  ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-900/5 scale-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
              >
                <Pencil size={20} strokeWidth={!isErasing ? 2.5 : 2} />
              </button>
              <button
                onClick={() => setIsErasing(true)}
                className={`p-3 rounded-xl transition-all duration-300 ${isErasing
                  ? 'bg-white shadow-sm text-rose-500 ring-1 ring-slate-900/5 scale-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
              >
                <Eraser size={20} strokeWidth={isErasing ? 2.5 : 2} />
              </button>
            </div>

            <div className="w-px h-8 bg-slate-300/40 shrink-0"></div>

            <div className="flex items-center gap-2 md:gap-3 px-2">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setIsErasing(false); }}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full transition-transform duration-300 shrink-0 ${color === c && !isErasing
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                      : 'hover:scale-110 ring-1 ring-black/5'
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}

              <div className="relative flex items-center justify-center shrink-0">
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] cursor-pointer shadow-sm ${!palette.includes(color) && !isErasing ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full" style={{ backgroundColor: color }}></div>
                  </div>
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setIsErasing(false); }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>

            <div className="w-px h-8 bg-slate-300/40 shrink-0"></div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={undo} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-colors">
                <Undo2 size={20} />
              </button>
              <button onClick={redo} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-colors">
                <Redo2 size={20} />
              </button>
              <div className="w-px h-5 bg-slate-300/40 mx-1"></div>
              <button onClick={handleClearBoard} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className='block touch-none z-0 cursor-crosshair'
        style={{ touchAction: 'none' }}
      />

      {Object.entries(cursors).map(([userId, cursor]) => (
        <UserCursor key={userId} {...cursor} />
      ))}
    </div>
  );
};

export default Whiteboard;