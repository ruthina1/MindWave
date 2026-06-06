'use client';

import { useState } from 'react';
import { 
  Activity, Search, Filter, AlertTriangle, Bed, Smile, 
  Frown, Flame, HelpCircle, Heart, Battery, BatteryWarning, 
  Wifi, WifiOff, ArrowUpRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

interface Inpatient {
  id: string;
  patientId: string;
  name: string;
  room: string;
  state: string;
  severity: number;
  battery: number;
  hr: number;
}

export default function WardLiveView() {
  const [inpatients, setInpatients] = useState<Inpatient[]>([
    { id: 'MW-001', patientId: 'u1', name: 'James K.', room: 'Room 402A', state: 'STABLE', severity: 2, battery: 88, hr: 72 },
    { id: 'MW-002', patientId: 'u1', name: 'Sarah L.', room: 'Room 402B', state: 'ANXIOUS', severity: 6, battery: 92, hr: 88 },
    { id: 'MW-003', patientId: 'u1', name: 'Robert M.', room: 'Room 405A', state: 'CRITICAL', severity: 9, battery: 45, hr: 110 },
    { id: 'MW-004', patientId: 'u1', name: 'Emily W.', room: 'Room 405B', state: 'STABLE', severity: 1, battery: 100, hr: 65 },
    { id: 'MW-005', patientId: 'u1', name: 'Michael T.', room: 'Room 408A', state: 'DEPRESSED', severity: 5, battery: 12, hr: 60 },
    { id: 'MW-006', patientId: 'u1', name: 'Unknown', room: 'Room 408B', state: 'OFFLINE', severity: 0, battery: 0, hr: 0 },
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ALERTS' | 'OFFLINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getStateIcon = (state: string, size = 16) => {
    switch (state.toUpperCase()) {
      case 'STABLE':
        return <Smile size={size} color="var(--calm)" />;
      case 'ANXIOUS':
        return <AlertTriangle size={size} color="var(--anxious)" />;
      case 'DEPRESSED':
        return <Frown size={size} color="var(--depressed)" />;
      case 'CRITICAL':
        return <Flame size={size} color="var(--angry)" />;
      default:
        return <HelpCircle size={size} color="var(--text-secondary)" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case 'CRITICAL': return 'var(--angry)';
      case 'ANXIOUS': return 'var(--anxious)';
      case 'DEPRESSED': return 'var(--depressed)';
      case 'STABLE': return 'var(--calm)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStateBg = (state: string) => {
    switch (state.toUpperCase()) {
      case 'CRITICAL': return 'rgba(239, 68, 68, 0.08)';
      case 'ANXIOUS': return 'rgba(245, 158, 11, 0.08)';
      case 'DEPRESSED': return 'rgba(124, 58, 237, 0.08)';
      case 'STABLE': return 'rgba(16, 185, 129, 0.08)';
      default: return 'var(--bg-tertiary)';
    }
  };

  // Render high-fidelity SVG Brainwave sparkline based on emotional state
  const renderBciWaveform = (state: string, color: string) => {
    if (state === 'OFFLINE') {
      return (
        <svg width="100%" height="28" viewBox="0 0 240 28" style={{ opacity: 0.2 }}>
          <line x1="0" y1="14" x2="240" y2="14" stroke="var(--text-secondary)" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    }

    let pathD = '';
    if (state === 'CRITICAL') {
      pathD = "M 0 14 L 30 14 L 35 4 L 40 24 L 45 14 L 75 14 L 80 0 L 85 28 L 90 14 L 130 14 L 135 4 L 140 24 L 145 14 L 175 14 L 180 0 L 185 28 L 190 14 L 240 14";
    } else if (state === 'ANXIOUS') {
      pathD = "M 0 14 L 20 14 L 25 8 L 30 20 L 35 14 L 60 14 L 65 6 L 70 22 L 75 14 L 110 14 L 115 8 L 120 20 L 125 14 L 150 14 L 155 6 L 160 22 L 165 14 L 240 14";
    } else if (state === 'DEPRESSED') {
      pathD = "M 0 14 Q 15 11 30 14 T 60 14 T 90 14 T 120 14 T 150 14 T 180 14 T 210 14 T 240 14";
    } else { // STABLE
      pathD = "M 0 14 L 50 14 L 55 17 L 60 11 L 65 14 L 130 14 L 135 17 L 140 11 L 145 14 L 240 14";
    }

    return (
      <svg width="100%" height="28" viewBox="0 0 240 28" style={{ overflow: 'visible' }}>
        <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Render circular severity SVG indicator
  const renderCircularGauge = (severity: number, color: string) => {
    const radius = 14;
    const circ = 2 * Math.PI * radius;
    const strokeOffset = circ - (severity / 10) * circ;

    return (
      <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="3.5" />
          <circle 
            cx="18" 
            cy="18" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="3.5" 
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <span style={{ position: 'absolute', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {severity}
        </span>
      </div>
    );
  };

  const handleAcknowledge = (id: string) => {
    setInpatients(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, state: 'STABLE', severity: 2 };
      }
      return p;
    }));
  };

  const filteredInpatients = inpatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ALERTS') {
      return matchesSearch && (p.state === 'CRITICAL' || p.state === 'ANXIOUS');
    }
    if (activeFilter === 'OFFLINE') {
      return matchesSearch && p.state === 'OFFLINE';
    }
    return matchesSearch;
  });

  const activeCount = inpatients.filter(p => p.state !== 'OFFLINE').length;
  const alertCount = inpatients.filter(p => p.state === 'CRITICAL' || p.state === 'ANXIOUS').length;

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)' }}>
          Ward BCI Telemetry View
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Real-time emotional distress monitoring and electrode connection metrics for Floor 4 wards.
        </p>
      </div>

      {/* Ward Telemetry Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px', color: 'var(--accent)' }}>
            <Bed size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Total Patients</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{inpatients.length} Patients</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px', borderRadius: '8px', color: 'var(--calm)' }}>
            <Wifi size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>BCI Active</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{activeCount} connected</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: alertCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)', padding: '8px', borderRadius: '8px', color: alertCount > 0 ? 'var(--angry)' : 'var(--text-secondary)' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Distress Warnings</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: alertCount > 0 ? 'var(--angry)' : 'inherit' }}>
              {alertCount} active flags
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px', borderRadius: '8px', color: 'var(--calm)' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>System Status</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--calm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Nominal
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveFilter('ALL')}
            className={`badge-outline ${activeFilter === 'ALL' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
          >
            All Wards
          </button>
          <button 
            onClick={() => setActiveFilter('ALERTS')}
            className={`badge-outline ${activeFilter === 'ALERTS' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
          >
            Distress Alerts
            {alertCount > 0 && (
              <span style={{ background: 'var(--angry)', color: 'white', padding: '1px 5px', borderRadius: '99px', fontSize: '10px' }}>
                {alertCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveFilter('OFFLINE')}
            className={`badge-outline ${activeFilter === 'OFFLINE' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
          >
            Offline Devices
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search ward or patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '8px 12px 8px 32px', borderRadius: '6px', border: 'none', 
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '240px', fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredInpatients.map((patient) => {
          const isOffline = patient.state === 'OFFLINE';
          const isDistressed = patient.state === 'CRITICAL' || patient.state === 'ANXIOUS';
          const stateColor = getStateColor(patient.state);
          const stateBg = getStateBg(patient.state);

          return (
            <div 
              key={patient.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                border: 'none', 
                background: 'white',
                boxShadow: isDistressed ? '0 4px 24px rgba(239, 68, 68, 0.04)' : '0 4px 16px rgba(0,0,0,0.01)',
                padding: '20px',
                position: 'relative'
              }}
            >
              {/* Card Header: Patient and Connection Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {patient.name}
                    </h3>
                    {/* Live status blinker */}
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: stateColor,
                      animation: isOffline ? 'none' : 'pulse 2s infinite',
                      boxShadow: isOffline ? 'none' : `0 0 6px ${stateColor}`
                    }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                    <Bed size={12} /> {patient.room}
                  </div>
                </div>

                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  background: stateBg, 
                  color: stateColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {patient.state}
                </span>
              </div>

              {/* Mini Sparkline EEG Telemetry */}
              <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  <span>Live EEG Waveform</span>
                  <span>{isOffline ? 'No signal' : 'BCI Active'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                  {renderBciWaveform(patient.state, stateColor)}
                </div>
              </div>

              {/* Status metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                {/* Severity Circular Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderCircularGauge(patient.severity, stateColor)}
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', lineHeight: '1.2' }}>
                    Severity<br/>Score
                  </span>
                </div>

                {/* Heart Rate */}
                <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>Heart Rate</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Heart size={11} color="var(--angry)" fill={patient.hr > 0 ? "var(--angry)" : "none"} />
                    {isOffline ? '--' : `${patient.hr} bpm`}
                  </div>
                </div>

                {/* Battery */}
                <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>Battery</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: patient.battery < 20 ? 'var(--angry)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {patient.battery < 20 ? <BatteryWarning size={12} color="var(--angry)" /> : <Battery size={12} color="var(--text-secondary)" />}
                    {isOffline ? '--' : `${patient.battery}%`}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {isDistressed ? (
                  <button 
                    onClick={() => handleAcknowledge(patient.id)}
                    className="badge-outline active" 
                    style={{ flex: 1.2, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'var(--accent)', color: 'white', border: 'none' }}
                  >
                    Acknowledge Alert
                  </button>
                ) : null}
                <Link 
                  href={isOffline ? '#' : `/patients/${patient.patientId}`} 
                  className="badge-outline" 
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '4px',
                    opacity: isOffline ? 0.5 : 1,
                    pointerEvents: isOffline ? 'none' : 'auto'
                  }}
                >
                  View Details <ArrowUpRight size={13} />
                </Link>
              </div>

              {/* Pulsing CSS Animation (inlined via standard style tag inside component) */}
              <style jsx global>{`
                @keyframes pulse {
                  0% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
                  }
                  70% {
                    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
                  }
                  100% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                  }
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}
