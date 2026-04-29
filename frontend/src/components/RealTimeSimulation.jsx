import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://127.0.0.1:5000';
const MAX_ITEMS = 50;

const RealTimeSimulation = () => {
  const [packets, setPackets] = useState([]);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, safe: 0, anomaly: 0 });
  const socketRef = useRef(null);
  const tableBodyRef = useRef(null);

  /* ── Connect to Flask-SocketIO on mount ───────── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[socket] connected');
      setConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('[socket] disconnected');
      setConnected(false);
    });

    socket.on('live-traffic', (data) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        src_ip: data.src_ip || '?.?.?.?',
        dst_ip: data.dst_ip || '?.?.?.?',
        port: data.port || 0,
        confidence: data.confidence || 0,
        verdict: data.verdict,
        timestamp: data.timestamp,
        isAnomaly: data.verdict === 'Anomaly',
        _new: true,
      };

      setPackets((prev) => [entry, ...prev].slice(0, MAX_ITEMS));
      setStats((prev) => ({
        total: prev.total + 1,
        safe: prev.safe + (entry.isAnomaly ? 0 : 1),
        anomaly: prev.anomaly + (entry.isAnomaly ? 1 : 0),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ── Clear "new" flag after entrance animation ── */
  useEffect(() => {
    if (packets.length === 0) return;
    const timer = setTimeout(() => {
      setPackets((prev) =>
        prev.map((p) => (p._new ? { ...p, _new: false } : p))
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [packets]);

  /* ── Derived stats ───────────────────────────── */
  const anomalyRate =
    stats.total > 0
      ? ((stats.anomaly / stats.total) * 100).toFixed(1)
      : '0.0';

  const threatLevel = useMemo(() => {
    const rate = stats.total > 0 ? stats.anomaly / stats.total : 0;
    if (rate > 0.3)
      return { label: 'CRITICAL', color: '#ff003c', glow: 'rgba(255,0,60,0.4)' };
    if (rate > 0.1)
      return { label: 'ELEVATED', color: '#fffa00', glow: 'rgba(255,250,0,0.3)' };
    return { label: 'NOMINAL', color: '#00ff66', glow: 'rgba(0,255,102,0.3)' };
  }, [stats]);

  /* ── Format ISO timestamp ────────────────────── */
  const fmtTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
    } catch {
      return iso || '--:--:--';
    }
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ─── Header bar ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <h2 className="cyber-title" style={{ marginBottom: 0 }}>
            <span style={{
              color: '#00ff66',
              textShadow: '0 0 8px #00ff66',
              marginRight: 6,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}>◉</span>
            LIVE NETWORK FEED
          </h2>

          {/* Connection badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: '0.7rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            border: '1px solid',
            color: connected ? '#00ff66' : '#ff003c',
            borderColor: connected ? 'rgba(0,255,102,0.35)' : 'rgba(255,0,60,0.35)',
            background: connected ? 'rgba(0,255,102,0.06)' : 'rgba(255,0,60,0.06)',
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'currentColor',
              boxShadow: '0 0 6px currentColor',
              display: 'inline-block',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* ─── Stat cards ─────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.75rem',
      }}>
        {/* Flows Analysed */}
        <StatCard label="FLOWS ANALYSED" value={stats.total} color="#00f3ff" />
        {/* Safe */}
        <StatCard label="SAFE" value={stats.safe} color="#00ff66" />
        {/* Anomalies */}
        <StatCard label="ANOMALIES" value={stats.anomaly} color="#ff003c" />
        {/* Anomaly Rate */}
        <StatCard label="ANOMALY RATE" value={`${anomalyRate}%`} color={threatLevel.color} />
        {/* Threat Level */}
        <div style={{
          ...statCardBase,
          borderColor: threatLevel.color,
          borderWidth: 2,
          boxShadow: `0 0 18px ${threatLevel.glow}`,
        }}>
          <span style={statLabelStyle}>THREAT LEVEL</span>
          <span style={{
            ...statValueStyle,
            color: threatLevel.color,
            textShadow: `0 0 12px ${threatLevel.glow}`,
          }}>
            {threatLevel.label}
          </span>
        </div>
      </div>

      {/* ─── Traffic table ──────────────────────── */}
      <div className="cyber-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div ref={tableBodyRef} style={{ maxHeight: 520, overflowY: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr>
                {['TIME', 'VERDICT', 'SOURCE', '', 'DESTINATION', 'PORT', 'CONFIDENCE'].map(
                  (h, i) => (
                    <th key={i} style={{
                      ...thStyle,
                      width: colWidths[i],
                      textAlign: i === 3 ? 'center' : 'left',
                    }}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {packets.length === 0 && (
                <tr>
                  <td colSpan={7} style={{
                    textAlign: 'center',
                    padding: '3rem 0',
                    color: 'rgba(0,243,255,0.35)',
                    letterSpacing: 2,
                    fontSize: '0.85rem',
                  }}>
                    <span className="blink">▌</span> Awaiting live traffic …
                  </td>
                </tr>
              )}

              {packets.map((p) => (
                <tr
                  key={p.id}
                  className={p._new ? (p.isAnomaly ? 'row-anomaly-enter' : 'row-safe-enter') : ''}
                  style={{
                    background: p.isAnomaly
                      ? 'rgba(255,0,60,0.04)'
                      : 'transparent',
                    transition: 'background 0.3s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = p.isAnomaly
                      ? 'rgba(255,0,60,0.10)'
                      : 'rgba(0,255,102,0.03)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = p.isAnomaly
                      ? 'rgba(255,0,60,0.04)'
                      : 'transparent')
                  }
                >
                  {/* TIME */}
                  <td style={{ ...tdStyle, color: 'rgba(0,184,255,0.6)', fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem' }}>
                    {fmtTime(p.timestamp)}
                  </td>

                  {/* VERDICT */}
                  <td style={tdStyle}>
                    {p.isAnomaly ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 12px',
                        borderRadius: 3,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        letterSpacing: '1.5px',
                        color: '#ff003c',
                        background: 'rgba(255,0,60,0.12)',
                        border: '1px solid rgba(255,0,60,0.35)',
                        animation: 'badge-pulse 2s ease-in-out infinite',
                      }}>
                        <span style={{ fontSize: '0.85rem' }}>⚠</span> ANOMALY
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 12px',
                        borderRadius: 3,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        letterSpacing: '1.5px',
                        color: '#00ff66',
                        background: 'rgba(0,255,102,0.08)',
                        border: '1px solid rgba(0,255,102,0.2)',
                      }}>
                        SAFE
                      </span>
                    )}
                  </td>

                  {/* SOURCE */}
                  <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
                    {p.src_ip}
                  </td>

                  {/* ARROW */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: 'rgba(0,243,255,0.25)', fontSize: '0.9rem' }}>
                    →
                  </td>

                  {/* DESTINATION */}
                  <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
                    {p.dst_ip}
                  </td>

                  {/* PORT */}
                  <td style={{ ...tdStyle, color: '#fffa00', fontWeight: 'bold' }}>
                    {p.port}
                  </td>

                  {/* CONFIDENCE BAR */}
                  <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      flex: 1,
                      height: 5,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: 3,
                        width: `${(p.confidence * 100).toFixed(0)}%`,
                        background: p.isAnomaly
                          ? 'linear-gradient(90deg, #ff003c, #ff4466)'
                          : 'linear-gradient(90deg, #00ff66, #00ccaa)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{
                      minWidth: 46,
                      textAlign: 'right',
                      fontSize: '0.72rem',
                      color: 'rgba(224,248,255,0.55)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
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

/* ─── Reusable Stat Card sub-component ─────── */
const statCardBase = {
  background: 'rgba(5,5,16,0.85)',
  border: '1px solid rgba(0,243,255,0.3)',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  backdropFilter: 'blur(6px)',
  transition: 'box-shadow 0.3s ease',
};

const statLabelStyle = {
  fontSize: '0.6rem',
  letterSpacing: 2,
  color: 'rgba(224,248,255,0.45)',
  textTransform: 'uppercase',
};

const statValueStyle = {
  fontSize: '1.55rem',
  fontWeight: 'bold',
  letterSpacing: 1,
};

const StatCard = ({ label, value, color }) => (
  <div style={statCardBase}>
    <span style={statLabelStyle}>{label}</span>
    <span style={{ ...statValueStyle, color }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  </div>
);

/* ─── Shared inline style constants ────────── */
const thStyle = {
  background: 'rgba(0,15,30,0.95)',
  color: 'rgba(0,243,255,0.7)',
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  letterSpacing: 2,
  padding: '12px 14px',
  textAlign: 'left',
  borderBottom: '1px solid #00f3ff',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 14px',
  fontSize: '0.82rem',
  borderBottom: '1px solid rgba(0,243,255,0.06)',
  verticalAlign: 'middle',
};

const colWidths = ['10%', '14%', '20%', '3%', '20%', '8%', '25%'];

export default RealTimeSimulation;
