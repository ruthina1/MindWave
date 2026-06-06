'use client';

import { ShieldCheck, Download, ExternalLink, Search } from 'lucide-react';

export default function ConsentManager() {
  const consents = [
    { id: 'MW-8492', name: 'Abenezer Tadesse', type: 'FULL ACCESS', granted: 'March 12, 2026', revoked: null },
    { id: 'MW-2910', name: 'Kidist Alemu', type: 'REPORTS ONLY', granted: 'April 5, 2026', revoked: null },
    { id: 'MW-0182', name: 'Dawit M.', type: 'REVOKED', granted: 'Jan 10, 2026', revoked: 'June 4, 2026' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '8px' }}>Consent & Sharing</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Audit log of patient data access agreements and secure exports.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="badge-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: '500' }}>
            <Download size={16} /> Export Audit Log
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Consent Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--accent)" />
              Active Agreements
            </h2>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search..." style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: 'none', background: 'var(--bg-tertiary)', color: 'white', outline: 'none', fontSize: '13px' }} />
            </div>
          </div>
          
          <table className="premium-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Access Level</th>
                <th>Date Granted</th>
              </tr>
            </thead>
            <tbody>
              {consents.map(c => (
                <tr key={c.id} style={{ opacity: c.type === 'REVOKED' ? 0.5 : 1 }}>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td>
                    <span className={`badge ${c.type === 'FULL ACCESS' ? 'badge-calm' : c.type === 'REVOKED' ? '' : 'badge-stressed'}`} style={c.type === 'REVOKED' ? { background: 'var(--bg-tertiary)' } : {}}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.revoked ? `Revoked: ${c.revoked}` : c.granted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data Export Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Secure Report Export</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Export anonymised patient trend data or generate secure PDF reports for authorized third-party providers. Requires patient consent token.
            </p>
            <button style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Download size={16} /> Export JSON / PDF
            </button>
          </div>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(245, 158, 11, 0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--stressed)' }}>Compliance Notice</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              All data access is logged immutably. Patients have the right to revoke access instantly via their mobile application.
            </p>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--stressed)', fontSize: '14px', fontWeight: '600' }}>
              View HIPAA Policy <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
