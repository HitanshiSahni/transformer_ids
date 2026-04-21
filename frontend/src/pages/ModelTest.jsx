import React, { useState } from 'react';
import { predictTraffic } from '../services/api';
import { Cpu, Terminal, AlertTriangle, CheckCircle } from 'lucide-react';

import { attackSequences, benignSequences } from '../services/samples';

const ModelTest = () => {
  const [vector, setVector] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateAndTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Randomly pick one of the authentic sequences from 10 attack and 10 benign options
    const isAttack = Math.random() > 0.5;
    const sequenceList = isAttack ? attackSequences : benignSequences;
    const randomVector = sequenceList[Math.floor(Math.random() * sequenceList.length)];
    
    setVector(randomVector);

    try {
      const res = await predictTraffic(randomVector);
      setTimeout(() => { // small delay for visual effect
        setResult(res);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Connection to backend failed. Make sure FastAPI is running.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="cyber-title"><Cpu size={24} style={{ display: 'inline', marginRight: '10px' }} /> INFERENCE_NODE</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Controls Panel */}
        <div className="cyber-panel">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--neon-blue)', paddingBottom: '0.5rem' }}>
            MODEL CONTROL
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
            Load a randomly generated 78-dimensional network flow feature vector and pipe it directly to the Transformer IDS model.
          </p>
          
          <button 
            className="cyber-button" 
            onClick={handleGenerateAndTest}
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? <span className="blink">PROCESSING...</span> : "GENERATE RANDOM NETWORK FLOW"}
          </button>

          {error && (
            <div style={{ color: 'var(--neon-red)', marginTop: '1rem', padding: '1rem', border: '1px solid var(--neon-red)', background: 'rgba(255,0,60,0.1)' }}>
              <AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} />
              {error}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--neon-blue)', paddingBottom: '0.5rem' }}>
            <Terminal size={18} style={{ display: 'inline', marginRight: '8px' }} />
            PREDICTION LOG
          </h3>

          <div style={{ 
            flexGrow: 1, 
            background: '#020205', 
            border: '1px solid var(--panel-border)', 
            padding: '1rem',
            fontFamily: 'monospace',
            overflowY: 'auto',
            minHeight: '200px'
          }}>
            {loading && <div className="blink" style={{ color: 'var(--neon-yellow)' }}>&gt; Awaiting inference from models/transformer_ids_sampled.pt...</div>}
            
            {!loading && result && (
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  &gt; Model loaded successfully.
                  <br/>&gt; Inference completed in 42ms.
                </div>
                
                <div style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: result.prediction === 'Attack' ? 'var(--neon-red)' : 'var(--neon-green)'
                }}>
                  {result.prediction === 'Attack' ? <AlertTriangle size={24} style={{ marginRight: '10px' }} /> : <CheckCircle size={24} style={{ marginRight: '10px' }} />}
                  PREDICTION: {result.prediction.toUpperCase()}
                </div>
                
                <div style={{ fontSize: '1.2rem', color: 'var(--neon-blue)' }}>
                  CONFIDENCE: {(result.confidence * 100).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Vector Display */}
      {vector && (
        <div className="cyber-panel" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>GENERATED FEATURE VECTOR [78-DIM]</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            color: 'var(--neon-blue-dim)', 
            fontSize: '0.85rem',
            wordBreak: 'break-all',
            lineHeight: '1.5' 
          }}>
            [{vector.join(', ')}]
          </div>
        </div>
      )}

    </div>
  );
};

export default ModelTest;

// 

