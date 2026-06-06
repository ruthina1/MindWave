'use client';

import { useState } from 'react';
import { BellRing, ShieldAlert, Filter, Clock, Activity, Heart, ArrowRight, MapPin, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface AlertItem {
  id: number;
  type: string;
  patientId: string;
  patient: string;
  message: string;
  time: string;
  room: string;
  severity: number;
  hr: number;
  state: string;
  sensor: string;
}

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, type: 'CRITICAL', patientId: 'u1', patient: 'Robert M.', message: 'Sustained severity level 9 for over 20 minutes. Nurse dispatched.', time: '10 mins ago', room: 'Room 405A', severity: 9, hr: 110, state: 'CRITICAL', sensor: 'Good' },
    { id: 2, type: 'WARNING', patientId: 'u1', patient: 'Abenezer Tadesse', message: 'Morning anxiety spike detected. Intervention played.', time: '2 hours ago', room: 'Outpatient', severity: 6, hr: 88, state: 'ANXIOUS', sensor: 'Good' },
    { id: 3, type: 'SYSTEM', patientId: 'u1', patient: 'Michael T.', message: 'Device battery below 15%.', time: '5 hours ago', room: 'Room 408A', severity: 3, hr: 62, state: 'DEPRESSED', sensor: 'Weak' },
  ]);

  const [selectedAlertId, setSelectedAlertId] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>('ALL');

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const handleDismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering selection
    const updatedAlerts = alerts.filter(a => a.id !== id);
    setAlerts(updatedAlerts);
    if (selectedAlertId === id && updatedAlerts.length > 0) {
      setSelectedAlertId(updatedAlerts[0].id);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL') return a.type === 'CRITICAL';
    return true;
  });

  const getAlertColor = (type: string) => {
    if (type === 'CRITICAL') return 'var(--angry)';
    if (type === 'WARNING') return 'var(--stressed)';
    return 'var(--text-secondary)';
  };

  const getAlertBg = (type: string) => {
    if (type === 'CRITICAL') return 'rgba(239, 68, 68, 0.04)';
    if (type === 'WARNING') return 'rgba(245, 158, 11, 0.04)';
    return 'var(--bg-tertiary)';
  };

  // Render static SVG wave snapshot of the BCI brainwave spike
  const renderBciWaveSnapshot = (type: string) => {
    if (type === 'CRITICAL') {
      return (
        <svg viewBox="0 0 400 60" style={{ width: '100%', height: '60px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
          <path d="M 0 30 L 50 30 L 70 15 L 85 45 L 100 5 L 115 55 L 130 10 L 145 50 L 160 25 L 175 35 L 190 30 L 400 30" stroke="var(--angry)" strokeWidth="2" fill="none" />
        </svg>
      );
    }
    if (type === 'WARNING') {
      return (
        <svg viewBox="0 0 400 60" style={{ width: '100%', height: '60px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
          <path d="M 0 30 Q 30 10 60 30 T 120 30 T 180 30 T 240 30 T 300 30 T 360 30 T 400 30" stroke="var(--stressed)" strokeWidth="2" fill="none" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 400 60" style={{ width: '100%', height: '60px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
        <path d="M 0 30 L 120 30 L 125 35 L 130 25 L 135 30 L 400 30" stroke="var(--text-secondary)" strokeWidth="2" fill="none" />
      </svg>
    );
  };

  return (
    <div>
      {/* Header and Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)' }}>Alert Feed</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Centralized log of all critical patient and system events.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFilterType('ALL')}
            className={`badge-outline ${filterType === 'ALL' ? 'active' : ''}`} 
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: 'none' }}
          >
            All Alerts
          </button>
          <button 
            onClick={() => setFilterType('CRITICAL')}
            className={`badge-outline ${filterType === 'CRITICAL' ? 'active' : ''}`} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: 'none' }}
          >
            <ShieldAlert size={14} /> Critical Only
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          <BellRing size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          No active alerts in the feed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'start' }}>
          
          {/* Left Panel: Alerts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId;
              return (
                <div 
                  key={alert.id} 
                  onClick={() => setSelectedAlertId(alert.id)}
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'flex-start', 
                    padding: '14px 16px', 
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-glow)' : 'white',
                    border: 'none',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ 
                    background: getAlertBg(alert.type), 
                    padding: '8px', borderRadius: '50%', flexShrink: 0 
                  }}>
                    <BellRing size={16} color={getAlertColor(alert.type)} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {alert.patient}
                      </h3>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {alert.time}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                      {alert.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: getAlertBg(alert.type), color: getAlertColor(alert.type), fontSize: '10px', padding: '3px 8px' }}>
                        {alert.type}
                      </span>
                      <button 
                        onClick={(e) => handleDismiss(alert.id, e)}
                        className="badge-outline" 
                        style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredAlerts.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '16px' }}>No alerts match the filter.</p>
            )}
          </div>
          
          {/* Right Panel: Selected Alert Inspector Detail */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Inspector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: 'none', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge" style={{ background: getAlertBg(selectedAlert.type), color: getAlertColor(selectedAlert.type), fontSize: '10px', fontWeight: 'bold' }}>
                    {selectedAlert.type}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {selectedAlert.room}
                  </div>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedAlert.patient}</h2>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Logged: {selectedAlert.time}
              </span>
            </div>

            {/* Alert Message Log */}
            <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{selectedAlert.message}</p>
            </div>

            {/* Simulated Live Telemetry Log */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Severity Score</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: getAlertColor(selectedAlert.type), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Activity size={14} /> {selectedAlert.severity} <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/10</span>
                </div>
              </div>
              
              <div style={{ padding: '10px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Heart Rate</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Heart size={14} color="var(--angry)" /> {selectedAlert.hr} <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>BPM</span>
                </div>
              </div>

              <div style={{ padding: '10px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>BCI Sensor</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--calm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Activity size={14} /> {selectedAlert.sensor}
                </div>
              </div>
            </div>

            {/* Brainwave Spike Snapshot preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BCI Waveform Snapshot (At Incident)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EEG streaming</span>
              </div>
              {renderBciWaveSnapshot(selectedAlert.type)}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Link href={`/patients/${selectedAlert.patientId}`} style={{ 
                flex: 1, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px', 
                color: 'white', 
                background: 'var(--accent)', 
                fontWeight: '600', 
                padding: '10px', 
                borderRadius: '6px', 
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}>
                View Live Telemetry <ArrowRight size={14} />
              </Link>
              <button 
                onClick={(e) => handleDismiss(selectedAlert.id, e)}
                className="badge-outline" 
                style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}
              >
                Acknowledge & Dismiss
              </button>
            </div>
            
          </div>
          
        </div>
      )}
    </div>
  );
}
