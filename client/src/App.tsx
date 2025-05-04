import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CarnivalLanding from "./components/CarnivalLanding";
import SurgicalSimulator from "./components/SurgicalSimulator";
import FeatureHunt from './components/FeatureHunt';
import AdversarialAttack from './components/AdversarialAttack';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CarnivalLanding />} />
        <Route path="/surgical-simulator" element={<SurgicalSimulator />} />
        <Route path="/adversarial-attack" element={<AdversarialAttack />} />
        <Route path="/feature-hunt" element={<FeatureHunt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;