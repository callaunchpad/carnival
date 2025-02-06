import React, { useState, useCallback, useEffect } from 'react';
import { Brain, Settings, Trophy, Home } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';

// Custom Knob Component
const Knob = ({ value, onChange, min = 0, max = 100, size = 60 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  }, [value]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const delta = startY - e.clientY;
    const range = max - min;
    const newValue = Math.min(max, Math.max(min, startValue + (delta / 100) * range));
    
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
      <div 
        className="absolute inset-0 rounded-full border-4 border-blue-600"
        style={{
          clipPath: `polygon(50% 50%, 50% 0, ${rotation >= 0 ? '100% 0, 100% 100%, 0 100%, 0 0' : '0 0'} ${50 - Math.cos(rotation * Math.PI / 180) * 50}% ${50 - Math.sin(rotation * Math.PI / 180) * 50}%)`
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-gray-900 origin-bottom transform -translate-x-1/2"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-mono">{Math.round(value)}</span>
      </div>
    </div>
  );
};

// Feature Map Component
const FeatureMap = ({ data, onPointClick }) => {
  return (
    <ScatterChart
      width={400}
      height={400}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <XAxis type="number" dataKey="x" name="x" />
      <YAxis type="number" dataKey="y" name="y" />
      <ZAxis type="number" dataKey="z" range={[50, 400]} name="score" />
      <Tooltip 
        cursor={{ strokeDasharray: '3 3' }}
        content={({ payload }) => {
          if (payload && payload.length) {
            const point = payload[0].payload;
            return (
              <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200">
                <p className="font-mono text-sm">Feature: {point.name}</p>
                <p className="text-sm text-gray-600">Activation: {point.z.toFixed(2)}</p>
              </div>
            );
          }
          return null;
        }}
      />
      <Scatter 
        data={data} 
        fill="#3b82f6"
        onClick={onPointClick}
      />
    </ScatterChart>
  );
};

const SurgicalSim = () => {
  // Sample feature map data
  const [mapData, setMapData] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      name: `Feature ${i + 1}`
    }))
  );

  // Neuron controls state
  const [neurons, setNeurons] = useState([
    { id: 1, value: 50, name: "Input Gate" },
    { id: 2, value: 30, name: "Memory Cell" },
    { id: 3, value: 70, name: "Output Gate" }
  ]);

  const handleNeuronChange = (id, newValue) => {
    setNeurons(neurons.map(n => 
      n.id === id ? { ...n, value: newValue } : n
    ));
    
    // Update feature map based on neuron changes
    setMapData(mapData.map(point => ({
      ...point,
      z: point.z * (newValue / 50) // Simple example of how neurons affect the map
    })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      <header className="space-y-6">
        <h2 className="text-3xl font-serif">Surgical Simulator</h2>
        <p className="text-xl text-gray-600 font-serif">
          Adjust neural activations to understand and modify model behavior
        </p>
      </header>
      
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">SAE Feature Map</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <FeatureMap 
              data={mapData}
              onPointClick={(point) => {
                console.log("Selected feature:", point);
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Click on features to inspect their properties. Size indicates activation strength.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Neural Controls</h3>
          <div className="space-y-8">
            {neurons.map((neuron) => (
              <div key={neuron.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">{neuron.name}</label>
                  <span className="text-sm font-mono">{Math.round(neuron.value)}%</span>
                </div>
                <div className="flex items-center space-x-6">
                  <Knob 
                    value={neuron.value}
                    onChange={(value) => handleNeuronChange(neuron.id, value)}
                  />
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={neuron.value}
                    onChange={(e) => handleNeuronChange(neuron.id, Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Changes are applied in real-time to the feature map
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Configuration
        </button>
      </div>
    </div>
  );
};

const AdversarialAttack = () => (
  <div className="max-w-2xl mx-auto space-y-12 py-12">
    <header className="space-y-6">
      <h2 className="text-3xl font-serif">Adversarial Attack</h2>
      <p className="text-xl text-gray-600 font-serif">
        Challenge computer vision models through minimal perturbations
      </p>
    </header>
    <div className="text-gray-600">
      Experiment in development...
    </div>
  </div>
);

const Leaderboard = () => (
  <div className="max-w-2xl mx-auto space-y-12 py-12">
    <header className="space-y-6">
      <h2 className="text-3xl font-serif">Research Progress</h2>
      <p className="text-xl text-gray-600 font-serif">
        Tracking experimental outcomes across all participants
      </p>
    </header>
    
    <div className="space-y-6">
      {[1, 2, 3].map((rank) => (
        <div key={rank} className="p-6 bg-gray-50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-serif text-gray-400">0{rank}</span>
              <div>
                <h3 className="font-medium">Researcher {rank}</h3>
                <p className="text-sm text-gray-600">Score: {1000 - rank * 100}</p>
              </div>
            </div>
            {rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = () => (
  <div className="max-w-2xl mx-auto space-y-16 py-12">
    <header className="space-y-6">
      <h1 className="text-4xl font-serif">Carnival ML</h1>
      <p className="text-xl text-gray-600 font-serif">
        A collection of interactive experiments exploring mechanistic interpretability through play
      </p>
    </header>

    <div className="space-y-12">
      {[
        {
          title: "Surgical Simulator",
          icon: <Brain className="h-6 w-6 text-gray-900" />,
          description: "Modify neuron activations to understand and fix model behavior. Explore how small changes in neural pathways affect large-scale outputs.",
          link: "surgical"
        },
        {
          title: "Adversarial Attack",
          icon: <Settings className="h-6 w-6 text-gray-900" />,
          description: "Challenge computer vision models by crafting minimal pixel modifications. Learn about model robustness and vulnerability.",
          link: "adversarial"
        },
        {
          title: "Polysemantic Neuron",
          icon: <Trophy className="h-6 w-6 text-gray-900" />,
          description: "Discover how single neurons can encode multiple concepts. Investigate the fascinating world of neural representation.",
          link: "polysemantic"
        }
      ].map((game, i) => (
        <div key={i} className="group">
          <div className="space-y-4 hover:bg-gray-50 p-6 -mx-6 transition-colors rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                {game.icon}
              </div>
              <h3 className="text-xl font-serif">{game.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{game.description}</p>
            <button className="text-blue-600 font-medium hover:underline">
              Begin experiment →
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NavButton = ({ icon, label, route }) => {
  const [currentRoute, setCurrentRoute] = useState('home');
  const active = currentRoute === route;
  
  return (
    <button
      onClick={() => setCurrentRoute(route)}
      className={`flex items-center space-x-2 py-1 border-b-2 transition-colors
        ${active 
          ? 'border-gray-900 text-gray-900' 
          : 'border-transparent text-gray-500 hover:text-gray-900'}`}
    >
      {React.cloneElement(icon, { className: 'h-4 w-4' })}
      <span className="text-sm">{label}</span>
    </button>
  );
};

const Layout = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState('home');
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-serif">Carnival ML</span>
            </div>
            <div className="flex items-center space-x-6">
              {[
                { icon: <Home />, label: "Home", route: "home" },
                { icon: <Brain />, label: "Simulator", route: "surgical" },
                { icon: <Settings />, label: "Attack", route: "adversarial" },
                { icon: <Trophy />, label: "Progress", route: "leaderboard" }
              ].map((item) => (
                <NavButton key={item.route} {...item} />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-center text-gray-600">
            An experiment in making mechanistic interpretability more accessible
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('surgical');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'surgical':
        return <SurgicalSim />;
      case 'adversarial':
        return <AdversarialAttack />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default App;
