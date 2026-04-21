import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Simulation from './pages/Simulation';
import ModelTest from './pages/ModelTest';

function App() {
  return (
    <Router>
      <div className="scanline"></div>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/model-test" element={<ModelTest />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
