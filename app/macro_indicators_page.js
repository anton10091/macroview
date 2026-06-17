'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { Navbar } from '../components/layout/Navbar'

// ─── Цвета стран ────────────────────────────────────────────────
const COUNTRY_COLORS = {
  usa:'#1a3a6a', china:'#dc2626', india:'#d97706', russia:'#7c3aed',
  germany:'#0891b2', uk:'#0d9488', thailand:'#db2777', uae:'#059669',
  georgia:'#ea580c', turkey:'#c2410c', indonesia:'#16a34a', vietnam:'#ca8a04',
  malaysia:'#9333ea', spain:'#e11d48', portugal:'#15803d', serbia:'#6366f1',
  kazakhstan:'#8b5cf6', uzbekistan:'#f59e0b', israel:'#2563eb', cyprus:'#64748b',
}

const COUNTRY_FLAGS = {
  usa:'🇺🇸',china:'🇨🇳',india:'🇮🇳',russia:'🇷🇺',germany:'🇩🇪',uk:'🇬🇧',
  thailand:'🇹🇭',uae:'🇦🇪',georgia:'🇬🇪',turkey:'🇹🇷',indonesia:'🇮🇩',
  vietnam:'🇻🇳',malaysia:'🇲🇾',spain:'🇪🇸',portugal:'🇵🇹',serbia:'🇷🇸',
  kazakhstan:'🇰🇿',uzbekistan:'🇺🇿',israel:'🇮🇱',cyprus:'🇨🇾',
}

const ALL_COUNTRIES = Object.keys(COUNTRY_COLORS)
const DEFAULT_SELECTED = ['usa','china','india','thailand','uae','georgia']

// ─── Мини SVG-график ────────────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 40 }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {data[data.length - 1]?.forecast && (
        <polyline
          points={data.slice(-3).map((d, i, arr) => {
            const idx = data.length - arr.length + i
            const x = (idx / (data.length - 1)) * width
            const y = height - ((d.value - min) / range) * (height - 4) - 2
            return `${x},${y}`
          }).join(' ')}
          fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,2" strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

// ─── Полный линейный график ──────────────────────────────────────
function LineChart({ datasets, yLabel = '', width = 680, height = 240 }) {
  if (!datasets || datasets.length === 0) return null
  const pad = { top: 20, right: 20, bottom: 32, left: 48 }
  const W = width - pad.left - pad.right
  const H = height - pad.top - pad.bottom

  const allVals = datasets.flatMap(d => d.points.map(p => p.value))
  const allYears = [...new Set(datasets.flatMap(d => d.points.map(p => p.year)))].sort()
  const minV = Math.min(...allVals) * 0.95
  const maxV = Math.max(...allVals) * 1.05
  const range = maxV - minV || 1
  const minY = Math.min(...allYears)
  const maxY = Math.max(...allYears)
  const yearRange = maxY - minY || 1

  const xPos = y => ((y - minY) / yearRange) * W
  const yPos = v => H - ((v - minV) / range) * H

  const yTicks = 5
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {/* Grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = minV + (range / yTicks) * i
          const y = yPos(v)
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="#e8e2d8" strokeWidth="1" />
              <text x={-6} y={y + 4} textAnchor="end" fill="#9a948e" fontSize="9" fontFamily="monospace">{Math.round(v)}</text>
            </g>
          )
        })}
        {/* X axis labels */}
        {allYears.filter((_, i) => i % 2 === 0).map(year => (
          <text key={year} x={xPos(year)} y={H + 18} textAnchor="middle" fill="#9a948e" fontSize="9" fontFamily="monospace">{year}</text>
        ))}
        {/* Forecast shading */}
        <rect x={xPos(2025)} y={0} width={W - xPos(2025)} height={H} fill="#faf8f4" opacity="0.6" />
        <line x1={xPos(2025)} y1={0} x2={xPos(2025)} y2={H} stroke="#c8c2b8" strokeWidth="1" strokeDasharray="3,2" />
        <text x={xPos(2025) + 4} y={10} fill="#c8c2b8" fontSize="8" fontFamily="monospace">прогноз</text>
        {/* Lines */}
        {datasets.map(ds => {
          const pts = ds.points.map(p => `${xPos(p.year)},${yPos(p.value)}`).join(' ')
          return (
            <g key={ds.slug}>
              <polyline points={pts} fill="none" stroke={ds.color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />
              {/* Last point dot */}
              {ds.points[ds.points.length - 1] && (
                <circle
                  cx={xPos(ds.points[ds.points.length - 1].year)}
                  cy={yPos(ds.points[ds.points.length - 1].value)}
                  r="3" fill={ds.color}
                />
              )}
            </g>
          )
        })}
        {/* Y label */}
        <text transform={`rotate(-90) translate(${-H/2}, ${-38})`} textAnchor="middle" fill="#9a948e" fontSize="9" fontFamily="monospace">{yLabel}</text>
      </g>
    </svg>
  )
}

