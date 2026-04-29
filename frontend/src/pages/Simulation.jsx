import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Terminal } from 'lucide-react';
import { predictTraffic } from '../services/api';
import { attackSequences, benignSequences } from '../services/samples';

const MOCK_IPS = ['192.168.1.12', '10.0.0.6', '172.16.0.4', '192.168.1.8', '8.8.8.8', '10.1.1.50'];
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];

const Simulation = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const tableRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    let timeoutId;
    let mounted = true;

    const streamData = async () => {
      if (!isSimulating || !mounted) return;

      const isAttack = Math.random() > 0.8;
      const sequenceList = isAttack ? attackSequences : benignSequences;
      const randomVector = sequenceList[Math.floor(Math.random() * sequenceList.length)];

      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        src: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        dest: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        status: 'PENDING...',
      };

      setLogs(prev => [...prev, newLog].slice(-15));

      try {
        const result = await predictTraffic(randomVector);
        if (mounted) {
          setLogs(prev => prev.map(log => 
            log.id === newLog.id 
              ? { ...log, status: result.prediction.toUpperCase(), confidence: result.confidence } 
              : log
          ));
        }
      } catch (error) {
        if (mounted) {
          setLogs(prev => prev.map(log => 
            log.id === newLog.id ? { ...log, status: 'ERROR' } : log
          ));
        }
      }

      if (mounted && isSimulating) {
        timeoutId = setTimeout(streamData, 500); // Send request every 500ms
      }
    };

    if (isSimulating) {
      streamData();
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [isSimulating]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="cyber-title"><Activity size={24} style={{ display: 'inline', marginRight: '10px' }} /> LIVE TRAFFIC SIMULATION</h2>
        <div>
          <button 
            className="cyber-button" 
            onClick={() => setIsSimulating(!isSimulating)}
            style={{ marginRight: '1rem', background: isSimulating ? 'var(--neon-red)' : 'var(--neon-green)', color: '#000' }}
          >
            {isSimulating ? 'STOP SIMULATION' : 'START SIMULATION'}
          </button>
          <button className="cyber-button" onClick={() => navigate('/model-test')}>
            TEST MODEL
          </button>
        </div>
      </div>

      <div className="cyber-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: isSimulating ? 'var(--neon-green)' : 'var(--neon-red)' }}>
          <Terminal size={18} style={{ marginRight: '8px' }} /> 
          <span className={isSimulating ? "blink" : ""}>{isSimulating ? 'MONITORING ACTIVE...' : 'MONITORING STOPPED'}</span>
        </div>
        
        <div 
          ref={tableRef}
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid var(--panel-border)',
            background: 'rgba(0,0,0,0.5)'
          }}
        >
          <table className="cyber-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>SRC IP</th>
                <th>DST IP</th>
                <th>PROTOCOL</th>
                <th>PREDICTION</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.time}</td>
                  <td>{log.src}</td>
                  <td>{log.dest}</td>
                  <td style={{ color: 'var(--neon-yellow)' }}>{log.protocol}</td>
                  <td className={
                    log.status === 'ATTACK' ? 'status-attack blink' : 
                    log.status === 'BENIGN' ? 'status-benign' : 
                    'status-pending'
                  }>
                    {log.status} {log.confidence && `(${(log.confidence * 100).toFixed(1)}%)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
