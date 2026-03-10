'use client'
import { useState } from 'react'
import Link from 'next/link'
import { DIARY_ENTRIES, COUNTRIES } from '../lib/mock'
import { SIGNAL_CONFIG, DIRECTIONS } from '../lib/types'
import { Navbar } from '../components/layout/Navbar'

const DIRECTION_FILTERS = [
  { id: 'all',          label: 'Все' },
  { id: 'general',      label: '🌍 Общее' },
  { id: 'real-estate',  label: '🏠 Недвижимость' },
  { id: 'stock-market', label: '📈 Фондовый' },
  { id: 'visa',         label: '✈️ ВНЖ' },
  { id: 'business',     label: '💼 Бизнес' },
]

function DiaryCard({ entry }) {
  const [hovered, setHovered] = useState(false)
  const country = COUNTRIES.find(c => c.slug === entry.country_slug)
  const dir = DIRECTIONS.find(d => d.id === entry.direction)
  const signalCfg = entry.signal ? SIGNAL_CONFIG[entry.signal] : null

  return (
    <Link href={`/diary/${entry.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff', borderRadius: 12,
          border: `1px solid ${hovered ? 'rgba(26,58,106,0.3)' : '#e8e2d8'}`,
          padding: 20, transition: 'all 0.2s',
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
          cursor: 'pointer',
        }}
      >
        {/* Мета */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {country && <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{country.flag} {country.name}</span>}
          {dir && dir.id !== 'general' && (
            <>
              <span style={{ color: '#c8c2b8' }}>·</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{dir.icon} {dir.label}</span>
            </>
          )}
          <span style={{ color: '#c8c2b8' }}>·</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{entry.published_at}</span>
          {entry.is_live && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 6px', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Живая
            </span>
          )}
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: hovered ? '#1a3a6a' : '#1a1612', margin: '0 0 8px', lineHeight: 1.35, transition: 'color 0.15s' }}>
          {entry.title}
        </h2>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6a6460', lineHeight: 1.7, margin: '0 0 16px' }}>
          {entry.lead}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {signalCfg && (
              <span style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 6, border: `1px solid ${signalCfg.border}`, color: signalCfg.color, background: signalCfg.bg }}>
                {signalCfg.label}
              </span>
            )}
            {entry.chi_impact !== null && (
              <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${entry.chi_impact > 0 ? '#bbf7d0' : '#fecaca'}`, color: entry.chi_impact > 0 ? '#15803d' : '#991b1b', background: entry.chi_impact > 0 ? '#f0fdf4' : '#fef2f2' }}>
                CHI {entry.chi_impact > 0 ? '+' : ''}{entry.chi_impact} п.
              </span>
            )}
            {entry.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', background: '#f5f2ee', borderRadius: 4, padding: '2px 8px' }}>#{tag}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'monospace', fontSize: 10, color: '#c8c2b8' }}>
            <span>👁 {entry.views.toLocaleString()}</span>
            <span>♡ {entry.likes}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DiaryPage() {
  const [dirFilter, setDirFilter]       = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [search, setSearch]             = useState('')

  const filtered = DIARY_ENTRIES.filter(e => {
    if (dirFilter !== 'all' && e.direction !== dirFilter) return false
    if (countryFilter !== 'all' && e.country_slug !== countryFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const countriesWithEntries = COUNTRIES.filter(c => DIARY_ENTRIES.some(e => e.country_slug === c.slug))

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>Аналитика</h1>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#6a6460', margin: '0 0 20px' }}>
            Агент анализирует события и публикует вывод для инвестора. Не новости — интерпретация.
          </p>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по заголовку..."
            style={{
              width: '100%', fontFamily: 'monospace', fontSize: 13, background: '#faf8f4',
              border: '1px solid #e8e2d8', borderRadius: 12, padding: '10px 16px',
              outline: 'none', marginBottom: 16, boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIRECTION_FILTERS.map(f => (
                <button key={f.id} onClick={() => setDirFilter(f.id)} style={{
                  fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${dirFilter === f.id ? '#1a3a6a' : '#e8e2d8'}`,
                  background: dirFilter === f.id ? '#1a3a6a' : '#fff',
                  color: dirFilter === f.id ? '#fff' : '#4a4540',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{f.label}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: '#e8e2d8' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setCountryFilter('all')} style={{
                fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 8,
                border: `1px solid ${countryFilter === 'all' ? '#1a3a6a' : '#e8e2d8'}`,
                background: countryFilter === 'all' ? '#1a3a6a' : '#fff',
                color: countryFilter === 'all' ? '#fff' : '#4a4540',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>Все страны</button>
              {countriesWithEntries.map(c => (
                <button key={c.slug} onClick={() => setCountryFilter(c.slug)} style={{
                  fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${countryFilter === c.slug ? '#1a3a6a' : '#e8e2d8'}`,
                  background: countryFilter === c.slug ? '#1a3a6a' : '#fff',
                  color: countryFilter === c.slug ? '#fff' : '#4a4540',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{c.flag} {c.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Записи */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', marginBottom: 16 }}>
          Найдено записей: {filtered.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(entry => <DiaryCard key={entry.id} entry={entry} />)}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', fontFamily: 'monospace', fontSize: 14, color: '#9a948e' }}>
              Записей не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
