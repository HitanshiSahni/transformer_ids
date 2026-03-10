import React from 'react';

const ModelStatus = () => {
    return (
        <div className="panel panel-yellow">
            <h2 className="panel-title">SYS_CONFIG :: SPECIFICATIONS</h2>
            <div className="metric-list">
                <div className="metric-item">
                    <span className="metric-label">Neural Core</span>
                    <span className="metric-value">Transformer Encoder IDS</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Dataset Baseline</span>
                    <span className="metric-value">CICIDS-2017</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Feature Vector</span>
                    <span className="metric-value">78 Dimensions</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Calibration Accuracy</span>
                    <span className="metric-value" style={{color: 'var(--brand-cyber-yellow)'}}>~93.12% (Sampled Model)</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Model Status</span>
                    <span className="metric-value" style={{
                        color: 'var(--brand-neon-blue)', 
                        textShadow: 'var(--neon-shadow-blue)'
                    }}>LOADED ONLINE</span>
                </div>
            </div>
        </div>
    );
};

export default ModelStatus;
