import React, { useRef, useState, useEffect } from 'react';

const AdversarialAttack: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<{x: number, y: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const canvasSize = 280; // 10x the original 28x28 for better UX
  const imageSize = 28; // Original image size
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image
    const img = new Image();
    img.src = 'image.png'; // This should be your actual image path
    img.onload = () => {
      // Scale the small 28x28 image to fit the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      // If image fails to load, show a placeholder
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '14px Arial';
      ctx.fillText('Image placeholder (28x28)', 70, canvasSize/2);
    };
  }, []);
  
  // Handle drawing events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    const { offsetX, offsetY } = getPointerPosition(e);
    addPoint(offsetX, offsetY);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const { offsetX, offsetY } = getPointerPosition(e);
    addPoint(offsetX, offsetY);
  };
  
  const endDrawing = () => {
    setDrawing(false);
  };
  
  // Get pointer position for both mouse and touch events
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
  };
  
  const addPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw on canvas
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Convert canvas coordinates to original image coordinates
    const scaledX = Math.floor((x / canvasSize) * imageSize);
    const scaledY = Math.floor((y / canvasSize) * imageSize);
    
    // Add to points array
    setDrawnPoints(prev => [...prev, { x: scaledX, y: scaledY }]);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // Call dummy API with the drawn points
      // In a real app, replace this with your actual API endpoint
      const response = await fetch('https://api.example.com/adversarial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: drawnPoints }),
      });
      
      const data = await response.json();
      setResult(`API Response: ${JSON.stringify(data)}`);
      
      // For demo purposes, simulate API response
      setTimeout(() => {
        setResult(`API Response: Successfully processed ${drawnPoints.length} points.`);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting data:', error);
      setResult('Error: Failed to submit data. Check console for details.');
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the image
    const img = new Image();
    img.src = 'image.png';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '14px Arial';
      ctx.fillText('Image placeholder (28x28)', 70, canvasSize/2);
    };
    
    // Clear points
    setDrawnPoints([]);
    setResult(null);
  };
  
  return (
    <div className="adversarial-attack-container">
      <h1>Adversarial Attack</h1>
      <p>Draw on the image below, then submit to test the model.</p>
      
      <div className="canvas-container" style={{ margin: '20px 0' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          style={{ 
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            touchAction: 'none' // Prevents scrolling while drawing on mobile
          }}
        />
      </div>
      
      <div className="controls" style={{ marginTop: '10px' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isLoading || drawnPoints.length === 0}
          style={{ 
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: drawnPoints.length === 0 ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: drawnPoints.length === 0 ? 'not-allowed' : 'pointer'
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
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
      
      {drawnPoints.length > 0 && (
        <div className="points-info" style={{ margin: '15px 0', fontSize: '14px' }}>
          <p>Points drawn: {drawnPoints.length}</p>
        </div>
      )}
      
      {result && (
        <div className="result" style={{ 
          margin: '15px 0',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default AdversarialAttack;