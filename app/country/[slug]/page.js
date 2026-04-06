'use client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCountry, getEntriesByCountry, COUNTRIES } from '../../lib/mock'
import { DIRECTIONS } from '../../lib/types'
import { Navbar } from '../../components/layout/Navbar'
import { SignalBadge } from '../../components/ui/SignalBadge'
import { CHIChart } from '../../components/ui/CHIChart'

export default function CountryPage() {
  const params = useParams()
  const country = getCountry(params.slug)
  if (!country) return notFound()

  const entries = getEntriesByCountry(params.slug)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 24px 0' }}>

          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>
            <Link href="/" style={{ color: '#9a948e', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <span style={{ color: '#1a1612', fontWeight: 600 }}>{country.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 40 }}>{country.flag}</span>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>{country.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a948e' }}>{country.region}</span>
                  <SignalBadge signal={country.chi.signal} index={country.chi.index} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'ВВП рост',  val: `${country.macro.gdpGrowth}%` },
                { label: 'Инфляция',  val: `${country.macro.inflation}%` },
                { label: 'Ставка ЦБ', val: `${country.macro.cbRate}%` },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center', background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1a1612' }}>{val}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Навигация */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e2d8', overflowX: 'auto' }}>
            {[
              { id: 'indicator',    label: '📡 Индикатор' },
              { id: 'capital-flow', label: '💰 Карта капитала' },
              { id: 'history',      label: '📜 Живая история' },
              { id: 'macro',        label: '📊 Макроданные' },
            ].map(tab => (
              <a key={tab.id} href={`#${tab.id}`} style={{
                fontFamily: 'monospace', fontSize: 11, color: '#6a6460', padding: '10px 16px',
                borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </a>
            ))}
            <Link href={`/country/${params.slug}/history`} style={{
              fontFamily: 'monospace', fontSize: 11, color: '#1a3a6a', padding: '10px 16px',
              borderBottom: '2px solid #1a3a6a', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 700,
            }}>
              🗺 История 1700–2026
            </Link>
            <div style={{ width: 1, background: '#e8e2d8', margin: '4px 8px' }} />
            {DIRECTIONS.map(dir => (
              <Link key={dir.id} href={`/country/${params.slug}/${dir.path}`} style={{
                fontFamily: 'monospace', fontSize: 11, color: '#6a6460', padding: '10px 16px',
                borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {dir.icon} {dir.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ─── ИНДИКАТОР ─── */}
        <section id="indicator">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>📡 Индикатор CHI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

            {/* Главный сигнал */}
            <div style={{
              borderRadius: 12, border: `2px solid ${country.chi.signal === 'green' ? '#bbf7d0' : country.chi.signal === 'yellow' ? '#fde047' : '#fecaca'}`,
              background: country.chi.signal === 'green' ? '#f0fdf4' : country.chi.signal === 'yellow' ? '#fefce8' : '#fef2f2',
              padding: 20,
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>CHI · Март 2026</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${country.chi.signal === 'green' ? '#22c55e' : country.chi.signal === 'yellow' ? '#eab308' : '#ef4444'}`,
                }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1a1612' }}>{country.chi.index}</span>
                </div>
                <SignalBadge signal={country.chi.signal} size="lg" />
              </div>

              {[
                { label: '🏔 Долгосрочная', val: country.chi.longTerm,  color: '#1a3a6a' },
                { label: '📊 Среднесрочная', val: country.chi.midTerm,   color: '#2563eb' },
                { label: '⚡ Краткосрочная', val: country.chi.shortTerm, color: '#d97706' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.6)', borderRadius: 9999 }}>
                    <div style={{ height: '100%', borderRadius: 9999, width: `${val}%`, background: color }} />
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Вывод агента</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#2a2520', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{country.chi.agentNote}</p>
              </div>
            </div>

            {/* График */}
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>История CHI</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['#1a3a6a', '🏔 Долг.'], ['#2563eb', '📊 Средн.'], ['#d97706', '⚡ Кратк.']].map(([color, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <CHIChart history={country.chi.history} />
            </div>
          </div>

          {/* Прогноз */}
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, marginTop: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Прогноз CHI на 10 лет · Три сценария</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[country.chi.forecast.positive, country.chi.forecast.base, country.chi.forecast.negative].map(s => (
                <div key={s.label} style={{
                  borderRadius: 8, padding: 16,
                  border: `1px solid ${s.label === 'Позитивный' ? '#bbf7d0' : s.label === 'Базовый' ? '#bfdbfe' : '#fecaca'}`,
                  background: s.label === 'Позитивный' ? '#f0fdf4' : s.label === 'Базовый' ? '#eff6ff' : '#fef2f2',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{s.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>{s.probability}%</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, color: '#1a1612' }}>{s.chiIn5y}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>CHI · 5 лет</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, color: '#1a1612' }}>{s.chiIn10y}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>CHI · 10 лет</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a4540', lineHeight: 1.6, margin: 0 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Что повлияло */}
          {country.chi.factors.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, marginTop: 16 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Что повлияло на индекс</div>
              {country.chi.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.impact === 'positive' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>{f.impact === 'positive' ? '↑' : '↓'}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: f.impact === 'positive' ? '#15803d' : '#991b1b', flex: 1 }}>{f.title}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{f.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── КАРТА КАПИТАЛА ─── */}
        <section id="capital-flow">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>💰 Карта капитала</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'FDI', sublabel: 'Прямые инвестиции', val: country.capitalFlow.fdi.value, yoy: country.capitalFlow.fdi.yoy, icon: '🏭' },
              { label: 'Portfolio', sublabel: 'Портфельные', val: country.capitalFlow.portfolio.value, yoy: country.capitalFlow.portfolio.yoy, icon: '📊' },
              { label: 'Remittances', sublabel: 'Переводы', val: country.capitalFlow.remittances.value, yoy: country.capitalFlow.remittances.yoy, icon: '💸' },
              { label: 'RE Foreign', sublabel: 'Недвижимость', val: country.capitalFlow.reForeign.value, yoy: country.capitalFlow.reForeign.yoy, icon: '🏠' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612' }}>
                  {item.val > 0 ? '+' : ''}{item.val.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 400, color: '#9a948e' }}>млрд $</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{item.sublabel}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, marginTop: 4, color: item.yoy >= 0 ? '#15803d' : '#991b1b' }}>
                  {item.yoy >= 0 ? '↑' : '↓'} {Math.abs(item.yoy)}% г/г
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net Capital Flow Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 900, color: '#1a1612' }}>{country.capitalFlow.score}</div>
            </div>
            <SignalBadge signal={country.capitalFlow.signal} size="lg" />
          </div>
        </section>

        {/* ─── ЖИВАЯ ИСТОРИЯ ─── */}
        <section id="history">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>📜 Живая история</h2>
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 24 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#6a6460', marginBottom: 24, lineHeight: 1.6 }}>
              Исторические события {country.name} и их влияние на инвесторов.
            </p>
            <div style={{ paddingLeft: 24, borderLeft: '2px solid #e8e2d8', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {entries.map((entry) => (
                <div key={entry.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -33, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid #1a3a6a' }} />
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', marginBottom: 4 }}>{entry.published_at}</div>
                  <Link href={`/diary/${entry.slug}`} style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612', textDecoration: 'none' }}>
                    {entry.title}
                  </Link>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6a6460', marginTop: 4, lineHeight: 1.6 }}>{entry.lead}</p>
                  {entry.is_live && (
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 6px', display: 'inline-block', marginTop: 4 }}>
                      ● Живая запись
                    </span>
                  )}
                </div>
              ))}
              {entries.length === 0 && (
                <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#9a948e' }}>История пополняется...</p>
              )}
            </div>
          </div>
        </section>

        {/* ─── МАКРОДАННЫЕ ─── */}
        <section id="macro">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>📊 Макроданные</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Экономика</div>
              {[
                { label: 'ВВП рост', val: `${country.macro.gdpGrowth}%`, note: 'WB · Ежекварт.' },
                { label: 'Инфляция', val: `${country.macro.inflation}%`, note: 'ЦБ · Ежемес.' },
                { label: 'Ставка ЦБ', val: `${country.macro.cbRate}%`, note: 'ЦБ · Ежемес.' },
                { label: 'Безработица', val: `${country.macro.unemployment}%`, note: 'Нац. стат.' },
                { label: 'Долг домохозяйств', val: `${country.macro.householdDebt}% ВВП`, note: 'BIS' },
                { label: 'Госдолг', val: `${country.macro.govDebt}% ВВП`, note: 'IMF' },
                { label: 'Торговый баланс', val: `${country.macro.tradeBalance}% ВВП`, note: 'ЦБ' },
                { label: 'ВВП на душу', val: `$${country.macro.gdpPerCapita.toLocaleString()}`, note: 'WB' },
              ].map(({ label, val, note }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f2ee' : 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{val}</span>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Общество и политика</div>
              {[
                { label: 'Индекс счастья', val: `${country.society.happinessScore}/10 · #${country.society.happinessRank}`, note: 'WHR' },
                { label: 'ИЧР', val: country.society.hdi.toFixed(3), note: 'UNDP' },
                { label: 'Неравенство (Gini)', val: country.society.gini.toFixed(1), note: 'WB' },
                { label: 'Индекс демократии', val: `${country.society.democracyIndex}/10`, note: 'EIU' },
                { label: 'Медианный возраст', val: `${country.society.medianAge} лет`, note: 'UN' },
                { label: 'Рост населения', val: `${country.society.populationGrowth}%`, note: 'UN' },
                { label: 'Население', val: `${country.macro.population} млн`, note: 'UN' },
                { label: 'Военная безопасность', val: `${country.society.militarySafety}/100`, note: 'GPI' },
              ].map(({ label, val, note }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f2ee' : 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{val}</span>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>Обновлено: {country.macro.updatedAt}</div>
        </section>

        {/* ─── НАПРАВЛЕНИЯ ─── */}
        <section>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>Направления для инвестора</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {DIRECTIONS.map(dir => {
              const isAvailable = country.priority.includes(dir.id)
              return (
                <Link key={dir.id} href={isAvailable ? `/country/${params.slug}/${dir.path}` : '#'} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20,
                    opacity: isAvailable ? 1 : 0.5, cursor: isAvailable ? 'pointer' : 'not-allowed',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{dir.icon}</span>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1612' }}>{dir.label}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: isAvailable ? '#1a3a6a' : '#c8c2b8' }}>
                        {isAvailable ? '→' : 'Скоро'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: 0 }}>
                      {dir.id === 'real-estate'  && 'Сигнал RESI · Калькулятор доходности · Карта районов · Прогноз 10 лет'}
                      {dir.id === 'stock-market' && 'Сигнал фондового рынка · Скринер акций · Дивидендный радар'}
                      {dir.id === 'visa'         && 'Чеклист переезда · Налоговый калькулятор · Сравнение ВНЖ программ'}
                      {dir.id === 'business'     && 'Индекс деловой среды · Калькулятор открытия компании · Экосистема'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
