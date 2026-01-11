import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDraw } from '../../hooks/useDraw';
import { socket } from '../../services/socket';
import { DRAW_LINE, CLEAR_BOARD, JOIN_ROOM, UPDATE_USERS, CURSOR_MOVE, CURSOR_LEAVE } from '../../constants/events';
import UserCursor from './UserCursor';

const Whiteboard = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [color, setColor] = useState('#000000');
  const [isErasing, setIsErasing] = useState(false);
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({}); // { userId: { x, y, userName, color } }
  const currentUserIdRef = useRef(socket.id);

  // We'll use a ref for canvas size since we don't want re-renders on resize, just redraws if needed (though existing code forces re-render via state, let's keep it simple for now but fix the existing state usage if it was creating loops).
  // Actually, the existing code used state for canvasSize. Let's keep it consistent but fix the useDraw dependency if needed.
  // Wait, I see the previous code used state for canvasSize. I will keep it as state to match existing pattern for now, but I will add the user list state.

  /* Re-declaring state as per original file but adding users */
  /* const [canvasSize, setCanvasSize] = useState(...) - keeping original */

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Generate consistent color for each user based on their ID
  const getUserColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  function drawLine({ prevPoint, currentPoint, ctx, color, width, isErasing }) {
    const { x: currX, y: currY } = currentPoint;
    const startPoint = prevPoint ?? currentPoint;

    ctx.save();

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.lineWidth = isErasing ? 20 : width;
    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.restore();
  }

  const createLine = useCallback(({ ctx, currentPoint, prevPoint }) => {
    const lineOptions = {
      prevPoint,
      currentPoint,
      ctx,
      color,
      width: 5,
      isErasing
    };

    drawLine(lineOptions);

    socket.emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width: 5,
      room: roomId,
      isErasing
    });
  }, [color, isErasing, roomId]);

  const { canvasRef, onMouseDown, undo, redo, clearCanvas } = useDraw(createLine);

  const handleClearBoard = () => {
    clearCanvas();
    socket.emit(CLEAR_BOARD, roomId);
  };

  useEffect(() => {
    // Update socket ID on connect
    const handleConnect = () => {
      currentUserIdRef.current = socket.id;
      console.log('[Cursor] Socket connected with ID:', socket.id);
    };

    if (socket.connected) {
      currentUserIdRef.current = socket.id;
      console.log('[Cursor] Already connected with ID:', socket.id);
    }

    socket.on('connect', handleConnect);

    let username = location.state?.username;

    if (!username) {
      username = prompt("Enter your name to join:");
      if (!username) {
        navigate('/');
        return;
      }
    }

    socket.emit(JOIN_ROOM, { roomId, username });

    const handleUpdateUsers = (usersList) => {
      setUsers(usersList);
    };

    socket.on(UPDATE_USERS, handleUpdateUsers);

    const handleResize = () => {
      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off(UPDATE_USERS, handleUpdateUsers);
      socket.off('connect', handleConnect);
    };
  }, [roomId, location.state, navigate]);

  // Handle cursor movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cursorData = {
        x: e.clientX,
        y: e.clientY,
        userId: currentUserIdRef.current,
        userName: location.state?.username || 'Anonymous',
        room: roomId
      };

      console.log('[Cursor] Emitting cursor_move:', cursorData);

      // Emit cursor position to other users with absolute viewport coordinates
      socket.emit(CURSOR_MOVE, cursorData);
    };

    const handleMouseLeave = () => {
      console.log('[Cursor] Emitting cursor_leave for user:', currentUserIdRef.current);
      // Notify others that cursor left the canvas
      socket.emit(CURSOR_LEAVE, {
        userId: currentUserIdRef.current,
        room: roomId
      });
    };

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('mousemove', handleMouseMove);
      canvasElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('mousemove', handleMouseMove);
        canvasElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [roomId, location.state, canvasRef]);

  // Listen for other users' cursor movements
  useEffect(() => {
    const handleCursorMove = ({ x, y, userId, userName }) => {
      console.log('[Cursor] Received cursor_move:', { x, y, userId, userName, myId: currentUserIdRef.current });

      // Don't show own cursor
      if (userId === currentUserIdRef.current) {
        console.log('[Cursor] Ignoring own cursor');
        return;
      }

      console.log('[Cursor] Adding cursor for user:', userName);
      setCursors(prev => ({
        ...prev,
        [userId]: {
          x,
          y,
          userName,
          color: getUserColor(userId)
        }
      }));
    };

    const handleCursorLeave = ({ userId }) => {
      console.log('[Cursor] Received cursor_leave:', userId);
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    };

    socket.on(CURSOR_MOVE, handleCursorMove);
    socket.on(CURSOR_LEAVE, handleCursorLeave);

    console.log('[Cursor] Listening for cursor events');

    return () => {
      socket.off(CURSOR_MOVE, handleCursorMove);
      socket.off(CURSOR_LEAVE, handleCursorLeave);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    const handleDrawEvent = (data) => {
      if (!ctx) return;
      drawLine({ ...data, ctx });
    };

    const handleClearEvent = () => {
      clearCanvas();
    };

    socket.on(DRAW_LINE, handleDrawEvent);
    socket.on(CLEAR_BOARD, handleClearEvent);

    return () => {
      socket.off(DRAW_LINE);
      socket.off(CLEAR_BOARD);
    };
  }, [canvasRef, clearCanvas]);

  return (
    <div className='w-full h-full flex flex-col items-center pt-4 bg-gray-100 pb-8 overflow-auto relative'>
      <div className='mb-4 flex gap-4 items-center flex-wrap justify-center'>
        <div className='flex gap-2 items-center'>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="cursor-pointer"
            disabled={isErasing}
          />
          <span className="text-sm font-bold text-gray-600">Active Color</span>
        </div>
        <button
          onClick={() => setIsErasing(false)}
          className={`font-bold py-2 px-4 rounded ${!isErasing
            ? 'bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setIsErasing(true)}
          className={`font-bold py-2 px-4 rounded ${isErasing
            ? 'bg-pink-600 text-white'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
          🧹 Eraser
        </button>
        <button
          onClick={undo}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Undo
        </button>
        <button
          onClick={redo}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
        >
          Redo
        </button>
        <button
          onClick={handleClearBoard}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
        >
          🗑️ Clear Board
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className='bg-white border border-gray-300 shadow-lg rounded-md cursor-crosshair touch-none'
      />

      {/* User List Overlay */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 max-w-xs">
        <h3 className="font-bold text-gray-700 mb-2 border-b pb-1">Active Users ({users.length})</h3>
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {users.map((user, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {user.username} {user.username === location.state?.username ? '(You)' : ''}
            </li>
          ))}
        </ul>
      </div>

      {/* Room Info & Copy Link */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 flex items-center gap-3">
        <span className="text-sm text-gray-500 font-mono">Room: {roomId.slice(0, 8)}...</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}
          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition"
        >
          Copy Link
        </button>
      </div>

      {/* Render other users' cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <UserCursor
          key={userId}
          x={cursor.x}
          y={cursor.y}
          userName={cursor.userName}
          color={cursor.color}
        />
      ))}
    </div>
  );
};

export default Whiteboard;