// ─── Стековый Bar chart для структуры образования ───────────────
function StackedBar({ data, year }) {
  const row = data.find(d => d.year === year)
  if (!row) return null
  const cats = [
    { key: 'no_education',  label: 'Без образования', color: '#ef4444' },
    { key: 'primary_edu',   label: 'Начальное',        color: '#f97316' },
    { key: 'secondary_edu', label: 'Среднее',          color: '#3b82f6' },
    { key: 'tertiary_edu',  label: 'Высшее',           color: '#22c55e' },
  ]
  return (
    <div style={{ display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden', width: '100%' }}>
      {cats.map(c => (
        <div key={c.key} style={{ width: `${row[c.key]}%`, background: c.color, transition: 'width 0.4s ease' }} title={`${c.label}: ${row[c.key]}%`} />
      ))}
    </div>
  )
}

export default function MacroIndicatorsPage() {
  const [selected, setSelected]         = useState(DEFAULT_SELECTED)
  const [activeSection, setActiveSection] = useState('population')
  const [popData, setPopData]           = useState({})
  const [wfData, setWfData]             = useState({})
  const [eduStructData, setEduStructData] = useState({})
  const [eduQualData, setEduQualData]   = useState({})
  const [laborData, setLaborData]       = useState({})
  const [hciData, setHciData]           = useState({})
  const [loading, setLoading]           = useState(true)

  // Загрузка всех данных
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [
        { data: pop },
        { data: wf },
        { data: eduS },
        { data: eduQ },
        { data: labor },
        { data: hci },
      ] = await Promise.all([
        supabase.from('population_history').select('*').order('year'),
        supabase.from('workforce_share').select('*').order('year'),
        supabase.from('education_structure').select('*').order('year'),
        supabase.from('education_quality').select('*').order('year'),
        supabase.from('labor_cost_quality').select('*').order('year'),
        supabase.from('human_capital_index').select('*').order('year'),
      ])

      // Группируем по стране
      const group = (rows) => {
        const map = {}
        ;(rows || []).forEach(r => {
          if (!map[r.country_slug]) map[r.country_slug] = []
          map[r.country_slug].push(r)
        })
        return map
      }

      setPopData(group(pop))
      setWfData(group(wf))
      setEduStructData(group(eduS))
      setEduQualData(group(eduQ))
      setLaborData(group(labor))
      setHciData(group(hci))
      setLoading(false)
    }
    load()
  }, [])

  const toggleCountry = (slug) => {
    setSelected(prev =>
      prev.includes(slug)
        ? prev.length > 1 ? prev.filter(s => s !== slug) : prev
        : prev.length < 8 ? [...prev, slug] : prev
    )
  }

  // Подготовка датасетов для графика
  const makeDatasets = (dataMap, valueKey) =>
    selected
      .filter(s => dataMap[s])
      .map(s => ({
        slug: s,
        color: COUNTRY_COLORS[s],
        points: dataMap[s].map(r => ({ year: r.year, value: r[valueKey], forecast: r.is_forecast })),
      }))

  const SECTIONS = [
    { id: 'population',   label: '👥 Население' },
    { id: 'workforce',    label: '💼 Рабочая сила' },
    { id: 'edu_structure',label: '🎓 Структура образования' },
    { id: 'edu_quality',  label: '📐 Качество образования' },
    { id: 'labor_value',  label: '⚖️ Стоимость/качество труда' },
    { id: 'hci',          label: '🏆 Индекс HCI' },
  ]

  // Последние значения для карточек
  const getLatest = (dataMap, slug, key) => {
    const rows = dataMap[slug]
    if (!rows || rows.length === 0) return null
    const nonForecast = rows.filter(r => !r.is_forecast)
    const row = nonForecast[nonForecast.length - 1] || rows[rows.length - 1]
    return row?.[key]
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* ── Хедер ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>
            <Link href="/" style={{ color: '#9a948e', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <span style={{ color: '#1a1612', fontWeight: 600 }}>Макроиндикаторы</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>
            Макроиндикаторы · Человеческий капитал
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a6460', margin: '0 0 20px' }}>
            Долгосрочный анализ по методологии Рэя Далио · 20 стран · 1990–2035
          </p>

          {/* Секции */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                fontFamily: 'monospace', fontSize: 11, color: activeSection === s.id ? '#1a3a6a' : '#6a6460',
                padding: '10px 16px', borderBottom: `2px solid ${activeSection === s.id ? '#1a3a6a' : 'transparent'}`,
                background: 'none', border: 'none', borderBottom: `2px solid ${activeSection === s.id ? '#1a3a6a' : 'transparent'}`,
                cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeSection === s.id ? 700 : 400,
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24 }}>

        {/* ── Боковая панель: выбор стран ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16, position: 'sticky', top: 24 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Страны (макс. 8)
            </div>
            {ALL_COUNTRIES.map(slug => {
              const isOn = selected.includes(slug)
              return (
                <button key={slug} onClick={() => toggleCountry(slug)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '6px 8px', marginBottom: 2, borderRadius: 6,
                  background: isOn ? `${COUNTRY_COLORS[slug]}15` : 'transparent',
                  border: `1px solid ${isOn ? COUNTRY_COLORS[slug] : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 14 }}>{COUNTRY_FLAGS[slug]}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: isOn ? COUNTRY_COLORS[slug] : '#6a6460', fontWeight: isOn ? 700 : 400 }}>
                    {slug.toUpperCase()}
                  </span>
                  {isOn && <div style={{ width: 6, height: 6, borderRadius: '50%', background: COUNTRY_COLORS[slug], marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Основной контент ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#9a948e' }}>Загрузка данных...</span>
            </div>
          ) : (

            <>
              {/* Легенда */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {selected.map(slug => (
                  <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${COUNTRY_COLORS[slug]}`, borderRadius: 20, padding: '4px 10px' }}>
                    <span style={{ fontSize: 12 }}>{COUNTRY_FLAGS[slug]}</span>
                    <div style={{ width: 16, height: 2, background: COUNTRY_COLORS[slug], borderRadius: 1 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: COUNTRY_COLORS[slug], fontWeight: 700 }}>{slug.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              {/* ─── 1. НАСЕЛЕНИЕ ─── */}
              {activeSection === 'population' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Численность населения</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>млн человек · 1990–2035</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(popData, 'population_total')} yLabel="млн" width={720} height={260} />
                    </div>
                  </div>

                  {/* Карточки последних значений */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {selected.map(slug => {
                      const total = getLatest(popData, slug, 'population_total')
                      const w1564 = getLatest(popData, slug, 'population_15_64')
                      const old   = getLatest(popData, slug, 'population_65plus')
                      return (
                        <div key={slug} style={{ background: '#fff', border: `1px solid ${COUNTRY_COLORS[slug]}30`, borderLeft: `3px solid ${COUNTRY_COLORS[slug]}`, borderRadius: 8, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 16 }}>{COUNTRY_FLAGS[slug]}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: COUNTRY_COLORS[slug] }}>{slug.toUpperCase()}</span>
                          </div>
                          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 900, color: '#1a1612', marginBottom: 2 }}>{total ? `${total}M` : '—'}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', marginBottom: 8 }}>население 2025</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1a3a6a' }}>{w1564 ? `${w1564}%` : '—'}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#9a948e' }}>15–64</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#d97706' }}>{old ? `${old}%` : '—'}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#9a948e' }}>65+</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <Sparkline
                              data={(popData[slug] || []).map(r => ({ value: r.population_total, forecast: r.is_forecast }))}
                              color={COUNTRY_COLORS[slug]}
                              width={120} height={32}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Возрастная структура */}
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Доля рабочего возраста (15–64)</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>% от общего населения</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(popData, 'population_15_64')} yLabel="%" width={720} height={220} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 2. РАБОЧАЯ СИЛА ─── */}
              {activeSection === 'workforce' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Доля рабочей силы</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>% от общего населения</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(wfData, 'workforce_rate')} yLabel="%" width={720} height={240} />
                    </div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Молодёжная безработица (15–24)</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>% · структурный риск</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(wfData, 'youth_unemployment')} yLabel="%" width={720} height={220} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 3. СТРУКТУРА ОБРАЗОВАНИЯ ─── */}
              {activeSection === 'edu_structure' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Доля высшего образования</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>% населения 25+ · тренд роста</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(eduStructData, 'tertiary_edu')} yLabel="%" width={720} height={240} />
                    </div>
                  </div>

                  {/* Структура по странам — стековые бары */}
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Структура образования 2025</div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      {[['#ef4444','Без образования'],['#f97316','Начальное'],['#3b82f6','Среднее'],['#22c55e','Высшее']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#6a6460' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selected.map(slug => (
                        <div key={slug} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px', alignItems: 'center', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>{COUNTRY_FLAGS[slug]}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 9, color: COUNTRY_COLORS[slug], fontWeight: 700 }}>{slug.toUpperCase()}</span>
                          </div>
                          <StackedBar data={eduStructData[slug] || []} year={2025} />
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#22c55e', textAlign: 'right', fontWeight: 700 }}>
                            {getLatest(eduStructData, slug, 'tertiary_edu') ? `${getLatest(eduStructData, slug, 'tertiary_edu')}% ВО` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 4. КАЧЕСТВО ОБРАЗОВАНИЯ ─── */}
              {activeSection === 'edu_quality' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Индекс качества образования</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>0–100 · агрегировано PISA + UNESCO</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(eduQualData, 'quality_index')} yLabel="0–100" width={720} height={240} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {selected.map(slug => {
                      const qi   = getLatest(eduQualData, slug, 'quality_index')
                      const pisa = getLatest(eduQualData, slug, 'pisa_score')
                      const lit  = getLatest(eduQualData, slug, 'literacy_rate')
                      return (
                        <div key={slug} style={{ background: '#fff', border: `1px solid ${COUNTRY_COLORS[slug]}30`, borderLeft: `3px solid ${COUNTRY_COLORS[slug]}`, borderRadius: 8, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 16 }}>{COUNTRY_FLAGS[slug]}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: COUNTRY_COLORS[slug] }}>{slug.toUpperCase()}</span>
                          </div>
                          <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 900, color: '#1a1612' }}>{qi ?? '—'}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', marginBottom: 8 }}>индекс качества</div>
                          <div style={{ height: 4, background: '#f5f2ee', borderRadius: 2, marginBottom: 8 }}>
                            <div style={{ height: '100%', width: `${qi}%`, background: COUNTRY_COLORS[slug], borderRadius: 2 }} />
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>
                            PISA: <strong>{pisa ?? 'н/д'}</strong><br />
                            Грамотность: <strong>{lit ? `${lit}%` : '—'}</strong>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ─── 5. СТОИМОСТЬ/КАЧЕСТВО ТРУДА ─── */}
              {activeSection === 'labor_value' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Средняя зарплата</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>USD / месяц</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(laborData, 'avg_wage_usd')} yLabel="USD/мес" width={720} height={240} />
                    </div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Оценка привлекательности рынка труда</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 16 }}>0–100 · чем выше тем выгоднее для инвестора</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selected
                        .map(slug => ({ slug, val: getLatest(laborData, slug, 'value_score') }))
                        .sort((a, b) => (b.val || 0) - (a.val || 0))
                        .map(({ slug, val }) => (
                          <div key={slug} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{COUNTRY_FLAGS[slug]}</span>
                              <span style={{ fontFamily: 'monospace', fontSize: 9, color: COUNTRY_COLORS[slug], fontWeight: 700 }}>{slug.toUpperCase()}</span>
                            </div>
                            <div style={{ height: 8, background: '#f5f2ee', borderRadius: 4 }}>
                              <div style={{ height: '100%', width: `${val}%`, background: COUNTRY_COLORS[slug], borderRadius: 4, transition: 'width 0.4s' }} />
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: COUNTRY_COLORS[slug] }}>{val ?? '—'}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 6. HCI ─── */}
              {activeSection === 'hci' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Human Capital Index</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1a1612', marginBottom: 20 }}>Агрегированный индекс · демография × образование × труд</div>
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(hciData, 'hci_score')} yLabel="0–100" width={720} height={240} />
                    </div>
                  </div>

                  {/* Сравнение с США */}
                  <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Сравнение с США · HCI 2025 (USA = 100)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selected
                        .map(slug => ({ slug, val: getLatest(hciData, slug, 'hci_vs_usa') }))
                        .sort((a, b) => (b.val || 0) - (a.val || 0))
                        .map(({ slug, val }) => (
                          <div key={slug} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{COUNTRY_FLAGS[slug]}</span>
                              <span style={{ fontFamily: 'monospace', fontSize: 9, color: COUNTRY_COLORS[slug], fontWeight: 700 }}>{slug.toUpperCase()}</span>
                            </div>
                            <div style={{ height: 10, background: '#f5f2ee', borderRadius: 4, position: 'relative' }}>
                              <div style={{ height: '100%', width: `${Math.min(val, 110)}%`, background: val >= 100 ? '#22c55e' : COUNTRY_COLORS[slug], borderRadius: 4, transition: 'width 0.4s' }} />
                              {/* USA baseline */}
                              <div style={{ position: 'absolute', left: '91%', top: -4, bottom: -4, width: 2, background: '#1a3a6a', borderRadius: 1 }} />
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: val >= 100 ? '#22c55e' : COUNTRY_COLORS[slug] }}>{val ?? '—'}</span>
                          </div>
                        ))
                      }
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', marginTop: 12 }}>
                      Синяя линия = уровень США (100). Зелёный = превышает США.
                    </div>
                  </div>

                  {/* Компоненты */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {selected.map(slug => {
                      const row = hciData[slug]?.filter(r => !r.is_forecast).slice(-1)[0]
                      if (!row) return null
                      return (
                        <div key={slug} style={{ background: '#fff', border: `1px solid ${COUNTRY_COLORS[slug]}30`, borderLeft: `3px solid ${COUNTRY_COLORS[slug]}`, borderRadius: 8, padding: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <span style={{ fontSize: 18 }}>{COUNTRY_FLAGS[slug]}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: COUNTRY_COLORS[slug] }}>{slug.toUpperCase()}</span>
                            <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, color: '#1a1612', marginLeft: 'auto' }}>{row.hci_score}</span>
                          </div>
                          {[
                            { label: 'Демография', val: row.component_demo,      color: '#1a3a6a' },
                            { label: 'Раб. сила',  val: row.component_workforce, color: '#2563eb' },
                            { label: 'Образование',val: row.component_education, color: '#059669' },
                            { label: 'Рынок труда',val: row.component_labor,     color: '#d97706' },
                          ].map(({ label, val, color }) => (
                            <div key={label} style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#6a6460' }}>{label}</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, color }}>{val}</span>
                              </div>
                              <div style={{ height: 4, background: '#f5f2ee', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 2 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
