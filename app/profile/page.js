'use client'
import { useState } from 'react'
import Link from 'next/link'
import { COUNTRIES, DIARY_ENTRIES } from '../lib/mock'
import { DIRECTIONS, SIGNAL_CONFIG } from '../lib/types'
import { Navbar } from '../components/layout/Navbar'
import { CHIChart } from '../components/ui/CHIChart'
import { SignalBadge } from '../components/ui/SignalBadge'

const MOCK_PROFILE = {
  name: 'Антон',
  countries: ['thailand', 'georgia', 'uae'],
  goals: ['real-estate', 'business'],
  horizon: '5-10',
  capital: '150-500k',
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const userCountries = COUNTRIES.filter(c => MOCK_PROFILE.countries.includes(c.slug))
  const recentEntries = DIARY_ENTRIES
    .filter(e => MOCK_PROFILE.countries.includes(e.country_slug))
    .slice(0, 5)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', fontWeight: 700 }}>{MOCK_PROFILE.name[0]}</span>
              </div>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>{MOCK_PROFILE.name}</h1>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>
                  Горизонт {MOCK_PROFILE.horizon} лет · {MOCK_PROFILE.capital.replace('-', '–')} USD
                </span>
              </div>
            </div>
            <Link href="/advisor" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'monospace', fontSize: 12, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '8px 16px', textDecoration: 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Советник активен
            </Link>
          </div>

          {/* Табы */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { id: 'dashboard',     label: '📊 Дашборд' },
              { id: 'notifications', label: '🔔 Уведомления' },
              { id: 'settings',      label: '⚙️ Профиль' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                fontFamily: 'monospace', fontSize: 11, padding: '10px 16px',
                borderBottom: activeTab === t.id ? '2px solid #1a3a6a' : '2px solid transparent',
                color: activeTab === t.id ? '#1a3a6a' : '#9a948e',
                fontWeight: activeTab === t.id ? 600 : 400,
                background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #1a3a6a' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ─── ДАШБОРД ─── */}
        {activeTab === 'dashboard' && (
          <>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>Мои страны</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {userCountries.map(c => (
                  <Link key={c.slug} href={`/country/${c.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 24 }}>{c.flag}</span>
                          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1a1612' }}>{c.name}</span>
                        </div>
                        <SignalBadge signal={c.chi.signal} index={c.chi.index} size="sm" />
                      </div>
                      <CHIChart history={c.chi.history.slice(-6)} height={100} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginTop: 8 }}>
                        {[
                          { val: c.chi.longTerm,  color: '#1a3a6a', label: 'Долг.' },
                          { val: c.chi.midTerm,   color: '#2563eb', label: 'Средн.' },
                          { val: c.chi.shortTerm, color: '#d97706', label: 'Кратк.' },
                        ].map(({ val, color, label }) => (
                          <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{val}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#c8c2b8' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', margin: 0 }}>Последние события</h2>
                <Link href="/diary" style={{ fontFamily: 'monospace', fontSize: 10, color: '#1a3a6a', textDecoration: 'none' }}>Все записи →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentEntries.map(e => {
                  const country = COUNTRIES.find(c => c.slug === e.country_slug)
                  const signalCfg = e.signal ? SIGNAL_CONFIG[e.signal] : null
                  return (
                    <Link key={e.id} href={`/diary/${e.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16 }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{country?.flag}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{country?.name} · {e.published_at}</div>
                        </div>
                        {signalCfg && (
                          <span style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 6, border: `1px solid ${signalCfg.border}`, color: signalCfg.color, background: signalCfg.bg, flexShrink: 0 }}>
                            {signalCfg.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* ─── УВЕДОМЛЕНИЯ ─── */}
        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>История уведомлений советника</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { date: '2026-03-08', country: 'georgia',  title: 'Грузия: CHI вырос с 65 → 68',          body: 'ВВП 8.2% — лучший показатель СНГ. Туристов 7.1 млн — рекорд.', type: 'positive' },
                { date: '2026-02-15', country: 'thailand', title: 'Таиланд: BOT снизил ставку до 1%',      body: 'Краткосрочная линия +4 п. Влияние на RESI: +3.', type: 'positive' },
                { date: '2026-01-20', country: 'uae',      title: 'ОАЭ: FDI рекорд $30.4 млрд',           body: 'Деньги активно входят. Net Capital Flow Score +8.', type: 'positive' },
                { date: '2026-01-10', country: 'thailand', title: 'Таиланд: WB снизил прогноз ВВП',        body: 'Прогноз снижен с 2.3% до 1.6%. Среднесрочная линия -2 п.', type: 'negative' },
              ].map((n, i) => {
                const c = COUNTRIES.find(c => c.slug === n.country)
                return (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${n.type === 'positive' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: n.type === 'positive' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span>{n.type === 'positive' ? '↑' : '↓'}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{c?.flag} {c?.name}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>·</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{n.date}</span>
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612', marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a6460' }}>{n.body}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── НАСТРОЙКИ ─── */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1612', marginBottom: 20 }}>Настройки профиля</h2>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Мои страны</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COUNTRIES.map(c => (
                    <button key={c.slug} style={{
                      fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${MOCK_PROFILE.countries.includes(c.slug) ? '#1a3a6a' : '#e8e2d8'}`,
                      background: MOCK_PROFILE.countries.includes(c.slug) ? '#1a3a6a' : '#fff',
                      color: MOCK_PROFILE.countries.includes(c.slug) ? '#fff' : '#4a4540',
                    }}>{c.flag} {c.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Направления</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DIRECTIONS.map(d => (
                    <button key={d.id} style={{
                      fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${MOCK_PROFILE.goals.includes(d.id) ? '#1a3a6a' : '#e8e2d8'}`,
                      background: MOCK_PROFILE.goals.includes(d.id) ? '#1a3a6a' : '#fff',
                      color: MOCK_PROFILE.goals.includes(d.id) ? '#fff' : '#4a4540',
                    }}>{d.icon} {d.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Горизонт</div>
                  <select style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, border: '1px solid #e8e2d8', borderRadius: 8, padding: '8px 12px', background: '#fff', outline: 'none' }}>
                    {['1-3 года', '3-5 лет', '5-10 лет', '10+ лет'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Капитал</div>
                  <select style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, border: '1px solid #e8e2d8', borderRadius: 8, padding: '8px 12px', background: '#fff', outline: 'none' }}>
                    {['до $50к', '$50–150к', '$150–500к', 'от $500к'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, background: '#1a3a6a', color: '#fff', borderRadius: 12, padding: '12px 0', border: 'none', cursor: 'pointer' }}>
                Сохранить изменения
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
