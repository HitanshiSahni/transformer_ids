import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Cpu } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--neon-blue)',
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Shield color="var(--neon-blue)" size={28} />
        <span style={{ 
          color: 'var(--neon-blue)', 
          fontSize: '1.2rem', 
          fontWeight: 'bold',
          letterSpacing: '2px',
          textShadow: '0 0 8px var(--neon-blue-dim)'
        }}>
          SYS.IDS // CORE
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link 
          to="/" 
          style={{ 
            color: isActive('/') ? 'var(--neon-yellow)' : 'var(--neon-blue)',
            textShadow: isActive('/') ? '0 0 8px var(--neon-yellow)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Shield size={18} /> OVERVIEW
        </Link>
        <Link 
          to="/simulation" 
          style={{ 
            color: isActive('/simulation') ? 'var(--neon-yellow)' : 'var(--neon-blue)',
            textShadow: isActive('/simulation') ? '0 0 8px var(--neon-yellow)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} /> LIVE_SIM
        </Link>
        <Link 
          to="/model-test" 
          style={{ 
            color: isActive('/model-test') ? 'var(--neon-yellow)' : 'var(--neon-blue)',
            textShadow: isActive('/model-test') ? '0 0 8px var(--neon-yellow)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Cpu size={18} /> MODEL_TEST
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
