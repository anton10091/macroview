'use client'
import React, { useState, useEffect, useRef } from 'react'
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
    <img
      src={`/flags/${slug}.png`}
      onError={e => { e.target.onerror = null; e.target.src = `https://flagcdn.com/w40/${code}.png` }}
      width={Math.round(size * 1.33)} height={size} alt={slug}
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

function LineChart({ datasets, yLabel = '' }) {
  const [hover, setHover] = useState(null)
  const containerRef = useRef(null)
  const [containerW, setContainerW] = useState(800)

  useEffect(() => {
    const update = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (!datasets || datasets.length === 0) return <div ref={containerRef} />

  const pad = { top: 24, right: 20, bottom: 36, left: 58 }
  const W = containerW - pad.left - pad.right
  const H = 280

  const allYears = [...new Set(datasets.flatMap(d => d.points.map(p => p.year)))].sort()
  const minY = Math.min(...allYears), maxY = Math.max(...allYears)
  const yearRange = maxY - minY || 1
  const forecastYear = 2024

  // Каждая страна — своя линия (не stacked), мир — пунктир
  const worldDs = datasets.find(d => d.slug === 'world')
  const countryDs = datasets.filter(d => d.slug !== 'world')

  // Шкала Y — линейная, от 0 до max всех значений
  const allVals = datasets.flatMap(d => d.points.map(p => p.value)).filter(v => v > 0)
  const maxV = Math.max(...allVals) * 1.08

  const xPos = yr => ((yr - minY) / yearRange) * W
  const yPos = v => H - (v / maxV) * H
  const xLabels = allYears.filter(y => y % 5 === 0)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) - pad.left
    const ratio = Math.max(0, Math.min(1, mouseX / W))
    const yearEst = minY + ratio * yearRange
    const snapped = allYears.reduce((a, b) => Math.abs(b - yearEst) < Math.abs(a - yearEst) ? b : a)
    const points = datasets.map(ds => {
      const pt = ds.points.find(p => p.year === snapped)
      return pt ? { slug: ds.slug, value: pt.value, color: ds.color } : null
    }).filter(Boolean)
    const xPx = xPos(snapped)
    setHover({ x: xPx, year: snapped, points })
  }

  // Строим точки линий — факт и прогноз отдельно для пунктира
  const buildLineParts = (ds) => {
    const fact = ds.points.filter(p => p.year < forecastYear).map(p => `${xPos(p.year)},${yPos(p.value)}`).join(' ')
    const forecast = ds.points.filter(p => p.year >= forecastYear - 1).map(p => `${xPos(p.year)},${yPos(p.value)}`).join(' ')
    const area = [...ds.points.filter(p => p.year < forecastYear).map(p => `${xPos(p.year)},${yPos(p.value)}`),
      `${xPos(Math.min(forecastYear - 1, maxY))},${yPos(0)}`, `${xPos(minY)},${yPos(0)}`].join(' ')
    return { fact, forecast, area }
  }

  const svgH = H + pad.top + pad.bottom

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={svgH} viewBox={`0 0 ${containerW} ${svgH}`}
        style={{ overflow: 'visible', cursor: 'crosshair', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <g transform={`translate(${pad.left},${pad.top})`}>

          {/* Фон факт — белый, прогноз — светло-серый */}
          <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" rx="0" />
          <rect x={xPos(forecastYear)} y={0} width={W - xPos(forecastYear)} height={H} fill="#F0F4FF" />

          {/* Разделитель факт/прогноз */}
          <line x1={xPos(forecastYear)} y1={0} x2={xPos(forecastYear)} y2={H}
            stroke={T.accent} strokeWidth="1.5" strokeDasharray="5,4" opacity="0.6" />

          {/* Метки ФАКТ / ПРОГНОЗ */}
          <text x={xPos(forecastYear) - 8} y={-8} textAnchor="end"
            fill={T.sub} fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="500">ФАКТ</text>
          <text x={xPos(forecastYear) + 8} y={-8} textAnchor="start"
            fill={T.accent} fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">ПРОГНОЗ</text>

          {/* Grid горизонтальный */}
          {Array.from({ length: 5 }).map((_, i) => {
            const v = (maxV / 4) * i
            const y = yPos(v)
            const label = v >= 1000 ? `${(v/1000).toFixed(1)}k` : Math.round(v)
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={W} y2={y} stroke={T.border} strokeWidth="1" opacity="0.7" />
                <text x={-6} y={y + 4} textAnchor="end" fill={T.sub} fontSize="10"
                  fontFamily="-apple-system,sans-serif">{label}</text>
              </g>
            )
          })}

          {/* X метки каждые 5 лет */}
          {xLabels.map(yr => (
            <g key={yr}>
              <text x={xPos(yr)} y={H + 20} textAnchor="middle" fill={T.sub} fontSize="10"
                fontFamily="-apple-system,sans-serif">{yr}</text>
            </g>
          ))}

          {/* Линии стран */}
          {countryDs.map(ds => {
            const { fact, forecast, area } = buildLineParts(ds)
            return (
              <g key={ds.slug}>
                {/* Площадь (факт) */}
                <polygon points={area} fill={ds.color} opacity="0.08" />
                {/* Линия факт */}
                {fact && <polyline points={fact} fill="none" stroke={ds.color} strokeWidth="2.5"
                  strokeLinejoin="round" strokeLinecap="round" />}
                {/* Линия прогноз — пунктир того же цвета */}
                {forecast && <polyline points={forecast} fill="none" stroke={ds.color} strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,4" opacity="0.75" />}
              </g>
            )
          })}

          {/* Мир — пунктир серый поверх */}
          {worldDs && (() => {
            const { fact, forecast } = buildLineParts(worldDs)
            return (
              <g>
                {fact && <polyline points={fact} fill="none" stroke={worldDs.color} strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round" strokeDasharray="8,4" />}
                {forecast && <polyline points={forecast} fill="none" stroke={worldDs.color} strokeWidth="1.5"
                  strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4,4" opacity="0.6" />}
              </g>
            )
          })()}

          {/* Crosshair */}
          {hover && (
            <g>
              <line x1={hover.x} y1={0} x2={hover.x} y2={H}
                stroke="#1A1A2E" strokeWidth="1" opacity="0.25" />
              {/* Год на оси X */}
              <rect x={hover.x - 20} y={H + 5} width={40} height={16} fill={T.accent} rx="4" />
              <text x={hover.x} y={H + 16} textAnchor="middle" fill="#fff" fontSize="10"
                fontWeight="bold" fontFamily="-apple-system,sans-serif">{hover.year}</text>
              {/* Точки на линиях */}
              {hover.points.map(p => {
                const cy = yPos(p.value)
                return (
                  <circle key={p.slug} cx={hover.x} cy={cy} r="5"
                    fill={p.color} stroke="#fff" strokeWidth="2" />
                )
              })}
            </g>
          )}

          {/* Y label */}
          <text transform={`rotate(-90) translate(${-H / 2}, -44)`} textAnchor="middle"
            fill={T.sub} fontSize="10" fontFamily="-apple-system,sans-serif">{yLabel}</text>
        </g>
      </svg>

      {/* Тултип */}
      {hover && containerRef.current && (
        <div style={{
          position: 'absolute',
          left: (() => {
            const x = hover.x + pad.left
            return x + 160 > containerW ? x - 165 : x + 14
          })(),
          top: pad.top,
          background: '#1A1A2E', color: '#fff',
          borderRadius: 12, padding: '12px 16px',
          fontSize: 12, fontFamily: '-apple-system,sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          pointerEvents: 'none', zIndex: 10, minWidth: 155,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: '#aab4c8', fontSize: 11,
            borderBottom: '1px solid #ffffff18', paddingBottom: 8 }}>
            {hover.year} {hover.year >= forecastYear ? '· прогноз' : '· факт'}
          </div>
          {hover.points.sort((a, b) => b.value - a.value).map(p => (
            <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ color: '#cbd5e1', flex: 1, fontSize: 11 }}>{COUNTRY_NAMES[p.slug]}</span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>{p.value?.toLocaleString('ru')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
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

const GRAPH_DESCRIPTIONS = {
  population: {
    label: 'Население',
    body: 'График показывает фактическую численность населения с 1990 года и прогноз до 2035. Сплошная линия — верифицированные данные, пунктир — модельный прогноз на основе текущих демографических тенденций.',
    bullets: [
      { color: '#15803d', text: 'Растущее население означает расширение внутреннего рынка, рост потребительского спроса и долгосрочный потенциал ВВП.' },
      { color: '#0066FF', text: 'Доля трудоспособного возраста (15–64) определяет производительную базу экономики и объём налоговых поступлений.' },
      { color: '#d97706', text: 'Рост доли населения 65+ создаёт нагрузку на пенсионную систему, здравоохранение и государственный бюджет.' },
    ],
    source: 'UN World Population Prospects · World Bank',
  },
  workforce: {
    label: 'Рабочая сила',
    body: 'Доля экономически активного населения и уровень молодёжной безработицы. Высокая занятость молодёжи — индикатор качества институтов рынка труда и перспектив роста.',
    bullets: [
      { color: '#15803d', text: 'Высокая доля рабочей силы при низкой безработице — признак эффективного рынка труда и инвестиционной привлекательности страны.' },
      { color: '#d97706', text: 'Молодёжная безработица выше 20% — структурный риск: потерянное поколение снижает производительность и увеличивает социальную нагрузку на бюджет.' },
      { color: '#0066FF', text: 'Сравнение стран в динамике выявляет тренды: улучшение показателей обычно предшествует ускорению экономического роста.' },
    ],
    source: 'ILO · World Bank · OECD',
  },
  edu_structure: {
    label: 'Образование',
    body: 'Структура образования населения 25+ и доля лиц с высшим образованием. Качество человеческого капитала напрямую определяет конкурентоспособность экономики.',
    bullets: [
      { color: '#15803d', text: 'Высокая доля населения с высшим образованием коррелирует с производительностью труда, инновационным потенциалом и уровнем зарплат.' },
      { color: '#0066FF', text: 'Рост доли высшего образования — долгосрочный позитивный сигнал для инвестиций в технологический и финансовый секторы страны.' },
      { color: '#d97706', text: 'Большая доля населения без образования ограничивает структурные реформы и снижает производительность экономики в целом.' },
    ],
    source: 'UNESCO · Barro-Lee · World Bank',
  },
  edu_quality: {
    label: 'Качество образования',
    body: 'Агрегированный индекс качества образования на основе данных PISA и UNESCO. Отражает реальный уровень подготовки рабочей силы, а не только формальный охват образованием.',
    bullets: [
      { color: '#15803d', text: 'Высокий индекс качества означает, что выпускники способны применять знания на практике — это критически важно для высокотехнологичных секторов.' },
      { color: '#0066FF', text: 'Разрыв между охватом и качеством образования сигнализирует о структурных проблемах рынка труда.' },
      { color: '#d97706', text: 'Страны с быстро растущим индексом качества — кандидаты на технологический рывок и привлечение иностранных инвестиций в R&D.' },
    ],
    source: 'PISA (OECD) · UNESCO Institute for Statistics',
  },
  labor_value: {
    label: 'Рынок труда',
    body: 'Средняя зарплата в USD и агрегированный индекс привлекательности рынка труда для инвестора. Сочетает стоимость и качество рабочей силы.',
    bullets: [
      { color: '#15803d', text: 'Низкая зарплата при высоком качестве образования — признак недооценённого рынка труда с потенциалом роста производительности.' },
      { color: '#0066FF', text: 'Индекс привлекательности выше 70 означает оптимальное соотношение стоимости, квалификации и гибкости рабочей силы.' },
      { color: '#d97706', text: 'Быстрый рост зарплат без роста производительности — сигнал перегрева и возможного снижения конкурентоспособности.' },
    ],
    source: 'ILO · World Bank · национальные статистические службы',
  },
  hci: {
    label: 'Индекс HCI',
    body: 'Human Capital Index — агрегированный показатель качества человеческого капитала. Объединяет демографию, рабочую силу, образование и рынок труда в единую оценку 0–100.',
    bullets: [
      { color: '#15803d', text: 'HCI выше 70 — страна формирует высококвалифицированную рабочую силу, способную поддерживать рост производительности и инновации.' },
      { color: '#0066FF', text: 'Сравнение с США показывает относительный разрыв и потенциал конвергенции при правильной политике.' },
      { color: '#d97706', text: 'Низкий HCI при высоком ВВП на душу населения — признак ресурсной зависимости.' },
    ],
    source: 'World Bank Human Capital Project · UN HDR',
  },
  rd: {
    label: 'Наука и R&D',
    body: 'Расходы на исследования и разработки (R&D) в % от ВВП. Один из ключевых индикаторов инновационного потенциала по методологии Рея Далио. Данные 1996-2023 гг. по всем секторам: бизнес, государство, университеты, НКО.',
    bullets: [
      { color: '#15803d', text: 'R&D выше 2.5% ВВП с растущей динамикой - признак страны на подъёме: технологический рывок, рост производительности, экспортная конкурентоспособность.' },
      { color: '#0066FF', text: 'Мета-анализ 65 стран: +1% R&D/ВВП даёт +0.9% долгосрочного роста ВВП с лагом 10-15 лет (Guellec & van Pottelsberghe, OECD).' },
      { color: '#d97706', text: 'Высокий R&D необходим, но недостаточен. Япония в 1989 г. имела 3%+ R&D и крупнейший долговой пузырь в истории. R&D определяет потенциал, долговой цикл определяет реализацию.' },
    ],
    source: 'World Bank / UNESCO Institute for Statistics',
  },
}

function GraphDescription({ type }) {
  const cfg = GRAPH_DESCRIPTIONS[type]
  if (!cfg) return null
  return (
    <div style={{ background: '#ffffff', border: '0.5px solid #e8e2d8', borderRadius: '12px', padding: '20px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', marginBottom: 5 }}>О графике · {cfg.label}</div>
        <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.75, margin: 0 }}>{cfg.body}</p>
      </div>
      <div style={{ borderTop: '0.5px solid #e8e2d8', paddingTop: 14 }}>
        <div style={{ fontSize: 11, color: '#9a948e', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Что это значит для инвестора</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cfg.bullets.map(({ color, text }, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
              <p style={{ fontSize: 12, color: '#4a4540', lineHeight: 1.6, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 14, padding: '8px 12px', background: '#f0f4f9', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#6a8ec8', fontFamily: 'monospace' }}>Источник: {cfg.source}</span>
        <span style={{ fontSize: 11, color: '#9a948e', fontFamily: 'monospace' }}>Факт + прогноз</span>
      </div>
    </div>
  )
}

// Моки для вкладок без своей таблицы БД (временно, до создания отдельных таблиц)
const ANALYTICS_MOCK_OTHER = {
  workforce: [
    { id: 'wf-youth-unemployment-2024', title: 'Молодёжная безработица в развивающихся странах: структурная проблема или временный кризис?', excerpt: 'В Испании и Турции каждый четвёртый молодой человек без работы. Анализ причин и долгосрочных последствий для экономического роста.', date: '2024-11-01', tags: ['безработица', 'молодёжь', 'риски'], read_time: 7 },
    { id: 'wf-uae-labor-2024', title: 'Рынок труда ОАЭ: высокая активность при уязвимой структуре', excerpt: 'Доля рабочей силы в ОАЭ одна из самых высоких в мире, но 88% составляют иностранцы. Что это означает для устойчивости экономики?', date: '2024-09-15', tags: ['ОАЭ', 'рынок труда', 'структура'], read_time: 6 },
    { id: 'wf-automation-2024', title: 'Автоматизация против занятости: кто пострадает больше всего к 2030 году?', excerpt: 'МОТ прогнозирует замещение 85 млн рабочих мест к 2025 году. Анализируем какие страны наиболее уязвимы и где лучшая защита.', date: '2024-08-20', tags: ['автоматизация', 'занятость', 'прогноз'], read_time: 8 },
    { id: 'wf-india-dividend-2024', title: 'Демографический дивиденд Индии: 600 млн человек трудоспособного возраста', excerpt: 'К 2030 году Индия будет иметь крупнейшую рабочую силу в мире. Разбираем готова ли экономика страны использовать этот потенциал.', date: '2024-07-05', tags: ['Индия', 'рабочая сила', 'потенциал'], read_time: 7 },
  ],
  edu_structure: [
    { id: 'edu-asia-boom-2024', title: 'Образовательный бум Азии: Китай и Индия производят больше инженеров чем весь западный мир', excerpt: 'Ежегодно в Китае выпускается 4.7 млн инженеров. Анализируем как это меняет глобальный технологический баланс.', date: '2024-10-10', tags: ['образование', 'Азия', 'технологии'], read_time: 7 },
    { id: 'edu-russia-brain-drain-2024', title: 'Утечка мозгов из России: масштаб и последствия для человеческого капитала', excerpt: 'С 2022 года Россию покинули сотни тысяч специалистов с высшим образованием. Оцениваем долгосрочный ущерб для экономики.', date: '2024-09-01', tags: ['Россия', 'миграция', 'образование'], read_time: 8 },
  ],
  edu_quality: [
    { id: 'pisa-2023-results', title: 'Результаты PISA 2023: кто лидирует и что это значит для инвесторов', excerpt: 'Сингапур, Япония и Корея на вершине. Анализируем корреляцию между результатами PISA и долгосрочным экономическим ростом.', date: '2024-08-15', tags: ['PISA', 'образование', 'рейтинг'], read_time: 6 },
  ],
  labor_value: [
    { id: 'wages-sea-2024', title: 'Зарплатная революция в Юго-Восточной Азии: Вьетнам догоняет Китай', excerpt: 'Зарплаты во Вьетнаме выросли на 40% за 5 лет. Анализируем как это меняет карту производственных инвестиций в регионе.', date: '2024-11-05', tags: ['зарплаты', 'ЮВА', 'производство'], read_time: 6 },
    { id: 'labor-index-2024', title: 'Индекс привлекательности рынков труда 2024: Грузия и Казахстан в топ-10', excerpt: 'Неожиданные лидеры по соотношению цена/качество рабочей силы. Разбираем методологию и инвестиционные выводы.', date: '2024-10-22', tags: ['индекс', 'рейтинг', 'инвестиции'], read_time: 5 },
  ],
  hci: [
    { id: 'hci-world-bank-2024', title: 'Human Capital Index 2024: Россия падает, Казахстан растёт', excerpt: 'Всемирный банк обновил индекс человеческого капитала. Анализируем позиции стран из нашего покрытия и их инвестиционные импликации.', date: '2024-09-30', tags: ['HCI', 'рейтинг', 'человеческий капитал'], read_time: 7 },
  ],
}

const SECTION_TAG_COLORS = {
  'Индия': '#d97706', 'Китай': '#dc2626', 'Россия': '#7c3aed', 'ОАЭ': '#059669',
  'Грузия': '#ea580c', 'Вьетнам': '#ca8a04', 'Узбекистан': '#f59e0b', 'Европа': '#0891b2',
  'ЮВА': '#0d9488', 'демография': '#6366f1', 'рост': '#15803d', 'риски': '#dc2626',
  'образование': '#2563eb', 'зарплаты': '#059669', 'HCI': '#1a3a6a',
}

function AnalyticsBlock({ section }) {
  const [page, setPage] = React.useState(0)
  const [articles, setArticles] = React.useState([])
  const [loadingArticles, setLoadingArticles] = React.useState(false)
  const PER_PAGE = 3

  React.useEffect(() => {
    setPage(0)
    if (section === 'population') {
      setLoadingArticles(true)
      supabase
        .from('population_analytics')
        .select('id, slug, title, excerpt, cover_url, read_time, tags, gradient_index, date, section_tag')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('date', { ascending: false })
        .limit(9)
        .then(({ data, error }) => {
          if (!error && data) setArticles(data)
          setLoadingArticles(false)
        })
    } else {
      setArticles(ANALYTICS_MOCK_OTHER[section] || [])
    }
  }, [section])

  const totalPages = Math.min(3, Math.ceil(articles.length / PER_PAGE))
  const visible = articles.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  if (loadingArticles) return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '32px 24px', textAlign: 'center', color: T.sub, fontSize: 14, fontFamily: '-apple-system,sans-serif' }}>
      Загрузка аналитики...
    </div>
  )

  if (!articles.length) return null

  const GRADIENTS = [
    'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 60%, #2563eb 100%)',
    'linear-gradient(135deg, #1a0f3d 0%, #3a1a6a 60%, #7c3aed 100%)',
    'linear-gradient(135deg, #0f2d1f 0%, #0f6e56 60%, #1d9e75 100%)',
    'linear-gradient(135deg, #2d1a0f 0%, #6a3a1a 60%, #d97706 100%)',
    'linear-gradient(135deg, #1f0f2d 0%, #6a1a3a 60%, #db2777 100%)',
    'linear-gradient(135deg, #0f1f2d 0%, #0f4a6a 60%, #0891b2 100%)',
    'linear-gradient(135deg, #1a1f0f 0%, #3a6a1a 60%, #16a34a 100%)',
    'linear-gradient(135deg, #2d1f0f 0%, #6a4a1a 60%, #ca8a04 100%)',
  ]

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '20px 24px', boxShadow: T.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 36, background: T.accent, borderRadius: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: '-apple-system,sans-serif', lineHeight: 1.2 }}>Аналитика по теме</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 3, fontFamily: '-apple-system,sans-serif' }}>Исследования и разборы · {articles.length} материалов</div>
          </div>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === i ? T.accent : 'transparent',
                color: page === i ? '#fff' : T.sub,
                border: `1px solid ${page === i ? T.accent : T.border}`,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                transition: 'all 0.15s',
              }}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {visible.map((article, idx) => {
          const globalIdx = page * PER_PAGE + idx
          return (
            <a key={article.id} href={`/analytics/${article.slug || article.id}`} target="_blank" rel="noopener noreferrer" style={{
              background: T.card, borderRadius: T.radius,
              boxShadow: T.shadow, border: `1px solid ${T.border}`,
              overflow: 'hidden', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              transition: 'box-shadow 0.15s, transform 0.15s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{
                height: 160, background: GRADIENTS[globalIdx % GRADIENTS.length],
                position: 'relative', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 12, left: 14,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 11, fontWeight: 600, color: '#fff',
                  fontFamily: '-apple-system,sans-serif',
                }}>Аналитика</div>
                <div style={{
                  position: 'absolute', top: 12, right: 14,
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 6, padding: '3px 8px',
                  fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'monospace',
                }}>{article.read_time} мин</div>
              </div>

              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace' }}>
                  {new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.4, fontFamily: '-apple-system,sans-serif' }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.55, fontFamily: '-apple-system,sans-serif', flex: 1 }}>
                  {article.excerpt.length > 100 ? article.excerpt.slice(0, 100) + '...' : article.excerpt}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
                      fontFamily: '-apple-system,sans-serif',
                      background: SECTION_TAG_COLORS[tag] ? `${SECTION_TAG_COLORS[tag]}15` : '#f0f4f9',
                      color: SECTION_TAG_COLORS[tag] || T.sub,
                      border: `1px solid ${SECTION_TAG_COLORS[tag] ? `${SECTION_TAG_COLORS[tag]}30` : T.border}`,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          )
        })}
      </div>
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
  const [rdData, setRdData]               = useState({})
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const results = await Promise.all([
          supabase.from('population_history').select('*').order('year').limit(2000),
          supabase.from('workforce_share').select('*').order('year').limit(2000),
          supabase.from('education_structure').select('*').order('year').limit(2000),
          supabase.from('education_quality').select('*').order('year').limit(2000),
          supabase.from('labor_cost_quality').select('*').order('year').limit(2000),
          supabase.from('human_capital_index').select('*').order('year').limit(2000),
          supabase.from('rd_expenditure').select('*').order('year').limit(2000),
        ])
        const [pop, wf, eduS, eduQ, labor, hci, rd] = results.map(r => r.data || [])
        const group = rows => {
          const map = {}
          ;(rows||[]).forEach(r => { if (!map[r.country_slug]) map[r.country_slug]=[]; map[r.country_slug].push(r) })
          return map
        }
        setPopData(group(pop)); setWfData(group(wf)); setEduStructData(group(eduS))
        setEduQualData(group(eduQ)); setLaborData(group(labor)); setHciData(group(hci))
        setRdData(group(rd))
      } catch(e) {
        console.error('Ошибка загрузки:', e)
      } finally {
        setLoading(false)
      }
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

  const getLatestYear = (dataMap, slug) => {
    const rows = dataMap[slug]; if (!rows?.length) return null
    const row = rows.filter(r => !r.is_forecast).slice(-1)[0] || rows.slice(-1)[0]
    return row?.year
  }

  const SECTIONS = [
    { id: 'population',    label: 'Население',    icon: '👥' },
    { id: 'workforce',     label: 'Рабочая сила', icon: '💼' },
    { id: 'edu_structure', label: 'Образование',  icon: '🎓' },
    { id: 'edu_quality',   label: 'Качество',     icon: '📐' },
    { id: 'labor_value',   label: 'Рынок труда',  icon: '⚖️' },
    { id: 'hci',           label: 'Индекс HCI',   icon: '🏆' },
    { id: 'rd',            label: 'Наука и R&D',  icon: '🔬' },
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
            <div style={{ width: 52, height: 52, borderRadius: 16, background: T.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌍</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>Человеческий капитал</h1>
              <p style={{ fontSize: 13, color: T.sub, margin: '4px 0 0' }}>Население, образование и рынок труда · 20 стран + Мир · 1990–2035</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', justifyContent: 'center' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '12px 22px', borderRadius: '12px 12px 0 0',
                background: activeSection === s.id ? T.bg : 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeSection === s.id ? T.accent : 'transparent'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: 15, fontWeight: activeSection === s.id ? 700 : 500,
                color: activeSection === s.id ? T.accent : T.sub,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 17 }}>{s.icon}</span> {s.label}
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
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(popData, 'population_total')} yLabel="млн"  />
                    </div>
                  </Card>
                  <GraphDescription type="population" />
                  <AnalyticsBlock section="population" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
                    {selected.map(slug => (
                      <StatCard key={slug} slug={slug}
                        value={(() => { const v = getLatest(popData, slug, 'population_total'); return v != null ? Number(v).toFixed(1) : '—' })()}
                        unit="млн" sub={`население ${getLatestYear(popData, slug) ?? '—'}`}
                        sparkData={(popData[slug]||[]).map(r => ({ value: r.population_total }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'workforce' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Доля рабочей силы" sub="% от общего населения" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(wfData, 'workforce_rate')} yLabel="%"  />
                    </div>
                  </Card>
                  <GraphDescription type="workforce" />
                  <Card>
                    <SectionTitle label="Молодёжная безработица (15–24)" sub="% · структурный риск рынка труда" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(wfData, 'youth_unemployment')} yLabel="%"  />
                    </div>
                  </Card>
                  <AnalyticsBlock section="workforce" />
                </div>
              )}

              {activeSection === 'edu_structure' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Доля высшего образования" sub="% населения 25+ · тренд роста" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(eduStructData, 'tertiary_edu')} yLabel="%"  />
                    </div>
                  </Card>
                  <GraphDescription type="edu_structure" />
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
                  <AnalyticsBlock section="edu_structure" />
                </div>
              )}

              {activeSection === 'edu_quality' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Индекс качества образования" sub="0–100 · агрегировано PISA + UNESCO" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(eduQualData, 'quality_index')} yLabel="0–100"  />
                    </div>
                  </Card>
                  <GraphDescription type="edu_quality" />
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
                  <AnalyticsBlock section="edu_quality" />
                </div>
              )}

              {activeSection === 'labor_value' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Средняя зарплата" sub="USD / месяц" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(laborData, 'avg_wage_usd')} yLabel="USD/мес"  />
                    </div>
                  </Card>
                  <GraphDescription type="labor_value" />
                  <Card>
                    <SectionTitle label="Привлекательность рынка труда" sub="0–100 · чем выше — тем выгоднее для инвестора" />
                    {selected
                      .map(slug => ({ slug, val: getLatest(laborData, slug, 'value_score') }))
                      .sort((a, b) => (b.val||0) - (a.val||0))
                      .map(({ slug, val }) => <RankBar key={slug} slug={slug} val={val ?? 0} />)
                    }
                  </Card>
                  <AnalyticsBlock section="labor_value" />
                </div>
              )}

              {activeSection === 'hci' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <SectionTitle label="Human Capital Index" sub="Агрегированный индекс · демография × образование × труд" />
                    <div style={{ overflowX: 'hidden' }}>
                      <LineChart datasets={makeDatasets(hciData, 'hci_score')} yLabel="0–100"  />
                    </div>
                  </Card>
                  <GraphDescription type="hci" />
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
                  <AnalyticsBlock section="hci" />
                </div>
              )}

              {activeSection === 'rd' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Card>
                    <SectionTitle label="Расходы на R&D (% от ВВП)" sub="1996–2023 · World Bank / UNESCO UIS" />
                    <LineChart datasets={(() => {
                      return selected.map(slug => {
                        const rows = (rdData[slug] || [])
                          .map(r => ({ year: r.year, value: r.rd_pct_gdp }))
                          .filter(r => r.value != null)
                        return { slug, label: COUNTRY_NAMES[slug], color: COUNTRY_COLORS[slug], data: rows }
                      }).filter(d => d.data.length > 0)
                    })()} yLabel="%" />
                  </Card>

                  <GraphDescription type="rd" />

                  <Card>
                    <SectionTitle label="Рейтинг стран по последним данным" sub="% от ВВП · последний доступный год" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {selected
                        .map(slug => {
                          const rows = rdData[slug] || []
                          const last = rows.filter(r => r.rd_pct_gdp != null).slice(-1)[0]
                          return { slug, val: last?.rd_pct_gdp, year: last?.year }
                        })
                        .filter(r => r.val != null)
                        .sort((a, b) => b.val - a.val)
                        .map(({ slug, val, year }) => {
                          const pct = Math.min(100, (val / 6) * 100)
                          const color = COUNTRY_COLORS[slug]
                          return (
                            <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 150, flexShrink: 0 }}>
                                <Flag slug={slug} size={20} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{COUNTRY_NAMES[slug]}</span>
                              </div>
                              <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color, width: 54, textAlign: 'right', fontFamily: '-apple-system,sans-serif' }}>{val.toFixed(2)}%</span>
                              <span style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', width: 36 }}>{year}</span>
                            </div>
                          )
                        })}
                    </div>
                    <div style={{ marginTop: 20, padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ориентиры по Далио</div>
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        {[
                          { color: '#059669', label: 'Подъём: >2.5% и растёт' },
                          { color: '#d97706', label: 'Средний: 1–2.5%' },
                          { color: '#dc2626', label: 'Отставание: <1%, стагнация' },
                        ].map(({ color, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                            <span style={{ fontSize: 12, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <AnalyticsBlock section="rd" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
