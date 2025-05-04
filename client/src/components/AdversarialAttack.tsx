import React, { useRef, useState, useEffect } from 'react';
import threeImage from '../assets/three.png';

const AdversarialAttack: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawnPoints, setDrawnPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [flattenedPoints, setFlattenedPoints] = useState<number[]>([]);

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
    
    // Switch x and y here - y (row) comes from clientX, x (column) comes from clientY
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

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
    setShowCongrats(false);
    setPrediction(null);
    setFlattenedPoints([]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    setShowCongrats(false);
    setPrediction(null);
  
    try {
      const flattened = drawnPoints.reduce<number[]>((acc, point) => {
        acc.push(point.x, point.y);
        return acc;
      }, []);
      
      setFlattenedPoints(flattened);
  
      const response = await fetch('http://localhost:4167/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: flattened }),
      });
  
      const data = await response.json();
      setResult("Wow!");
  
      // Pull the actual predicted value depending on your server response shape
      const predictedValue = Number(data.prediction.prediction);
  
      setPrediction(predictedValue);
  
      if (predictedValue !== 3) {
        setShowCongrats(true);
      }
    } catch (err) {
      console.error(err);
      setResult('Error: Failed to get prediction from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-gray-800 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-red-700">Adversarial Attack</h1>
        <div className="h-1 w-20 bg-red-500 mx-auto mb-6 rounded-full"></div>
        
        <p className="text-center mb-6 text-gray-600">
          Click on cells to modify the image with white pixels. Try to fool the neural network!
        </p>

        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              onClick={handleCanvasClick}
              className="border-2 border-red-200 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6 mb-4">
          <div className="bg-red-50 py-2 px-4 rounded-lg">
            <p className="text-red-700 font-medium">Points selected: <span className="font-bold">{drawnPoints.length}</span></p>
          </div>
          
          {prediction !== null && (
            <div className="bg-red-50 py-2 px-4 rounded-lg">
              <p className="text-red-700 font-medium">Prediction: <span className="font-bold text-xl">{prediction}</span></p>
            </div>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading || drawnPoints.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium shadow-md transition-colors ${
              drawnPoints.length === 0 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? 'Analyzing...' : 'Submit'}
          </button>

          <button
            onClick={handleClear}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Clear
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-700">{result}</p>
          </div>
        )}
      </div>

      {/* Instructions card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-red-700">How it works</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>This is an image of the digit "3" as seen by a neural network</li>
          <li>Click on grid cells to add white pixels to the image</li>
          <li>Try to modify the image minimally so the AI misclassifies it</li>
          <li>Success is when the model predicts any digit other than 3</li>
        </ol>
      </div>

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 animate-bounce-in">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Success!</h2>
            <p className="text-center mb-6">
              Amazing! You fooled the model with just {drawnPoints.length} pixel changes!
              <br />It predicted <span className="font-bold text-xl">{prediction}</span> instead of 3.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowCongrats(false)}
                className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdversarialAttack;