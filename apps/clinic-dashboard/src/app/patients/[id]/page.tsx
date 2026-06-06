'use client';

import { useState, useEffect, use } from 'react';
import { Activity, Brain, FileText, ChevronLeft, Calendar, AlertTriangle, Smile, Frown, Flame, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

// Simple mock history data for the chart, as the backend only provides current reading
const mockHistoryData = [
  { time: '09:00', severity: 2 },
  { time: '10:00', severity: 7 },
  { time: '11:00', severity: 5 },
  { time: '12:00', severity: 3 },
  { time: '13:00', severity: 4 },
  { time: '14:00', severity: 2 },
  { time: '15:00', severity: 8 },
  { time: '16:00', severity: 4 },
];

const getStateIcon = (state: string, size = 20) => {
  switch (state?.toUpperCase()) {
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

export default function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  
  const [currentReading, setCurrentReading] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    const fetchCurrentReading = async () => {
      try {
        const res = await fetch(`${apiUrl}/readings/${patientId}/current?requesterId=d1`);
        if (res.status === 403) {
          setError('Access denied. Patient has not granted consent.');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch reading');
        setCurrentReading(await res.json());
        setError(null);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch(`${apiUrl}/reports/${patientId}?requesterId=d1`);
        if (res.status === 403) {
          setError('Access denied. Patient has not granted consent.');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch reports');
        setReports(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    const pollData = () => {
      fetchCurrentReading();
      fetchReports();
    };

    pollData();
    const interval = setInterval(pollData, 2000);
    return () => clearInterval(interval);
  }, [patientId]);

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Link href="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
          <ChevronLeft size={16} /> Back to Patients
        </Link>
        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
          <AlertTriangle size={36} color="var(--angry)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{error}</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (sev: number) => {
    if (sev > 6) return 'var(--angry)';
    if (sev > 3) return '#f59e0b';
    return 'var(--calm)';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '600', transition: 'color 0.2s ease', fontSize: '13px' }}>
          <ChevronLeft size={16} /> Back to Patients
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)' }}>Patient: {patientId.toUpperCase()}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Live BCI Monitor & AI Reports</p>
          </div>
          
          {currentReading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getStateIcon(currentReading.state, 20)}
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Status</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: getSeverityColor(currentReading.severity) }}>{currentReading.state}</div>
                </div>
              </div>
              {/* No vertical divider border */}
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentReading.severity} / 10</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        
        {/* Left Column: Chart & Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '6px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
                <Activity size={18} color="var(--accent)" />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Today's Emotional Severity (Mock History)</h2>
            </div>
            
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Area type="monotone" dataKey="severity" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSeverity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
                  <FileText size={18} color="var(--accent)" />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: '600' }}>AI-Generated Daily Reports</h2>
              </div>
            </div>

            {reports.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '13px' }}>
                No reports available for this patient yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map((report, idx) => (
                  <div key={idx} style={{ padding: '16px', border: 'none', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '12px' }}>
                      <Calendar size={14} /> {report.date}
                    </div>
                    
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px' }}>
                      {report.summary}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Average Severity</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{report.avgSeverity} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 10</span></div>
                      </div>
                      <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>High Stress Episodes</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{report.episodes}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Patterns</h4>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                        {report.patterns.map((p: string, i: number) => (
                          <li key={i} style={{ marginBottom: '2px' }}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-primary))', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Brain size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>AI Clinician Summary</h3>
            </div>
            {reports.length > 0 ? (
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', fontSize: '13px' }}>
                {reports[reports.length - 1].clinicianNote}
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Awaiting enough data for AI summary.</p>
            )}
            
            <button className="badge-outline active" style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '6px', fontSize: '13px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '600' }}>
              Generate New Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
