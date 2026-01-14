import { useEffect, useRef, useState, useCallback } from 'react';

export const useDraw = (onDraw, onEmit) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const prevPoint = useRef(null);

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const pendingPoints = useRef([]);
  const emitTimeoutRef = useRef(null);

  const flushPendingPoints = useCallback(() => {
    if (pendingPoints.current.length > 0 && onEmit) {
      pendingPoints.current.forEach(point => {
        onEmit(point);
      });
      pendingPoints.current = [];
    }
    emitTimeoutRef.current = null;
  }, [onEmit]);

  const queueEmit = useCallback((data) => {
    pendingPoints.current.push(data);

    if (!emitTimeoutRef.current) {
      emitTimeoutRef.current = setTimeout(flushPendingPoints, 16); 
    }
  }, [flushPendingPoints]);

  const onMouseDown = (e) => {
    e.preventDefault();
    isDrawing.current = true;
  };

  const redo = () => {
    if (redoStack.length === 0) return;

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
      queueEmit(drawData);

      prevPoint.current = currentPoint;
    };

    const mouseUpHandler = () => {
      if (!isDrawing.current) return;
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
        emitTimeoutRef.current = null;
      }
      if (pendingPoints.current.length > 0 && onEmit) {
        pendingPoints.current.forEach(point => onEmit(point));
        pendingPoints.current = [];
      }

      isDrawing.current = false;
      prevPoint.current = null;

      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL();
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
  }, [onDraw, queueEmit, onEmit]);

  const undo = () => {
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