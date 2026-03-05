'use client';
import Link from 'next/link';

export default function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(245,242,238,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e8e2d9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: 56,
    }}>
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none'
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6, background: '#c8622a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'monospace',
        }}>M</div>
        <span style={{
          fontSize: 16, fontWeight: 700, color: '#1a1612',
          fontFamily: 'Georgia, serif', letterSpacing: '0.02em'
        }}>
          Macro<span style={{ color: '#c8622a' }}>View</span>
        </span>
      </Link>
      <span style={{
        fontFamily: 'monospace', fontSize: 11, color: '#9a948e', letterSpacing: '0.06em'
      }}>
        MACRO · REAL ESTATE · EQUITY
      </span>
    </nav>
  );
}