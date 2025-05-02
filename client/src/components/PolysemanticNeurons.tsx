import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Define the structure for our map points
interface Point {
  id: number;
  x: number;
  y: number;
  label: string;
  description: string;
}

const PolysemanticNeurons = () => {
  // Sample points data - you can expand this or load from an API
  const [points] = useState<Point[]>([
    { id: 1, x: 100, y: 50, label: "Point A", description: "Critical incision point" },
    { id: 2, x: 200, y: 150, label: "Point B", description: "Secondary incision point" },
    { id: 3, x: 150, y: 200, label: "Point C", description: "Suture location" },
    { id: 4, x: 80, y: 220, label: "Point D", description: "Avoid this area" },
    { id: 5, x: 250, y: 80, label: "Point E", description: "Entry point for catheter" },
    // Adding more points spread out across a wider area
    { id: 6, x: 350, y: 120, label: "Point F", description: "Nerve cluster" },
    { id: 7, x: 450, y: 200, label: "Point G", description: "Artery location" },
    { id: 8, x: 600, y: 150, label: "Point H", description: "Lymph node" },
    { id: 9, x: 750, y: 180, label: "Point I", description: "Secondary artery" },
    { id: 10, x: 850, y: 240, label: "Point J", description: "Potential blockage" },
    // Points in various corners of the expanded map
    { id: 11, x: 50, y: 50, label: "Point K", description: "Upper left region" },
    { id: 12, x: 850, y: 50, label: "Point L", description: "Upper right region" },
    { id: 13, x: 50, y: 550, label: "Point M", description: "Lower left region" },
    { id: 14, x: 850, y: 550, label: "Point N", description: "Lower right region" },
    { id: 15, x: 450, y: 550, label: "Point O", description: "Bottom center region" },
    { id: 16, x: 450, y: 50, label: "Point P", description: "Top center region" },
  ]);

  // State for the point being hovered
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  
  // Map dimensions
  const totalMapWidth = 1000;
  const totalMapHeight = 600;
  const visibleMapWidth = 800;
  const visibleMapHeight = 600;
  
  // Handle mouse enter for a point
  const handlePointMouseEnter = (point: Point) => {
    setHoveredPoint(point);
  };

  // Handle mouse leave for a point
  const handlePointMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Polysemantic Neurons</h1>
      
      <div className="mb-4">
        <p>This is the polysemantic neuron page. Hover over points on the map to see details.</p>
        <p className="text-sm text-gray-600">Use mouse drag to pan, scroll wheel or trackpad pinch gesture to zoom, and buttons for additional controls.</p>
      </div>
      
      {/* The map container using TransformWrapper */}
      <div 
        className="border border-gray-300 rounded-md shadow-md overflow-hidden relative"
        style={{ width: `${visibleMapWidth}px`, height: `${visibleMapHeight}px` }}
      >
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.5}
          maxScale={3}
          limitToBounds={false}
          wheel={{ step: 0.1, touchPadEnabled: true }}
          pinch={{ step: 5 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="fixed bottom-3 right-3 z-20 flex space-x-2 bg-white bg-opacity-70 p-1 rounded-md shadow"
                   style={{ position: 'absolute', right: '12px', bottom: '12px' }}>
                <button 
                  onClick={() => zoomIn()} 
                  className="bg-white p-1 rounded hover:bg-gray-100"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button 
                  onClick={() => zoomOut()} 
                  className="bg-white p-1 rounded hover:bg-gray-100"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button 
                  onClick={() => resetTransform()} 
                  className="bg-white p-1 rounded hover:bg-gray-100"
                  title="Reset View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v6h6"></path>
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                    <path d="M21 22v-6h-6"></path>
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                  </svg>
                </button>
              </div>
              
              <TransformComponent 
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: `${totalMapWidth}px`, height: `${totalMapHeight}px` }}
              >
                <div 
                  className="relative bg-white"
                  style={{ width: `${totalMapWidth}px`, height: `${totalMapHeight}px` }}
                >
                  {/* Grid lines for reference */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-6">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i} className="border border-dashed border-gray-100"></div>
                    ))}
                  </div>
                  
                  {/* Render each point */}
                  {points.map((point) => (
                    <div
                      key={point.id}
                      className="absolute w-3 h-3 bg-black rounded-full cursor-pointer hover:w-4 hover:h-4 transition-all"
                      style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => handlePointMouseEnter(point)}
                      onMouseLeave={handlePointMouseLeave}
                    />
                  ))}
                  
                  {/* Tooltip for hovered point */}
                  {hoveredPoint && (
                    <div 
                      className="absolute bg-gray-800 text-white p-2 rounded-md shadow-lg z-10 pointer-events-none"
                      style={{
                        left: `${hoveredPoint.x}px`,
                        top: `${hoveredPoint.y - 40}px`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="font-semibold">{hoveredPoint.label}</div>
                      <div className="text-sm">{hoveredPoint.description}</div>
                      <div className="text-xs text-gray-300">Position: [{hoveredPoint.x}, {hoveredPoint.y}]</div>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
      
      {/* Legend or instructions */}
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <h3 className="font-semibold">Map Navigation</h3>
        <p className="text-sm">Hover over any black point to see details about that surgical landmark.</p>
        <p className="text-sm mt-1">Navigation controls:</p>
        <ul className="text-sm list-disc ml-5 mt-1">
          <li>Click and drag to pan the map</li>
          <li>Use mouse wheel or trackpad pinch gesture to zoom in/out</li>
          <li>Use the buttons in the top-left corner for zoom in, zoom out, and reset</li>
          <li>Double tap to quickly zoom in (works on trackpad and touch devices)</li>
        </ul>
      </div>
    </div>
  );
};

export default PolysemanticNeurons;