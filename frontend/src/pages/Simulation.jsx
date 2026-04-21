import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Terminal } from 'lucide-react';

const MOCK_IPS = ['192.168.1.12', '10.0.0.6', '172.16.0.4', '192.168.1.8', '8.8.8.8', '10.1.1.50'];
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];

const Simulation = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    // Initial logs
    setLogs([
      { id: 1, time: new Date().toLocaleTimeString(), src: '192.168.1.12', dest: '172.16.0.4', protocol: 'TCP', status: 'BENIGN' },
      { id: 2, time: new Date().toLocaleTimeString(), src: '10.0.0.6', dest: '192.168.1.8', protocol: 'UDP', status: 'ATTACK' }
    ]);

    const interval = setInterval(() => {
      const isAttack = Math.random() > 0.8;
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        src: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        dest: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        status: isAttack ? 'ATTACK' : 'BENIGN'
      };

      setLogs(prev => {
        const updated = [...prev, newLog];
        // Keep only last 15 logs
        return updated.slice(-15);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="cyber-title"><Activity size={24} style={{ display: 'inline', marginRight: '10px' }} /> LIVE TRAFFIC SIMULATION</h2>
        <button className="cyber-button" onClick={() => navigate('/model-test')}>
          TEST MODEL
        </button>
      </div>

      <div className="cyber-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--neon-green)' }}>
          <Terminal size={18} style={{ marginRight: '8px' }} /> 
          <span className="blink">MONITORING ACTIVE...</span>
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
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.time}</td>
                  <td>{log.src}</td>
                  <td>{log.dest}</td>
                  <td style={{ color: 'var(--neon-yellow)' }}>{log.protocol}</td>
                  <td className={log.status === 'ATTACK' ? 'status-attack blink' : 'status-benign'}>
                    {log.status}
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
