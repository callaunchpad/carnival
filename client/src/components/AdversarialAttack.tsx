import React, { useRef, useState, useEffect } from 'react';
import threeImage from '../assets/three.png';

const AdversarialAttack: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawnPoints, setDrawnPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canvasSize = 280;
  const imageSize = 28;
  const cellSize = canvasSize / imageSize;

  useEffect(() => {
    drawCanvas();
  }, [drawnPoints]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw image or fallback
    const img = new Image();
    img.src = threeImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
      drawGrid(ctx);
      drawPoints(ctx);
    };
    img.onerror = () => {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = '#888';
      ctx.fillText('Image not found', 90, canvasSize / 2);
      drawGrid(ctx);
      drawPoints(ctx);
    };
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= imageSize; i++) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize, pos);
      ctx.stroke();
    }
  };

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#fff';
    for (const point of drawnPoints) {
      ctx.fillRect(point.x * cellSize, point.y * cellSize, cellSize, cellSize);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientY - rect.top) / cellSize);
    const y = Math.floor((e.clientX - rect.left) / cellSize);
    
    const index = drawnPoints.findIndex(p => p.x === x && p.y === y);
    if (index === -1) {
      setDrawnPoints(prev => [...prev, { x, y }]);
    } else {
      setDrawnPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClear = () => {
    setDrawnPoints([]);
    setResult(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://api.example.com/adversarial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: drawnPoints }),
      });

      const data = await response.json();
      setResult(`API Response: ${JSON.stringify(data)}`);
    } catch (err) {
      console.error(err);
      setResult('Error: Failed to submit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'sans-serif',
        color: '#000',
      }}
    >
      <h1>Adversarial Attack</h1>
      <p>Click on cells in the 28x28 grid to fill them with white.</p>

      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        style={{
          border: '1px solid #ccc',
          margin: '20px 0',
          cursor: 'pointer',
        }}
      />

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleSubmit}
          disabled={isLoading || drawnPoints.length === 0}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: drawnPoints.length === 0 ? '#ccc' : '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: drawnPoints.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      {drawnPoints.length > 0 && <p>Points selected: {drawnPoints.length}</p>}

      {result && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            maxWidth: '90%',
          }}
        >
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default AdversarialAttack;
