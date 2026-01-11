import { useEffect, useRef, useState, useMemo } from 'react';
import { throttle } from 'lodash';

export const useDraw = (onDraw, onEmit) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const prevPoint = useRef(null);

  const [history, setHistory] = useState([]);

  const [redoStack, setRedoStack] = useState([]);

  const throttledEmit = useMemo(
    () =>
      throttle((data) => {
        onEmit?.(data);
      }, 20),
    [onEmit]
  );

  const onMouseDown = () => {
    isDrawing.current = true;
  };

  const redo = () => {
    if (redoStack.length === 0) {
      console.log("Redo stack empty");
      return;
    }

    const snapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, snapshot]);

    const img = new Image();
    img.src = snapshot;
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    console.log("Redo performed. History size:", history.length + 1);
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

      const drawData = { ctx, currentPoint, prevPoint: prevPoint.current };
      onDraw(drawData);
      throttledEmit(drawData);

      prevPoint.current = currentPoint;
    };

    const mouseUpHandler = () => {
      if (!isDrawing.current) return;

      isDrawing.current = false;
      prevPoint.current = null;

      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL();
        console.log("Capturing state to history");
        setHistory((prev) => [...prev, dataUrl]);
        setRedoStack([]);
      }
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
  }, [onDraw, throttledEmit]);

  const undo = () => {
    console.log("Undo called. History length:", history.length);
    if (history.length === 0) return;

    const currentHistory = [...history];
    const lastState = currentHistory.pop();
    setHistory(currentHistory);
    setRedoStack(prev => [...prev, lastState]);

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (currentHistory.length > 0) {
      const previousState = currentHistory[currentHistory.length - 1];
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    setRedoStack([]);
  };

  return { canvasRef, onMouseDown, undo, redo, clearCanvas };
};