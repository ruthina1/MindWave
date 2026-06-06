'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, BellRing, Users, Activity, 
  ShieldCheck, Building2, LogOut, BrainCircuit,
  ChevronDown, ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState('Dr. Amanuel Bekele');
  const [doctorRole, setDoctorRole] = useState('Psychiatrist');
  
  // Section toggle state
  const [openSections, setOpenSections] = useState({
    overview: true,
    patients: true,
    admin: true
  });

  // Fetch dynamic doctor profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/users/d1`);
        if (res.ok) {
          const data = await res.json();
          setDoctorName(data.name);
          setDoctorRole(data.role === 'PSYCHIATRIST' ? 'Psychiatrist' : data.role);
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err);
      }
    };
    
    fetchProfile();
  }, []);

  // Auto-expand active categories on route change
  useEffect(() => {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/alerts')) {
      setOpenSections(prev => ({ ...prev, overview: true }));
    }
    if (pathname.startsWith('/patients') || pathname.startsWith('/inpatient')) {
      setOpenSections(prev => ({ ...prev, patients: true }));
    }
    if (pathname.startsWith('/consent')) {
      setOpenSections(prev => ({ ...prev, admin: true }));
    }
  }, [pathname]);

  const toggleSection = (section: 'overview' | 'patients' | 'admin') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isOverviewActive = pathname === '/dashboard' || pathname === '/alerts';
  const isPatientsActive = pathname.startsWith('/patients') || pathname === '/inpatient';
  const isAdminActive = pathname === '/consent';

  return (
    <aside style={{
      width: '260px',
      background: 'white',
      borderRight: 'none',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }}>
      {/* Brand Logo & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '6px' }}>
          <BrainCircuit color="var(--accent)" size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            MindWave <span style={{ color: 'var(--accent)' }}>PRO</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
            {doctorName}
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Category: Overview */}
        <div>
          <button 
            onClick={() => toggleSection('overview')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              color: isOverviewActive ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Overview
            </span>
            {openSections.overview ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <div style={{ 
            maxHeight: openSections.overview ? '200px' : '0px', 
            overflow: 'hidden', 
            transition: 'max-height 0.25s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: openSections.overview ? '4px' : '0px'
          }}>
            <Link 
              href="/dashboard" 
              className={`nav-item ${pathname === '/dashboard' || pathname === '/' ? 'active' : ''}`}
              style={{ borderRadius: '6px' }}
            >
              <LayoutDashboard size={16} />
              Home Dashboard
            </Link>
            <Link 
              href="/alerts" 
              className={`nav-item ${pathname === '/alerts' ? 'active' : ''}`}
              style={{ borderRadius: '6px' }}
            >
              <BellRing size={16} />
              Alert Feed
            </Link>
          </div>
        </div>

        {/* Category: Patients & Care */}
        <div>
          <button 
            onClick={() => toggleSection('patients')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              color: isPatientsActive ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Patients & Care
            </span>
            {openSections.patients ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <div style={{ 
            maxHeight: openSections.patients ? '200px' : '0px', 
            overflow: 'hidden', 
            transition: 'max-height 0.25s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: openSections.patients ? '4px' : '0px'
          }}>
            <Link 
              href="/patients" 
              className={`nav-item ${pathname.startsWith('/patients') ? 'active' : ''}`}
              style={{ borderRadius: '6px' }}
            >
              <Users size={16} />
              Patient Directory
            </Link>
            <Link 
              href="/inpatient" 
              className={`nav-item ${pathname === '/inpatient' ? 'active' : ''}`}
              style={{ borderRadius: '6px' }}
            >
              <Activity size={16} />
              Ward Live View
            </Link>
          </div>
        </div>

        {/* Category: Administration */}
        <div>
          <button 
            onClick={() => toggleSection('admin')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              color: isAdminActive ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Administration
            </span>
            {openSections.admin ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <div style={{ 
            maxHeight: openSections.admin ? '200px' : '0px', 
            overflow: 'hidden', 
            transition: 'max-height 0.25s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: openSections.admin ? '4px' : '0px'
          }}>
            <Link 
              href="/consent" 
              className={`nav-item ${pathname === '/consent' ? 'active' : ''}`}
              style={{ borderRadius: '6px' }}
            >
              <ShieldCheck size={16} />
              Consent Manager
            </Link>
            {/* No settings link */}
          </div>
        </div>

      </nav>
      
      {/* Footer Profile Sign-Out */}
      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <div style={{ 
          padding: '12px', 
          border: 'none', 
          borderRadius: '8px', 
          marginBottom: '12px',
          background: 'var(--bg-primary)',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{doctorName}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{doctorRole}</p>
        </div>
        <button style={{ 
          width: '100%', padding: '10px', background: 'var(--bg-primary)', 
          border: 'none', borderRadius: '8px', 
          color: 'var(--text-primary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontWeight: '600', fontSize: '13px', transition: 'all 0.2s ease'
        }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
