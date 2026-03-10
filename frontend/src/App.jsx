import React from 'react';
import ProjectOverview from './components/ProjectOverview';
import ModelStatus from './components/ModelStatus';
import ModelTesting from './components/ModelTesting';
import RealTimeSimulation from './components/RealTimeSimulation';

const App = () => {
  return (
    <>
      <div className="cyber-grid"></div>
      
      <nav>
        <div className="logo">RTIDS // DEMO</div>
        <div style={{color: 'var(--brand-neon-blue)', fontFamily: 'var(--font-mono)'}}>
          NETWORK_SECURITY_NODE: ACTIVE
        </div>
      </nav>

      <main className="container">
        <ProjectOverview />
        
        <div className="dashboard-grid" style={{marginTop: '30px'}}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <ModelStatus />
              <ModelTesting />
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <RealTimeSimulation />
            </div>
        </div>
      </main>
    </>
  );
};

export default App;
