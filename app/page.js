'use client'
import { useState } from 'react'
import Link from 'next/link'
import { COUNTRIES } from './lib/mock'
import { CountryCard } from './components/home/CountryCard'
import { Navbar } from './components/layout/Navbar'

const REGIONS = ['Все', 'ЮВА', 'Ближний Восток', 'Европа', 'СНГ', 'Азия', 'Северная Америка']

export default function HomePage() {
  const [region, setRegion] = useState('Все')
  const [search, setSearch] = useState('')

  const filtered = COUNTRIES.filter(c => {
    if (region !== 'Все' && c.region !== region) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const greenCount  = COUNTRIES.filter(c => c.chi.signal === 'green').length
  const yellowCount = COUNTRIES.filter(c => c.chi.signal === 'yellow').length
  const redCount    = COUNTRIES.filter(c => c.chi.signal === 'red').length

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 900, color: '#1a1612', margin: '0 0 8px' }}>
                Глобальные инвестиции
              </h1>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#6a6460', maxWidth: 540, margin: 0, lineHeight: 1.6 }}>
                Country Health Index по 20 странам. Сигнал, прогноз и аналитика для инвестора в недвижимость, фондовый рынок, ВНЖ и бизнес.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Стабильно',  count: greenCount,  color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                { label: 'Следи',      count: yellowCount, color: '#854d0e', bg: '#fefce8', border: '#fde047' },
                { label: 'Осторожно', count: redCount,    color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
              ].map(({ label, count, color, bg, border }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: bg }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color }}>{count}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color, opacity: 0.7 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>Данные актуальны · Март 2026 · Обновляется ежемесячно</span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Фильтры */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', margin: 0 }}>
              {filtered.length} из {COUNTRIES.length} стран
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск страны..."
              style={{
                fontFamily: 'monospace', fontSize: 12, background: '#fff',
                border: '1px solid #e8e2d8', borderRadius: 8, padding: '6px 12px',
                outline: 'none', width: 160,
              }}
            />
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)} style={{
                fontFamily: 'monospace', fontSize: 10,
                background: region === r ? '#1a3a6a' : '#fff',
                color: region === r ? '#fff' : '#9a948e',
                border: `1px solid ${region === r ? '#1a3a6a' : '#e8e2d8'}`,
                borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка карточек */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 48 }}>
          {filtered.map(country => (
            <CountryCard key={country.slug} country={country} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', fontFamily: 'monospace', fontSize: 14, color: '#9a948e' }}>
              Страны не найдены
            </div>
          )}
        </div>

        {/* Сравнительный экран */}
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>
            Сравнительный экран · Топ по CHI
          </h2>
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1612' }}>
                  {['Страна', 'Регион', 'CHI', 'Долгосрочный', 'Среднесрочный', 'Краткосрочный', 'Сигнал'].map(h => (
                    <th key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', padding: '12px 16px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...COUNTRIES].sort((a, b) => b.chi.index - a.chi.index).map((c, i) => {
                  const signalStyle = c.chi.signal === 'green'
                    ? { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
                    : c.chi.signal === 'yellow'
                    ? { color: '#854d0e', bg: '#fefce8', border: '#fde047' }
                    : { color: '#991b1b', bg: '#fef2f2', border: '#fecaca' }
                  return (
                    <tr key={c.slug} style={{ borderTop: '1px solid #f0ece6', background: i % 2 === 0 ? '#fff' : 'rgba(250,248,244,0.5)' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <Link href={`/country/${c.slug}`} style={{ textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, color: '#1a1612' }}>
                          {c.flag} {c.name}
                        </Link>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: '#9a948e' }}>{c.region}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1612' }}>{c.chi.index}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#1a3a6a' }}>{c.chi.longTerm}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#2563eb' }}>{c.chi.midTerm}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#d97706' }}>{c.chi.shortTerm}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${signalStyle.border}`, color: signalStyle.color, background: signalStyle.bg }}>
                          {c.chi.signal === 'green' ? '🟢 Стабильно' : c.chi.signal === 'yellow' ? '🟡 Следи' : '🔴 Осторожно'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
