'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp, ChevronRight, Smile, Frown, Flame, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const getStateIcon = (state: string, size = 18) => {
  switch (state.toUpperCase()) {
    case 'CALM':
      return <Smile size={size} color="var(--calm)" />;
    case 'STRESSED':
      return <Frown size={size} color="var(--stressed)" />;
    case 'ANXIOUS':
      return <AlertTriangle size={size} color="var(--anxious)" />;
    case 'DEPRESSED':
      return <Frown size={size} color="var(--depressed)" />;
    case 'ANGRY':
      return <Flame size={size} color="var(--angry)" />;
    default:
      return <HelpCircle size={size} color="var(--text-secondary)" />;
  }
};

const getStateColor = (state: string) => {
  switch (state.toUpperCase()) {
    case 'CALM': return 'var(--calm)';
    case 'STRESSED': return 'var(--stressed)';
    case 'ANXIOUS': return 'var(--anxious)';
    case 'DEPRESSED': return 'var(--depressed)';
    case 'ANGRY': return 'var(--angry)';
    default: return 'var(--text-secondary)';
  }
};

export default function DashboardOverview() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Dr. Amanuel Bekele');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/users/d1`);
        if (res.ok) {
          const data = await res.json();
          const nameParts = data.name.split(' ');
          const lastName = nameParts[nameParts.length - 1];
          setDoctorName(nameParts[0].startsWith('Dr.') ? data.name : `Dr. ${lastName}`);
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err);
      }
    };
    
    fetchDoctor();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/patients?doctorId=d1`);
        if (res.ok) {
          setPatients(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch patients', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
    const interval = setInterval(fetchPatients, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPatients = patients.length;
  const criticalAlerts = patients.filter(p => p.severity > 5).length;
  const activeMonitors = patients.filter(p => p.status === 'Live Access').length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)' }}>
          Welcome back, {doctorName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Here is the live overview of your patients.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        <div className="card stat-card">
          <div className="stat-icon">
            <Users size={20} color="var(--accent)" />
          </div>
          <div className="stat-value">{isLoading ? '-' : totalPatients}</div>
          <div className="stat-label">Total Patients</div>
          <div style={{ fontSize: '11px', color: 'var(--calm)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +2 this week
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <AlertTriangle size={20} color="var(--angry)" />
          </div>
          <div className="stat-value">{isLoading ? '-' : criticalAlerts}</div>
          <div className="stat-label">Critical Alerts</div>
          <div style={{ fontSize: '11px', color: 'var(--angry)', marginTop: '4px' }}>
            Requires immediate attention
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Activity size={20} color="var(--accent)" />
          </div>
          <div className="stat-value">{isLoading ? '-' : activeMonitors}</div>
          <div className="stat-label">Live BCI Monitors</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Actively streaming data
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Alerts (Live)</h2>
            <Link href="/patients" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '600' }}>View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isLoading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading alerts...</p>
            ) : patients.filter(p => p.severity > 5).length > 0 ? (
              patients.filter(p => p.severity > 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: 'none', borderRadius: '6px', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getStateColor(p.state) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getStateIcon(p.state, 18)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{p.name} - Elevated Stress</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Severity: {p.severity} • Currently {p.state}
                      </div>
                    </div>
                  </div>
                  <Link href={`/patients/${p.id}`} className="badge-outline" style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px' }}>
                    Review AI Report
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No active alerts.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="badge-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', textAlign: 'left' }}>
              + Add New Patient
            </button>
            <button className="badge-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', textAlign: 'left' }}>
              Request Consent Scope Change
            </button>
            <button className="badge-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', textAlign: 'left' }}>
              Generate Weekly Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
