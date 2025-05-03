import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Mock API call
const fetchCoordinatesForWord = async (word) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate deterministic but seemingly random coordinates based on the word
      const x = (word.charCodeAt(0) - 97) * 10 + (word.length * 5);
      const y = (word.charCodeAt(word.length > 1 ? 1 : 0) - 97) * 8 + (word.length * 3);
      resolve([x, y]);
    }, 500);
  });
};

// Secret word that user needs to guess
const TARGET_WORD = "matcha";
const TARGET_COORDINATES = [77, 59]; // Pre-calculated coordinates for "matcha"

const PolysemanticNeurons = () => {
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
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
      const coords = await fetchCoordinatesForWord(word);
      // Add new result to the array of search results
      setSearchResults(prev => [...prev, { 
        word, 
        coords,
        color: getRandomColor() // Assign a random color to each word
      }]);
      
      // Check if the user guessed the target word
      if (word.toLowerCase() === TARGET_WORD && !hasWon) {
        setHasWon(true);
        setShowWinPopup(true);
      }
      
      setWord(''); // Clear input field after successful search
    } catch (err) {
      setError('Failed to fetch coordinates');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a random color for each search result
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Polysemantic Neurons</h1>
        
        <div className="bg-white/70 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-gray-600 mb-6">
            Enter a single word (maximum 10 characters) to visualize its neural activation coordinates.
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
                  
                  {/* Golden mystery target dot */}
                  <div 
                    className="absolute group z-20"
                    style={{
                      left: `${Math.min(Math.max((TARGET_COORDINATES[0] / 100) * 100, 5), 95)}%`,
                      top: `${Math.min(Math.max((TARGET_COORDINATES[1] / 100) * 100, 5), 95)}%`,
                    }}
                  >
                    <div className="w-5 h-5 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md border-2 border-yellow-600 animate-pulse"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      ???
                    </div>
                  </div>
                  
                  {/* Position all points based on their coordinates */}
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      className="absolute group"
                      style={{
                        left: `${Math.min(Math.max((result.coords[0] / 100) * 100, 5), 95)}%`,
                        top: `${Math.min(Math.max((result.coords[1] / 100) * 100, 5), 95)}%`,
                      }}
                    >
                      <div className={`w-4 h-4 ${result.color} rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md hover:w-5 hover:h-5 transition-all duration-200`}></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                        {result.word}
                      </div>
                    </div>
                  ))}
                </div>
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
                <p className="text-lg mb-6">You found the hidden word: <span className="font-bold">{TARGET_WORD}</span>!</p>
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
          <h2 className="text-xl font-semibold mb-4">About Polysemantic Neurons</h2>
          <p className="text-gray-600">
            Polysemantic neurons are individual neurons in neural networks that respond to multiple unrelated concepts.
            This tool allows you to explore how different words map to a 2D representation of neural activation patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolysemanticNeurons;