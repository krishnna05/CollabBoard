import { useEffect, useState, useCallback } from 'react';
import { useDraw } from '../../hooks/useDraw';
import { socket } from '../../services/socket';
import { DRAW_LINE, CLEAR_BOARD } from '../../constants/events';

const Whiteboard = () => {
  const [color, setColor] = useState('#000000');
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

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
      isErasing
    });
  }, [color, isErasing]);

  const { canvasRef, onMouseDown, undo, redo, clearCanvas } = useDraw(createLine);

  const handleClearBoard = () => {
    clearCanvas();
    socket.emit(CLEAR_BOARD);
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    <div className='w-full h-full flex flex-col items-center pt-4 bg-gray-100 pb-8 overflow-auto'>
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
        width={canvasSize.width}
        height={canvasSize.height}
        className='bg-white border border-gray-300 shadow-lg rounded-md cursor-crosshair touch-none'
      />
    </div>
  );
};

export default Whiteboard;