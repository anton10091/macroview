'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCountry, THAILAND_REAL_ESTATE } from '../../../lib/mock'
import { Navbar } from '../../../components/layout/Navbar'
import { SignalBadge } from '../../../components/ui/SignalBadge'
import { DIRECTIONS } from '../../../lib/types'

export default function RealEstatePage() {
  const params = useParams()
  const country = getCountry(params.slug)
  if (!country) return notFound()

  const re = THAILAND_REAL_ESTATE

  const [budget, setBudget] = useState(150000)
  const [purpose, setPurpose] = useState('short')
  const [horizon, setHorizon] = useState(5)
  const [selectedDistrict, setSelectedDistrict] = useState(re.districts[0])
  const [activeTab, setActiveTab] = useState('signal')
  const [openLegal, setOpenLegal] = useState(null)
  const [checklist, setChecklist] = useState(re.checklist.map(() => false))

  const yieldRate = (purpose === 'short' ? selectedDistrict.rentalYield : selectedDistrict.rentalYield * 0.75) / 100
  const grossIncome = budget * yieldRate
  const netIncome = grossIncome * 0.75
  const payback = Math.round(budget / netIncome)
  const appreciation = budget * (Math.pow(1 + selectedDistrict.trend / 100, horizon) - 1)
  const totalReturn = netIncome * horizon + appreciation
  const totalYield = ((totalReturn / budget) * 100).toFixed(1)

  const TABS = [
    { id: 'signal',    label: '📡 Сигнал' },
    { id: 'calc',      label: '🧮 Калькулятор' },
    { id: 'districts', label: '🗺 Районы' },
    { id: 'forecast',  label: '🔭 Прогноз 10 лет' },
    { id: 'checklist', label: '✓ Чеклист' },
    { id: 'legal',     label: '⚖️ Право' },
  ]

  const signalBorderColor = re.signal === 'green' ? '#bbf7d0' : re.signal === 'yellow' ? '#fde047' : '#fecaca'
  const signalBgColor     = re.signal === 'green' ? '#f0fdf4' : re.signal === 'yellow' ? '#fefce8' : '#fef2f2'

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '20px 24px 0' }}>

          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>
            <Link href="/" style={{ color: '#9a948e', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <Link href={`/country/${params.slug}`} style={{ color: '#9a948e', textDecoration: 'none' }}>{country.flag} {country.name}</Link>
            <span>›</span>
            <span style={{ color: '#1a1612', fontWeight: 600 }}>🏠 Недвижимость</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 30 }}>🏠</span>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>
                  Недвижимость · {country.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SignalBadge signal={re.signal} index={re.resi} />
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>RESI · Real Estate Signal Index</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                [`от $${re.minEntry / 1000}к`, 'порог входа'],
                [re.avgYield,                  'доходность'],
                [re.payback,                   'окупаемость'],
              ].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center', background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1a1612' }}>{v}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Подменю направлений */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: '1px solid #e8e2d8' }}>
            <Link href={`/country/${params.slug}`} style={{
              fontFamily: 'monospace', fontSize: 10, color: '#9a948e', padding: '8px 12px',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>← {country.name}</Link>
            <div style={{ width: 1, background: '#e8e2d8', margin: '4px 4px' }} />
            {DIRECTIONS.map(dir => (
              <Link key={dir.id} href={`/country/${params.slug}/${dir.path}`} style={{
                fontFamily: 'monospace', fontSize: 11, padding: '10px 16px', whiteSpace: 'nowrap',
                borderBottom: dir.id === 'real-estate' ? '2px solid #1a3a6a' : '2px solid transparent',
                color: dir.id === 'real-estate' ? '#1a3a6a' : '#9a948e',
                fontWeight: dir.id === 'real-estate' ? 600 : 400,
                textDecoration: 'none',
              }}>{dir.icon} {dir.label}</Link>
            ))}
          </div>

          {/* Табы раздела */}
          <div style={{ display: 'flex', gap: 0, marginTop: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                fontFamily: 'monospace', fontSize: 11, padding: '10px 16px', whiteSpace: 'nowrap',
                borderBottom: activeTab === t.id ? '2px solid #1a3a6a' : '2px solid transparent',
                color: activeTab === t.id ? '#1a3a6a' : '#9a948e',
                fontWeight: activeTab === t.id ? 600 : 400,
                background: 'none', border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #1a3a6a' : '2px solid transparent',
                cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px' }}>

        {/* ─── СИГНАЛ ─── */}
        {activeTab === 'signal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ borderRadius: 12, border: `2px solid ${signalBorderColor}`, background: signalBgColor, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                RESI · Сигнал недвижимости
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1a1612' }}>{re.resi}</span>
                </div>
                <SignalBadge signal={re.signal} size="lg" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Вывод агента</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#2a2520', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{re.agentNote}</p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Четыре слоя RESI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '🔓 Доступность', val: 61,   weight: '40%', color: '#15803d' },
                  { label: '📈 Спрос',       val: 51,   weight: '30%', color: '#2563eb' },
                  { label: '🏗 Предложение', val: null, weight: '20%', color: '#d97706', note: 'Нет данных (макро режим)' },
                  { label: '⚠️ Риск',        val: 52,   weight: '10%', color: '#dc2626' },
                ].map(({ label, val, weight, color, note }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{weight}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{val ?? '—'}</span>
                      </div>
                    </div>
                    {val !== null && (
                      <div style={{ height: 6, background: '#f0ece6', borderRadius: 9999 }}>
                        <div style={{ height: '100%', borderRadius: 9999, width: `${val}%`, background: color }} />
                      </div>
                    )}
                    {note && <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#d97706', marginTop: 2 }}>{note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── КАЛЬКУЛЯТОР ─── */}
        {activeTab === 'calc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Параметры</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>Бюджет</span>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a3a6a' }}>${budget.toLocaleString()}</span>
                  </div>
                  <input type="range" min={40000} max={500000} step={10000} value={budget}
                    onChange={e => setBudget(+e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#1a3a6a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>$40k</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>$500k</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540', marginBottom: 8 }}>Цель</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['short', 'Краткоср. аренда'], ['long', 'Долгоср. аренда'], ['resale', 'Перепродажа']].map(([id, label]) => (
                      <button key={id} onClick={() => setPurpose(id)} style={{
                        flex: 1, fontFamily: 'monospace', fontSize: 10, borderRadius: 8, padding: '8px 4px',
                        border: `1px solid ${purpose === id ? '#1a3a6a' : '#e8e2d8'}`,
                        background: purpose === id ? '#1a3a6a' : '#fff',
                        color: purpose === id ? '#fff' : '#4a4540',
                        cursor: 'pointer',
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>Горизонт</span>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a3a6a' }}>{horizon} лет</span>
                  </div>
                  <input type="range" min={1} max={15} step={1} value={horizon}
                    onChange={e => setHorizon(+e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#1a3a6a' }}
                  />
                </div>

                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540', marginBottom: 8 }}>Район</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {re.districts.map(d => (
                      <button key={d.id} onClick={() => setSelectedDistrict(d)} style={{
                        fontFamily: 'monospace', fontSize: 10, borderRadius: 8, padding: '6px 12px',
                        border: `1px solid ${selectedDistrict.id === d.id ? '#1a3a6a' : '#e8e2d8'}`,
                        background: selectedDistrict.id === d.id ? '#1a3a6a' : '#fff',
                        color: selectedDistrict.id === d.id ? '#fff' : '#4a4540',
                        cursor: 'pointer',
                      }}>{d.name}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  Расчёт · {selectedDistrict.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Доходность',       val: `${(yieldRate * 100).toFixed(1)}% год.`, color: '#1a3a6a' },
                    { label: 'Чистый доход/год', val: `$${Math.round(netIncome).toLocaleString()}`, color: '#15803d' },
                    { label: 'Окупаемость',      val: `${payback} лет`,                            color: '#d97706' },
                    { label: 'Рост стоимости',   val: `$${Math.round(appreciation).toLocaleString()}`, color: '#15803d' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: '#faf8f4', border: '1px solid #f0ece6', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #1a3a6a, #2563eb)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Итог за {horizon} лет
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 900, color: '#fff' }}>
                      ${Math.round(totalReturn).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#93c5fd', marginTop: 4 }}>Совокупный доход</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#4ade80' }}>{totalYield}%</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#93c5fd', marginTop: 4 }}>Общая доходность</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 12, padding: 12 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#854d0e', margin: 0 }}>
                  ⚠️ Расчёт оценочный. Реальная доходность зависит от конкретного объекта и управляющей компании.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── РАЙОНЫ ─── */}
        {activeTab === 'districts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {re.districts.map(d => (
              <div key={d.id} onClick={() => setSelectedDistrict(d)} style={{
                background: '#fff',
                border: `2px solid ${selectedDistrict.id === d.id ? '#1a3a6a' : '#e8e2d8'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer',
                boxShadow: selectedDistrict.id === d.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 700, color: '#1a1612' }}>{d.name}</span>
                  <span style={{ fontSize: 14 }}>{d.signal === 'green' ? '🟢' : d.signal === 'yellow' ? '🟡' : '🔴'}</span>
                </div>
                {[
                  { label: 'Цена/м²', val: `$${(d.pricePerSqm / 1000).toFixed(0)}к` },
                  { label: 'Аренда',  val: `${d.rentalYield}%` },
                  { label: 'Тренд',   val: `+${d.trend}%` },
                  { label: 'Спрос',   val: d.demand === 'high' ? 'Высокий' : d.demand === 'medium' ? 'Средний' : 'Низкий' },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#1a1612' }}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ─── ПРОГНОЗ ─── */}
        {activeTab === 'forecast' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[{ title: 'Прогноз · 5 лет', data: re.forecast5y }, { title: 'Прогноз · 10 лет', data: re.forecast10y }].map(({ title, data }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {[data.positive, data.base, data.negative].map(s => (
                    <div key={s.label} style={{
                      borderRadius: 8, padding: 16,
                      border: `1px solid ${s.label === 'Позитивный' ? '#bbf7d0' : s.label === 'Базовый' ? '#bfdbfe' : '#fecaca'}`,
                      background: s.label === 'Позитивный' ? '#f0fdf4' : s.label === 'Базовый' ? '#eff6ff' : '#fef2f2',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{s.label}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>{s.probability}%</span>
                      </div>
                      <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a4540', lineHeight: 1.6, margin: 0 }}>{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── ЧЕКЛИСТ ─── */}
        {activeTab === 'checklist' && (
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {re.checklist.map((item, i) => (
              <div key={i} onClick={() => setChecklist(c => { const n = [...c]; n[i] = !n[i]; return n })} style={{
                background: '#fff',
                border: `1px solid ${checklist[i] ? '#bbf7d0' : '#e8e2d8'}`,
                borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: checklist[i] ? '#f0fdf4' : '#f5f2ee',
                  border: `2px solid ${checklist[i] ? '#22c55e' : '#e8e2d8'}`,
                }}>
                  {checklist[i]
                    ? <span style={{ color: '#16a34a', fontSize: 14, fontWeight: 700 }}>✓</span>
                    : <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', fontWeight: 700 }}>{item.step}</span>
                  }
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700,
                    color: checklist[i] ? '#9a948e' : '#1a1612',
                    textDecoration: checklist[i] ? 'line-through' : 'none',
                  }}>{item.title}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{item.description}</div>
                </div>
              </div>
            ))}
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', paddingTop: 8 }}>
              Выполнено: {checklist.filter(Boolean).length} / {checklist.length}
            </div>
          </div>
        )}

        {/* ─── ПРАВО ─── */}
        {activeTab === 'legal' && (
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {re.legal.map((item, i) => (
              <div key={i} onClick={() => setOpenLegal(openLegal === i ? null : i)} style={{
                background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612' }}>{item.question}</span>
                  <span style={{
                    color: '#9a948e', fontSize: 14,
                    transform: openLegal === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    display: 'inline-block',
                  }}>▾</span>
                </div>
                {openLegal === i && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0ece6' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540', lineHeight: 1.6, margin: '12px 0 0' }}>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
