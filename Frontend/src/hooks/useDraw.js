import { useEffect, useRef } from 'react';

export const useDraw = (onDraw) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const prevPoint = useRef(null);

  const onMouseDown = () => {
    isDrawing.current = true;
  };

  useEffect(() => {
    const computePointInCanvas = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return { x, y };
    };

    const handler = (e) => {
      if (!isDrawing.current) return;

      const currentPoint = computePointInCanvas(e);
      const ctx = canvasRef.current?.getContext('2d');

      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
      
      prevPoint.current = currentPoint;
    };

    const mouseUpHandler = () => {
      isDrawing.current = false;
      prevPoint.current = null;
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener('mousemove', handler);
      window.addEventListener('mouseup', mouseUpHandler);
    }

    return () => {
      if (canvasEl) {
        canvasEl.removeEventListener('mousemove', handler);
      }
      window.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [onDraw]);

  return { canvasRef, onMouseDown };
};