import React, { useRef, useState, useEffect } from 'react';

function Canvas({ char, onSave, onNext }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]); // Array of strokes, each stroke is an array of points

  useEffect(() => {
    // Clear canvas when char changes
    clearCanvas();
    setStrokes([]);
  }, [char]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; // background white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // Initialize canvas size and background once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 200;
    canvas.height = 200;
    clearCanvas();
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Start a new stroke path
    setStrokes(prev => [...prev, [{ x, y }]]);
  };

  const handlePointerMove = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');

    ctx.lineTo(x, y);
    ctx.stroke();

    // Add point to current stroke
    setStrokes(prev => {
      const updated = [...prev];
      updated[updated.length - 1].push({ x, y });
      return updated;
    });
  };

  const handlePointerUp = () => {
    setDrawing(false);
  };

  const saveCharacter = () => {
    if (strokes.length === 0) {
      alert('Nothing drawn to save!');
      return;
    }

    // Call onSave prop with the character and strokes data
    onSave(char, strokes);
  };

  const nextCharacter = () => {
    // Clear for next char
    setStrokes([]);
    clearCanvas();
    if (onNext) onNext();
  };

  const handleClear = () => {
    clearCanvas();
    setStrokes([]);
  };

  return (
    <div className="CanvasDraw">
      <canvas
        ref={canvasRef}
        style={{ border: '2px solid #282c34', borderRadius: '4px' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePointerDown(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          handlePointerMove(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handlePointerUp();
        }}
      />
      <div className="canvas-controls">
        <button onClick={saveCharacter}>Save {char}</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={nextCharacter}>Next</button>
      </div>
    </div>
  );
}

export default Canvas;
