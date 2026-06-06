'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Filter, AlertTriangle, Smile, Frown, Flame, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  state: string;
  severity: number;
  lastReport: string;
  status: string;
}

const getStateIcon = (state: string, size = 14) => {
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

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ALERTS'>('ALL');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/patients?doctorId=d1`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
    const interval = setInterval(fetchPatients, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeClass = (state: string) => {
    if (state === 'UNKNOWN' || state === '—') return '';
    if (state === 'STRESSED' || state === 'ANXIOUS' || state === 'ANGRY') return 'badge-angry';
    return 'badge-calm';
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'ALERTS') {
      return matchesSearch && patient.severity > 5 && patient.status === 'Live Access';
    }
    return matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>My Patients</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveFilter('ALL')}
            className={`badge-outline ${activeFilter === 'ALL' ? 'active' : ''}`} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}
          >
            All Patients
          </button>
          <button 
            onClick={() => setActiveFilter('ALERTS')}
            className={`badge-outline ${activeFilter === 'ALERTS' ? 'active' : ''}`} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}
          >
            Alerts
            <span style={{ background: 'var(--angry)', color: 'white', padding: '1px 6px', borderRadius: '99px', fontSize: '11px', marginLeft: '4px' }}>
              {patients.filter(p => p.severity > 5 && p.status === 'Live Access').length}
            </span>
          </button>
          <button className="badge-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
            <Filter size={14} /> Filters
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '10px 12px 10px 36px', borderRadius: '6px', border: 'none', 
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '240px', fontSize: '13px',
              outline: 'none', transition: 'border-color 0.2s ease'
            }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading live data...</div>
        ) : (
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', fontSize: '11px' }}>Patient Name</th>
                <th style={{ padding: '12px 16px', fontSize: '11px' }}>Current Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11px' }}>Last Report</th>
                <th style={{ padding: '12px 16px', fontSize: '11px' }}>Consent Scope</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => {
                const hasAccess = patient.status === 'Live Access';
                return (
                  <tr key={patient.id} style={{ opacity: hasAccess ? 1 : 0.6, background: hasAccess ? 'transparent' : 'var(--bg-secondary)' }}>
                    <td style={{ fontWeight: hasAccess ? '600' : '500', color: 'var(--text-primary)', padding: '12px 16px', fontSize: '13px' }}>{patient.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {hasAccess ? (
                        <span className={`badge ${getBadgeClass(patient.state)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '11px' }}>
                          {getStateIcon(patient.state, 12)}
                          {patient.state} (Sev {patient.severity})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', padding: '12px 16px', fontSize: '13px' }}>{hasAccess ? patient.lastReport : 'Unknown'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${hasAccess ? 'badge-calm' : ''}`} style={!hasAccess ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '4px 10px', fontSize: '11px' } : { padding: '4px 10px', fontSize: '11px' }}>
                        {patient.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                      {hasAccess ? (
                        <Link href={`/patients/${patient.id}`} style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px', 
                          color: 'var(--text-primary)', fontWeight: '600', padding: '6px 12px', 
                          background: 'var(--bg-tertiary)', borderRadius: '6px', transition: 'all 0.2s ease',
                          fontSize: '12px'
                        }}>
                          View <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', padding: '6px 12px', fontSize: '12px' }}>Access Denied</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
