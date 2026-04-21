import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Network, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div className="cyber-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
        <h1 className="cyber-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Transformer-Based Real-Time<br/>Network Anomaly Detection
        </h1>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          High-Speed Traffic Streams // CICIDS2017 Dataset
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '3rem' }}>
          <div style={{ padding: '20px', border: '1px solid var(--neon-blue-dim)', background: 'rgba(0, 243, 255, 0.05)' }}>
            <Network size={40} color="var(--neon-blue)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--neon-blue)' }}>78 FEATURES</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Comprehensive network flow analysis per packet</p>
          </div>
          <div style={{ padding: '20px', border: '1px solid var(--neon-yellow)', background: 'rgba(255, 250, 0, 0.05)' }}>
            <Zap size={40} color="var(--neon-yellow)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--neon-yellow)' }}>TRANSFORMER ID</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Encoder-Only architecture tailored for seq classification</p>
          </div>
          <div style={{ padding: '20px', border: '1px solid var(--neon-green)', background: 'rgba(0, 255, 102, 0.05)' }}>
            <Shield size={40} color="var(--neon-green)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--neon-green)' }}>REAL-TIME</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Milliseconds latency for anomaly detection pipeline</p>
          </div>
        </div>
        
        <p style={{ marginBottom: '3rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
          This system uses an advanced Transformer Encoder model trained on the CICIDS2017 dataset to classify network traffic flows as benign or suspicious with high precision.
        </p>

        <button 
          className="cyber-button" 
          onClick={() => navigate('/simulation')}
          style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}
        >
          ENTER SYSTEM
        </button>
      </div>
    </div>
  );
};

export default Landing;
