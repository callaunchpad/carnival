import React, { useState } from 'react';
import { Search } from 'lucide-react';

// Real API call to local Node server
const fetchCoordinatesForWord = async (word) => {
  try {
    const response = await fetch('http://localhost:4167/coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Secret word that user needs to guess
const TARGET_WORD = "water";
const TARGET_COORDINATES = [17.219, 7.771];

const FeatureHunt = () => {
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  // Define map view state (center coordinates and zoom)
  const [mapView, setMapView] = useState({
    center: TARGET_COORDINATES,
    zoom: 1,
    viewportWidth: 100,
    viewportHeight: 100
  });
  
  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    if (value.length <= 10) {
      setWord(value);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!word) {
      setError('Please enter a word');
      return;
    }
    
    // Check if word already exists in search results
    if (searchResults.some(result => result.word === word)) {
      setError('This word has already been searched');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await fetchCoordinatesForWord(word);
      // Add new result to the array of search results
      setSearchResults(prev => [...prev, { 
        word, 
        coords: result.coordinates,
        scalar: result.scalar,
        color: 'bg-orange-200'
      }]);
      
      // Check if the user guessed the target word
      if (word.toLowerCase() === TARGET_WORD && !hasWon) {
        setHasWon(true);
        setShowWinPopup(true);
      }
      
      setWord(''); // Clear input field after successful search
    } catch (err) {
      setError('Failed to fetch coordinates from server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  // Close the win popup
  const closeWinPopup = () => {
    setShowWinPopup(false);
  };

  // Calculate score based on number of attempts
  const calculateScore = () => {
    const attempts = searchResults.length;
    const maxScore = 100;
    const penalty = 5; // Points deducted per attempt
    
    // Calculate score (higher is better)
    let score = Math.max(maxScore - (attempts - 1) * penalty, 10); // Minimum score is 10
    
    return {
      score,
      attempts
    };
  };
  
  // Convert absolute coordinates to viewport coordinates
  const toViewportCoords = (coords) => {
    const [x, y] = coords;
    const { center, viewportWidth, viewportHeight } = mapView;
    
    // Calculate the position relative to the center
    const relX = ((x - center[0]) / viewportWidth) * 100 + 50;
    const relY = ((y - center[1]) / viewportHeight) * 100 + 50;
    
    return [
      Math.min(Math.max(relX, 5), 95), // Clamp between 5% and 95% of viewport
      Math.min(Math.max(relY, 5), 95)  // Clamp between 5% and 95% of viewport
    ];
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">FeatureHunt</h1>
        
        <div className="bg-white/70 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-gray-600 mb-6">
            Enter your guess!!
          </p>
          
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={word}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter a word..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                maxLength={10}
              />
              <button 
                onClick={handleSubmit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <Search size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="h-64 border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full relative bg-gray-50 border border-gray-200">
                  {/* Create a custom grid */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {[...Array(100)].map((_, i) => (
                      <div key={i} className="border border-gray-100"></div>
                    ))}
                  </div>
                  
                  {/* Add coordinate axes through the center */}
                  <div className="absolute inset-0">
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>
                  </div>
                  
                  {/* Golden mystery target dot */}
                  <div 
                    className="absolute group z-20"
                    style={{
                      left: `50%`,
                      top: `50%`,
                    }}
                  >
                    <div className="w-5 h-5 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md border-2 border-yellow-600 animate-pulse"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      ???
                    </div>
                  </div>
                  
                  {/* Position all points based on their coordinates */}
                  {searchResults.map((result, index) => {
                    const [viewX, viewY] = toViewportCoords(result.coords);
                    return (
                      <div 
                        key={index}
                        className="absolute group"
                        style={{
                          left: `${viewX}%`,
                          top: `${viewY}%`,
                        }}
                      >
                        <div className={`w-4 h-4 ${result.color} rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md hover:w-5 hover:h-5 transition-all duration-200`}></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          {result.word} ({result.scalar})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Add zoom controls */}
              <div className="flex justify-center mt-2">
                <button 
                  onClick={() => setMapView(prev => ({
                    ...prev,
                    viewportWidth: prev.viewportWidth * 0.8,
                    viewportHeight: prev.viewportHeight * 0.8
                  }))}
                  className="px-3 py-1 bg-blue-500 text-white rounded-l hover:bg-blue-600"
                >
                  Zoom In
                </button>
                <button
                  onClick={() => setMapView({
                    center: TARGET_COORDINATES,
                    zoom: 1,
                    viewportWidth: 100,
                    viewportHeight: 100
                  })}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setMapView(prev => ({
                    ...prev,
                    viewportWidth: prev.viewportWidth * 1.25,
                    viewportHeight: prev.viewportHeight * 1.25
                  }))}
                  className="px-3 py-1 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                >
                  Zoom Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Enter a word and search to visualize coordinates</p>
            </div>
          )}
          
          {/* Win popup */}
          {showWinPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-xl transform transition-all">
                <div className="mb-4 text-7xl">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">Congratulations!</h3>
                <p className="text-lg mb-2">You found the hidden word: <span className="font-bold">{TARGET_WORD}</span>!</p>
                {/* Score display */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-md mb-1">Your Score: <span className="font-bold text-blue-600 text-xl">{calculateScore().score}</span></p>
                <p className="text-sm text-gray-600">Found in {calculateScore().attempts} {calculateScore().attempts === 1 ? 'attempt' : 'attempts'}</p>
                </div>

                <button 
                  onClick={closeWinPopup}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white/70 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About FeatureHunt</h2>
          <p className="text-gray-600">
            Guess the word! Each guess will appear on the map, so you can see the distance to the real word in latent space
            as well as how much a feature corresponding to the word is activated. The feature is "references to [the word] in various contexts and forms."
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureHunt;