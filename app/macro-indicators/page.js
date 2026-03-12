'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { Navbar } from '../components/layout/Navbar'

// ─── Дизайн-токены (стиль Т-Банк) ───────────────────────────────
const T = {
  bg:       '#F5F7FA',
  card:     '#FFFFFF',
  accent:   '#0066FF',
  accent2:  '#E8F0FF',
  text:     '#1A1A2E',
  sub:      '#6B7280',
  border:   '#E5E9F0',
  shadow:   '0 2px 12px rgba(0,0,0,0.06)',
  radius:   '16px',
}

const COUNTRY_COLORS = {
  world:'#475569', usa:'#0066FF', china:'#dc2626', india:'#d97706',
  russia:'#7c3aed', germany:'#0891b2', uk:'#0d9488', thailand:'#db2777',
  uae:'#059669', georgia:'#ea580c', turkey:'#c2410c', indonesia:'#16a34a',
  vietnam:'#ca8a04', malaysia:'#9333ea', spain:'#e11d48', portugal:'#15803d',
  serbia:'#6366f1', kazakhstan:'#8b5cf6', uzbekistan:'#f59e0b',
  israel:'#2563eb', cyprus:'#64748b',
}

const COUNTRY_FLAG_CODES = {
  world: null, usa:'us', china:'cn', india:'in', russia:'ru', germany:'de',
  uk:'gb', thailand:'th', uae:'ae', georgia:'ge', turkey:'tr', indonesia:'id',
  vietnam:'vn', malaysia:'my', spain:'es', portugal:'pt', serbia:'rs',
  kazakhstan:'kz', uzbekistan:'uz', israel:'il', cyprus:'cy',
}

const COUNTRY_NAMES = {
  world:'Мир', usa:'США', china:'Китай', india:'Индия', russia:'Россия',
  germany:'Германия', uk:'Британия', thailand:'Таиланд', uae:'ОАЭ',
  georgia:'Грузия', turkey:'Турция', indonesia:'Индонезия', vietnam:'Вьетнам',
  malaysia:'Малайзия', spain:'Испания', portugal:'Португалия', serbia:'Сербия',
  kazakhstan:'Казахстан', uzbekistan:'Узбекистан', israel:'Израиль', cyprus:'Кипр',
}

const ALL_COUNTRIES = Object.keys(COUNTRY_COLORS)
const DEFAULT_SELECTED = ['world','usa','china','india','thailand','uae']

function Flag({ slug, size = 22 }) {
  const code = COUNTRY_FLAG_CODES[slug]
  if (!code) return <span style={{ fontSize: size * 0.85 }}>🌍</span>
  return (
    <img src={`https://flagcdn.com/w${size * 2}/${code}.png`}
      width={Math.round(size * 1.33)} height={size} alt={slug}
      onError={e => { e.target.src = `https://flagicons.lipis.dev/flags/4x3/${code}.svg` }}
      style={{ borderRadius: 3, objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
    />
  )
}

function Sparkline({ data, color, width = 100, height = 36 }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d.value)
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function LineChart({ datasets, yLabel = '', width = 680, height = 260 }) {
  if (!datasets || datasets.length === 0) return null
  const pad = { top: 24, right: 24, bottom: 36, left: 52 }
  const W = width - pad.left - pad.right
  const H = height - pad.top - pad.bottom
  const allVals = datasets.flatMap(d => d.points.map(p => p.value))
  const allYears = [...new Set(datasets.flatMap(d => d.points.map(p => p.year)))].sort()
  const minV = Math.min(...allVals) * 0.95, maxV = Math.max(...allVals) * 1.05
  const range = maxV - minV || 1
  const minY = Math.min(...allYears), maxY = Math.max(...allYears), yearRange = maxY - minY || 1
  const xPos = y => ((y - minY) / yearRange) * W
  const yPos = v => H - ((v - minV) / range) * H
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {Array.from({ length: 6 }).map((_, i) => {
          const v = minV + (range / 5) * i
          const y = yPos(v)
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={W} y2={y} stroke={T.border} strokeWidth="1" />
              <text x={-8} y={y + 4} textAnchor="end" fill={T.sub} fontSize="10" fontFamily="-apple-system,sans-serif">{Math.round(v)}</text>
            </g>
          )
        })}
        {allYears.filter((_, i) => i % 2 === 0).map(year => (
          <text key={year} x={xPos(year)} y={H + 22} textAnchor="middle" fill={T.sub} fontSize="10" fontFamily="-apple-system,sans-serif">{year}</text>
        ))}
        <rect x={xPos(2025)} y={0} width={W - xPos(2025)} height={H} fill={T.accent2} opacity="0.4" rx="4" />
        <line x1={xPos(2025)} y1={0} x2={xPos(2025)} y2={H} stroke={T.accent} strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
        <text x={xPos(2025) + 6} y={14} fill={T.accent} fontSize="9" fontFamily="-apple-system,sans-serif" opacity="0.7">прогноз</text>
        {datasets.map(ds => {
          const pts = ds.points.map(p => `${xPos(p.year)},${yPos(p.value)}`).join(' ')
          const last = ds.points[ds.points.length - 1]
          return (
            <g key={ds.slug}>
              <polyline points={pts} fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {last && <circle cx={xPos(last.year)} cy={yPos(last.value)} r="4" fill={ds.color} stroke="#fff" strokeWidth="2" />}
            </g>
          )
        })}
        <text transform={`rotate(-90) translate(${-H/2}, -40)`} textAnchor="middle" fill={T.sub} fontSize="10" fontFamily="-apple-system,sans-serif">{yLabel}</text>
      </g>
    </svg>
  )
}

function StackedBar({ data, year }) {
  const row = data.find(d => d.year === year)
  if (!row) return null
  const cats = [
    { key: 'no_education', color: '#ef4444' },
    { key: 'primary_edu',  color: '#f97316' },
    { key: 'secondary_edu',color: '#3b82f6' },
    { key: 'tertiary_edu', color: '#22c55e' },
  ]
  return (
    <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', width: '100%' }}>
      {cats.map(c => (
        <div key={c.key} style={{ width: `${row[c.key]}%`, background: c.color }} title={`${c.key}: ${row[c.key]}%`} />
      ))}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.card, borderRadius: T.radius, boxShadow: T.shadow, padding: 24, border: `1px solid ${T.border}`, ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ label, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: '-apple-system,sans-serif', marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{sub}</div>}
    </div>
  )
}

function StatCard({ slug, value, unit, sub, extra, sparkData }) {
  const color = COUNTRY_COLORS[slug]
  return (
    <div style={{ background: T.card, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.border}`, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Flag slug={slug} size={22} />
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{COUNTRY_NAMES[slug]}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.text, fontFamily: '-apple-system,sans-serif', lineHeight: 1, marginBottom: 4 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 500, color: T.sub, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif', marginBottom: 8 }}>{sub}</div>
      {extra && <div style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{extra}</div>}
      {sparkData && <div style={{ marginTop: 10 }}><Sparkline data={sparkData} color={color} width={110} height={32} /></div>}
    </div>
  )
}

function RankBar({ slug, val, maxVal = 100 }) {
  const color = COUNTRY_COLORS[slug]
  const pct = Math.min((val / maxVal) * 100, 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, flexShrink: 0 }}>
        <Flag slug={slug} size={20} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{COUNTRY_NAMES[slug]}</span>
      </div>
      <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color, width: 44, textAlign: 'right', fontFamily: '-apple-system,sans-serif' }}>{val}</span>
    </div>
  )
}

export default function MacroIndicatorsPage() {
  const [selected, setSelected]           = useState(DEFAULT_SELECTED)
  const [activeSection, setActiveSection] = useState('population')
  const [popData, setPopData]             = useState({})
  const [wfData, setWfData]               = useState({})
  const [eduStructData, setEduStructData] = useState({})
  const [eduQualData, setEduQualData]     = useState({})
  const [laborData, setLaborData]         = useState({})
  const [hciData, setHciData]             = useState({})
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: pop },{ data: wf },{ data: eduS },{ data: eduQ },{ data: labor },{ data: hci }] =
        await Promise.all([
          supabase.from('population_history').select('*').order('year'),
          supabase.from('workforce_share').select('*').order('year'),
          supabase.from('education_structure').select('*').order('year'),
          supabase.from('education_quality').select('*').order('year'),
          supabase.from('labor_cost_quality').select('*').order('year'),
          supabase.from('human_capital_index').select('*').order('year'),
        ])
      const group = rows => {
        const map = {}
        ;(rows||[]).forEach(r => { if (!map[r.country_slug]) map[r.country_slug]=[]; map[r.country_slug].push(r) })
        return map
      }
      setPopData(group(pop)); setWfData(group(wf)); setEduStructData(group(eduS))
      setEduQualData(group(eduQ)); setLaborData(group(labor)); setHciData(group(hci))
      setLoading(false)
    }
    load()
  }, [])

  const toggleCountry = slug => setSelected(prev =>
    prev.includes(slug)
      ? prev.length > 1 ? prev.filter(s => s !== slug) : prev
      : prev.length < 8 ? [...prev, slug] : prev
  )

  const makeDatasets = (dataMap, valueKey) =>
    selected.filter(s => dataMap[s]).map(s => ({
      slug: s, color: COUNTRY_COLORS[s],
      points: dataMap[s].map(r => ({ year: r.year, value: r[valueKey] })),
    }))

  const getLatest = (dataMap, slug, key) => {
    const rows = dataMap[slug]; if (!rows?.length) return null
    const row = rows.filter(r => !r.is_forecast).slice(-1)[0] || rows.slice(-1)[0]
    return row?.[key]
  }

  const SECTIONS = [
    { id: 'population',    label: 'Население',    icon: '👥' },
    { id: 'workforce',     label: 'Рабочая сила', icon: '💼' },
    { id: 'edu_structure', label: 'Образование',  icon: '🎓' },
    { id: 'edu_quality',   label: 'Качество',     icon: '📐' },
    { id: 'labor_value',   label: 'Рынок труда',  icon: '⚖️' },
    { id: 'hci',           label: 'Индекс HCI',   icon: '🏆' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: T.sub }}>
            <Link href="/" style={{ color: T.sub, textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <span style={{ color: T.text, fontWeight: 600 }}>Макроиндикаторы</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: T.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📊</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>Человеческий капитал</h1>
              <p style={{ fontSize: 13, color: T.sub, margin: '4px 0 0' }}>Долгосрочный анализ · методология Далио · 21 страна · 1990–2035</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: '10px 10px 0 0',
                background: activeSection === s.id ? T.bg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeSection === s.id ? T.accent : 'transparent'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500,
                color: activeSection === s.id ? T.accent : T.sub,
                transition: 'all 0.15s',
              }}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'flex', gap: 24 }}>

        {/* Боковая панель */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ background: T.card, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.border}`, padding: 16, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Страны</span>
              <span style={{ background: selected.length >= 8 ? '#FEE2E2' : T.accent2, color: selected.length >= 8 ? '#dc2626' : T.accent, borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{selected.length}/8</span>
            </div>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 12, lineHeight: 1.4 }}>
              {selected.length >= 8
                ? '⚠️ Достигнут максимум'
                : `Можно выбрать ещё ${8 - selected.length}`
              }
            </div>
            {ALL_COUNTRIES.map(slug => {
              const isOn = selected.includes(slug)
              return (
                <button key={slug} onClick={() => toggleCountry(slug)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 10px', marginBottom: 3, borderRadius: 10,
                  background: isOn ? `${COUNTRY_COLORS[slug]}12` : 'transparent',
                  border: `1.5px solid ${isOn ? COUNTRY_COLORS[slug] : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <Flag slug={slug} size={20} />
                  <span style={{ fontSize: 13, color: isOn ? COUNTRY_COLORS[slug] : T.text, fontWeight: isOn ? 700 : 400, flex: 1 }}>
                    {COUNTRY_NAMES[slug]}
                  </span>
                  {isOn && <div style={{ width: 7, height: 7, borderRadius: '50%', background: COUNTRY_COLORS[slug], flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Контент */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Легенда */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {selected.map(slug => (
              <div key={slug} onClick={() => toggleCountry(slug)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: T.card, border: `1.5px solid ${COUNTRY_COLORS[slug]}`,
                borderRadius: 20, padding: '5px 12px', cursor: 'pointer', boxShadow: T.shadow,
              }}>
                <Flag slug={slug} size={16} />
                <div style={{ width: 18, height: 2.5, background: COUNTRY_COLORS[slug], borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: COUNTRY_COLORS[slug] }}>{COUNTRY_NAMES[slug]}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 15, color: T.sub }}>Загрузка данных...</div>
              </div>
            </Card>
          ) : (
            <>
              {activeSection === 'population' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Численность населения" sub="млн человек · 1990–2035 · голубая зона — прогноз" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(popData, 'population_total')} yLabel="млн" width={720} height={260} />
                    </div>
                  </Card>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
                    {selected.map(slug => (
                      <StatCard key={slug} slug={slug}
                        value={getLatest(popData, slug, 'population_total') ?? '—'} unit="млн" sub="население 2025"
                        extra={
                          <span>
                            <span style={{ color: T.accent, fontWeight: 700 }}>{getLatest(popData, slug, 'population_15_64')}%</span> раб. возраст &nbsp;
                            <span style={{ color: '#d97706', fontWeight: 700 }}>{getLatest(popData, slug, 'population_65plus')}%</span> 65+
                          </span>
                        }
                        sparkData={(popData[slug]||[]).map(r => ({ value: r.population_total }))}
                      />
                    ))}
                  </div>
                  <Card>
                    <SectionTitle label="Доля рабочего возраста (15–64)" sub="% от общего населения" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(popData, 'population_15_64')} yLabel="%" width={720} height={220} />
                    </div>
                  </Card>
                </div>
              )}

              {activeSection === 'workforce' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Доля рабочей силы" sub="% от общего населения" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(wfData, 'workforce_rate')} yLabel="%" width={720} height={260} />
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle label="Молодёжная безработица (15–24)" sub="% · структурный риск рынка труда" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(wfData, 'youth_unemployment')} yLabel="%" width={720} height={220} />
                    </div>
                  </Card>
                </div>
              )}

              {activeSection === 'edu_structure' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Доля высшего образования" sub="% населения 25+ · тренд роста" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(eduStructData, 'tertiary_edu')} yLabel="%" width={720} height={260} />
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle label="Структура образования 2025" sub="🔴 без образования · 🟠 начальное · 🔵 среднее · 🟢 высшее" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {selected.map(slug => (
                        <div key={slug} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 90px', alignItems: 'center', gap: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Flag slug={slug} size={20} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{COUNTRY_NAMES[slug]}</span>
                          </div>
                          <StackedBar data={eduStructData[slug]||[]} year={2025} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', textAlign: 'right' }}>
                            {getLatest(eduStructData, slug, 'tertiary_edu') ?? '—'}% ВО
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {activeSection === 'edu_quality' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Индекс качества образования" sub="0–100 · агрегировано PISA + UNESCO" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(eduQualData, 'quality_index')} yLabel="0–100" width={720} height={260} />
                    </div>
                  </Card>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
                    {selected.map(slug => {
                      const qi = getLatest(eduQualData, slug, 'quality_index')
                      return (
                        <div key={slug} style={{ background: T.card, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.border}`, padding: 20, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: COUNTRY_COLORS[slug], borderRadius: '16px 16px 0 0' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Flag slug={slug} size={22} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{COUNTRY_NAMES[slug]}</span>
                          </div>
                          <div style={{ fontSize: 32, fontWeight: 800, color: T.text, lineHeight: 1, marginBottom: 4 }}>{qi ?? '—'}</div>
                          <div style={{ fontSize: 11, color: T.sub, marginBottom: 10 }}>индекс качества</div>
                          <div style={{ height: 6, background: T.border, borderRadius: 3, marginBottom: 12 }}>
                            <div style={{ height: '100%', width: `${qi}%`, background: COUNTRY_COLORS[slug], borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 12, color: T.sub }}>
                            PISA: <strong style={{ color: T.text }}>{getLatest(eduQualData, slug, 'pisa_score') ?? 'н/д'}</strong><br />
                            Грамотность: <strong style={{ color: T.text }}>{getLatest(eduQualData, slug, 'literacy_rate') ? `${getLatest(eduQualData, slug, 'literacy_rate')}%` : '—'}</strong>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeSection === 'labor_value' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Средняя зарплата" sub="USD / месяц" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(laborData, 'avg_wage_usd')} yLabel="USD/мес" width={720} height={260} />
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle label="Привлекательность рынка труда" sub="0–100 · чем выше — тем выгоднее для инвестора" />
                    {selected
                      .map(slug => ({ slug, val: getLatest(laborData, slug, 'value_score') }))
                      .sort((a, b) => (b.val||0) - (a.val||0))
                      .map(({ slug, val }) => <RankBar key={slug} slug={slug} val={val ?? 0} />)
                    }
                  </Card>
                </div>
              )}

              {activeSection === 'hci' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Human Capital Index" sub="Агрегированный индекс · демография × образование × труд" />
                    <div style={{ overflowX: 'auto' }}>
                      <LineChart datasets={makeDatasets(hciData, 'hci_score')} yLabel="0–100" width={720} height={260} />
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle label="Сравнение с США" sub="HCI 2025 · США = 100 · синяя линия — базовый уровень" />
                    {selected
                      .map(slug => ({ slug, val: getLatest(hciData, slug, 'hci_vs_usa') }))
                      .sort((a, b) => (b.val||0) - (a.val||0))
                      .map(({ slug, val }) => (
                        <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 150, flexShrink: 0 }}>
                            <Flag slug={slug} size={20} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{COUNTRY_NAMES[slug]}</span>
                          </div>
                          <div style={{ flex: 1, height: 10, background: T.border, borderRadius: 5, position: 'relative', overflow: 'visible' }}>
                            <div style={{ height: '100%', width: `${Math.min(val, 110)}%`, background: val >= 100 ? '#22c55e' : COUNTRY_COLORS[slug], borderRadius: 5, transition: 'width 0.5s ease', maxWidth: '100%' }} />
                            <div style={{ position: 'absolute', left: '91%', top: -5, bottom: -5, width: 2, background: T.accent, borderRadius: 1 }} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: val >= 100 ? '#22c55e' : COUNTRY_COLORS[slug], width: 44, textAlign: 'right' }}>{val ?? '—'}</span>
                        </div>
                      ))
                    }
                  </Card>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {selected.map(slug => {
                      const row = hciData[slug]?.filter(r => !r.is_forecast).slice(-1)[0]
                      if (!row) return null
                      return (
                        <div key={slug} style={{ background: T.card, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.border}`, padding: 20, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: COUNTRY_COLORS[slug], borderRadius: '16px 16px 0 0' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Flag slug={slug} size={22} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{COUNTRY_NAMES[slug]}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: T.text, marginLeft: 'auto' }}>{row.hci_score}</span>
                          </div>
                          {[
                            { label: 'Демография',  val: row.component_demo,      color: T.accent },
                            { label: 'Раб. сила',   val: row.component_workforce, color: '#7c3aed' },
                            { label: 'Образование', val: row.component_education, color: '#059669' },
                            { label: 'Рынок труда', val: row.component_labor,     color: '#d97706' },
                          ].map(({ label, val, color }) => (
                            <div key={label} style={{ marginBottom: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: T.sub }}>{label}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color }}>{val}</span>
                              </div>
                              <div style={{ height: 5, background: T.border, borderRadius: 3 }}>
                                <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3 }} />
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
