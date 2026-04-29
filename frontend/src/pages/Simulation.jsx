import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu } from 'lucide-react';
import RealTimeSimulation from '../components/RealTimeSimulation';

const Simulation = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={24} /> LIVE TRAFFIC MONITOR
        </h1>
        <button className="cyber-button" onClick={() => navigate('/model-test')}>
          <Cpu size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          MODEL TEST
        </button>
      </div>
      <RealTimeSimulation />
    </div>
  );
};

export default Simulation;
