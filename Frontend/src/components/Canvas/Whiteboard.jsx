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
    navigator.clipboard.writeText(roomId);
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
      e.target.dispatchEvent(mouseEvent);
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

      {/* Top Left: Title & Room ID */}
      <div className="absolute top-3 left-3 md:top-5 md:left-5 z-50 pointer-events-auto flex items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all hover:bg-white/30 group scale-90 origin-top-left">
        <div className="bg-gradient-to-br from-indigo-500/80 to-violet-600/80 p-1.5 md:p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
          <Palette size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="hidden md:block text-sm font-bold text-slate-800 tracking-tight leading-none">CollabBoard</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono font-medium text-slate-600 bg-white/40 px-1.5 py-0.5 rounded border border-white/30 backdrop-blur-sm">
              {roomId.slice(0, 6)}...
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-[10px] text-indigo-700 hover:text-indigo-800 font-bold uppercase tracking-wide transition-colors bg-white/30 px-1.5 py-0.5 rounded hover:bg-white/50"
            >
              {showCopied ? <Check size={10} /> : <Copy size={10} />}
              <span className="hidden sm:inline">{showCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Right: Users & Logout */}
      <div className="absolute top-3 right-3 md:top-5 md:right-5 z-50 pointer-events-auto flex gap-3 scale-90 origin-top-right">
        <div className="flex items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/20 px-2 py-1.5 md:py-2 pl-3 rounded-xl transition-all hover:bg-white/30">
          <div className="flex -space-x-2 items-center">
            {users.length === 0 && (
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-200/50 flex items-center justify-center animate-pulse">
                <Users size={14} className="text-slate-500" />
              </div>
            )}
            {users.slice(0, 4).map((user, i) => (
              <div
                key={i}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg border-[2px] border-white flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform hover:scale-110 z-10 backdrop-blur-md"
                title={user.username}
                style={{
                  backgroundColor: `hsla(${user.username.length * 45}, 85%, 94%, 0.9)`,
                  color: `hsl(${user.username.length * 45}, 70%, 40%)`
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-400/30 mx-0.5"></div>

          <button
            onClick={handleLeaveRoom}
            className="p-1.5 md:p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-all active:scale-95"
            title="Leave Room"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div
        className="absolute inset-x-0 bottom-0 z-50 pointer-events-none flex justify-center pb-10 md:pb-12"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="pointer-events-auto flex flex-row items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 px-3 md:px-4 py-3 rounded-2xl max-w-[95vw] overflow-x-auto no-scrollbar hover:bg-white/30 transition-colors scale-90 origin-bottom">

          {/* Tools */}
          <div className="flex bg-white/30 p-1 rounded-xl gap-1 shrink-0 backdrop-blur-sm border border-white/20 shadow-inner shadow-white/10">
            <button
              onClick={() => setIsErasing(false)}
              className={`p-2.5 rounded-lg transition-all duration-300 ${!isErasing
                ? 'bg-white shadow-md shadow-indigo-500/10 text-indigo-600 ring-1 ring-black/5 scale-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
            >
              <Pencil size={18} strokeWidth={!isErasing ? 2.5 : 2} />
            </button>
            <button
              onClick={() => setIsErasing(true)}
              className={`p-2.5 rounded-lg transition-all duration-300 ${isErasing
                ? 'bg-white shadow-md shadow-rose-500/10 text-rose-500 ring-1 ring-black/5 scale-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
            >
              <Eraser size={18} strokeWidth={isErasing ? 2.5 : 2} />
            </button>
          </div>

          <div className="w-px h-8 bg-slate-400/20 shrink-0"></div>

          {/* Colors */}
          <div className="flex items-center gap-1.5 md:gap-2 px-1">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setIsErasing(false); }}
                className={`w-7 h-7 rounded-md transition-all duration-300 shrink-0 shadow-sm ${color === c && !isErasing
                  ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-md'
                  : 'hover:scale-105 ring-1 ring-black/5 hover:ring-black/10'
                  }`}
                style={{ backgroundColor: c }}
              />
            ))}

            {/* Custom Color Picker */}
            <div className="relative flex items-center justify-center shrink-0">
              <div className={`w-8 h-8 rounded-md bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] cursor-pointer shadow-sm transition-transform hover:scale-105 ${!palette.includes(color) && !isErasing ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
                <div className="w-full h-full rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full" style={{ backgroundColor: color }}></div>
                </div>
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => { setColor(e.target.value); setIsErasing(false); }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="w-px h-8 bg-slate-400/20 shrink-0"></div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={undo}
              className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/40 rounded-lg transition-colors active:scale-95"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/40 rounded-lg transition-colors active:scale-95"
            >
              <Redo2 size={18} />
            </button>
            <div className="w-px h-5 bg-slate-400/20 mx-1"></div>
            <button
              onClick={handleClearBoard}
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/40 rounded-lg transition-colors active:scale-95"
            >
              <Trash2 size={18} />
            </button>
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