import React, { useState } from 'react';
import { runPrediction } from '../services/api';

const ModelTesting = () => {
    const [status, setStatus] = useState('AWAITING INJECTION...');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleMockRequest = async () => {
        setLoading(true);
        setStatus('GENERATING 78-DIMENSIONAL TENSOR...');
        setResult(null);

        try {
            // Wait slightly for visual effect
            await new Promise(r => setTimeout(r, 600));
            setStatus('CONNECTING TO INFERENCE ENGINE...');
            
            const res = await runPrediction([]); // empty array triggers random backend vector execution
            
            setStatus('INFERENCE COMPLETE');
            setResult({
                prediction: res.prediction,
                confidence: (res.confidence * 100).toFixed(2),
                isAttack: res.prediction.includes('Attack') || res.prediction.includes('Suspicious')
            });

        } catch (error) {
            setStatus(error?.message ? `FATAL: 0x44 API OFFLINE (${error.message})` : 'FATAL: 0x44 API OFFLINE');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel panel-pink">
            <h2 className="panel-title">MODEL TESTING MODE</h2>
            <p style={{ color: '#ccc', marginBottom: '25px', lineHeight: '1.5' }}>
                Manually push an anomaly signature through the active PyTorch pipeline to evaluate structural integrity and inference latency.
            </p>
            
            <button 
                className="cyber-btn" 
                onClick={handleMockRequest}
                disabled={loading}
                style={{ width: '100%', marginBottom: '20px' }}
            >
                {loading ? 'CALCULATING...' : 'GENERATE RANDOM FLOW & RUN'}
            </button>

            <div className="terminal">
                <p>&gt; EXECUTION STATUS: <span style={{color: 'var(--brand-cyber-yellow)'}}>{status}</span></p>
                {result && (
                    <div style={{ marginTop: '15px' }}>
                        <p className={result.isAttack ? 'log-alert' : 'log-success'} style={{fontSize: '1.2rem'}}>
                            &gt;&gt; PREDICTION: {result.prediction.toUpperCase()} &lt;&lt;
                        </p>
                        <p className={result.isAttack ? 'log-alert' : 'log-success'} style={{fontSize: '1.2rem'}}>
                            &gt;&gt; CONFIDENCE: {result.confidence}% &lt;&lt;
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModelTesting;
