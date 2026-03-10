import React, { useState, useEffect } from 'react';
import { runPrediction } from '../services/api';

const RealTimeSimulation = () => {
    const [streams, setStreams] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval;
        if (isActive) {
            // Random interval between 3 to 5 seconds
            interval = setInterval(async () => {
                const srcIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
                const destIp = `10.0.0.${Math.floor(Math.random() * 255)}`;
                
                try {
                    const res = await runPrediction([]);
                    const isAttack = res.prediction.includes('Attack') || res.prediction.includes('Suspicious');
                    
                    const newLog = {
                        id: Date.now(),
                        time: new Date().toLocaleTimeString(),
                        route: `${srcIp} → ${destIp}`,
                        prediction: res.prediction,
                        isAttack: isAttack
                    };

                    setStreams(prev => [newLog, ...prev].slice(0, 5)); // keep last 5
                } catch (e) {
                    console.error("Simulation failed API call", e);
                }
            }, 3500);
        }
        
        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className="panel" style={{ borderLeftColor: isActive ? 'var(--status-ok)' : 'var(--text-muted)'}}>
            <h2 className="panel-title">LIVE NETWORK SIMULATION</h2>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
                Simulate a continuous pipeline of live PCAP traffic hitting the Transformer inference engine every few seconds.
            </p>

            <button 
                className="cyber-btn" 
                onClick={() => setIsActive(!isActive)}
                style={{
                    backgroundColor: isActive ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
                    borderColor: isActive ? 'var(--brand-neon-pink)' : 'var(--brand-cyber-yellow)',
                    color: isActive ? 'var(--brand-neon-pink)' : 'var(--brand-cyber-yellow)'
                }}
            >
                {isActive ? 'HALT SIMULATION' : 'START SIMULATION STREAM'}
            </button>

            <div style={{ marginTop: '20px' }}>
                {streams.length === 0 && <p className="label">Awaiting Stream Initialization...</p>}
                
                {streams.map((log) => (
                    <div 
                        key={log.id} 
                        style={{
                            padding: '15px', 
                            marginBottom: '10px',
                            background: log.isAttack ? 'rgba(255, 0, 60, 0.1)' : 'rgba(0, 240, 255, 0.05)',
                            border: `1px solid ${log.isAttack ? 'var(--brand-neon-pink)' : 'var(--border-subtle)'}`,
                            animation: 'fadeIn 0.3s ease-in'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)'}}>
                                [{log.time}] FLOW DETECTED
                            </span>
                            <span style={{ color: 'var(--brand-neon-blue)', fontWeight: 'bold' }}>
                                {log.route}
                            </span>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            {log.isAttack ? (
                                <span className="log-alert" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚠️</span> ATTACK DETECTED: {log.prediction.toUpperCase()}
                                </span>
                            ) : (
                                <span className="log-success" style={{ fontSize: '1.1rem' }}>
                                    PREDICTION: BENIGN
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealTimeSimulation;
