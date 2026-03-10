'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SIGNAL_CONFIG, DIRECTIONS } from '../../lib/types'

export function CountryCard({ country }) {
  const [hovered, setHovered] = useState(false)
  const cfg = SIGNAL_CONFIG[country.chi.signal]

  return (
    <Link href={`/country/${country.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          border: `1px solid ${hovered ? 'rgba(26,58,106,0.3)' : '#e8e2d8'}`,
          borderRadius: 12, padding: 16,
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.15s', cursor: 'pointer',
        }}
      >
        {/* Хедер */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>{country.flag}</span>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1a1612', fontSize: 13 }}>{country.name}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{country.region}</div>
            </div>
          </div>
          <span style={{
            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
            padding: '2px 8px', borderRadius: 6,
            border: `1px solid ${cfg.border}`, color: cfg.color, background: cfg.bg,
          }}>
            {country.chi.index}
          </span>
        </div>

        {/* Мини-CHI бар */}
        <div style={{ height: 4, background: '#f0ece6', borderRadius: 9999, marginBottom: 12 }}>
          <div style={{
            height: '100%', borderRadius: 9999,
            width: `${country.chi.index}%`,
            background: country.chi.signal === 'green' ? '#22c55e' : country.chi.signal === 'yellow' ? '#eab308' : '#ef4444',
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Три линии */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 12 }}>
          {[
            { label: 'Долг.',  val: country.chi.longTerm,  color: '#1a3a6a' },
            { label: 'Средн.', val: country.chi.midTerm,   color: '#2563eb' },
            { label: 'Кратк.', val: country.chi.shortTerm, color: '#d97706' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Приоритеты */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {country.priority.slice(0, 3).map(p => {
            const dir = DIRECTIONS.find(d => d.id === p)
            return dir ? (
              <span key={p} style={{
                fontFamily: 'monospace', fontSize: 9, color: '#9a948e',
                background: '#f5f2ee', borderRadius: 4, padding: '2px 6px',
              }}>
                {dir.icon} {dir.label}
              </span>
            ) : null
          })}
        </div>
      </div>
    </Link>
  )
}
