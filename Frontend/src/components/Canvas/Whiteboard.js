import { useEffect, useState } from 'react';
import { useDraw } from '../../hooks/useDraw';
import { socket } from '../../services/socket';
import { DRAW_LINE } from '../../constants/events';

const Whiteboard = () => {
  const [color, setColor] = useState('#000000');
  const { canvasRef, onMouseDown } = useDraw(createLine);

  function drawLine({ prevPoint, currentPoint, ctx, color, width }) {
    const { x: currX, y: currY } = currentPoint;
    const startPoint = prevPoint ?? currentPoint;

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();
  }

  function createLine({ ctx, currentPoint, prevPoint }) {
    const lineOptions = {
      prevPoint,
      currentPoint,
      ctx,
      color,
      width: 5
    };

    drawLine(lineOptions);

    socket.emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width: 5
    });
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    const handleDrawEvent = (data) => {
      if (!ctx) return;
      drawLine({ ...data, ctx });
    };

    socket.on(DRAW_LINE, handleDrawEvent);

    return () => {
      socket.off(DRAW_LINE);
    };
  }, [canvasRef]);

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-gray-100'>
      <div className='mb-4 flex gap-4'>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="cursor-pointer"
        />
        <span className="text-sm font-bold text-gray-600">Active Color</span>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={800}
        height={600}
        className='bg-white border border-gray-300 shadow-lg rounded-md cursor-crosshair touch-none'
      />
    </div>
  );
};

export default Whiteboard;