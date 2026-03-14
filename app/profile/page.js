'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { Navbar } from '../components/layout/Navbar'

const T = {
  bg:     '#F5F7FA',
  card:   '#FFFFFF',
  accent: '#0066FF',
  accent2:'#E8F0FF',
  text:   '#1A1A2E',
  sub:    '#6B7280',
  border: '#E5E9F0',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  radius: '16px',
}

const COUNTRIES = [
  { slug: 'world',      name: 'Мир',        flag: '🌍' },
  { slug: 'usa',        name: 'США',         flag: '🇺🇸' },
  { slug: 'china',      name: 'Китай',       flag: '🇨🇳' },
  { slug: 'india',      name: 'Индия',       flag: '🇮🇳' },
  { slug: 'russia',     name: 'Россия',      flag: '🇷🇺' },
  { slug: 'germany',    name: 'Германия',    flag: '🇩🇪' },
  { slug: 'uk',         name: 'Британия',    flag: '🇬🇧' },
  { slug: 'thailand',   name: 'Таиланд',     flag: '🇹🇭' },
  { slug: 'uae',        name: 'ОАЭ',         flag: '🇦🇪' },
  { slug: 'georgia',    name: 'Грузия',      flag: '🇬🇪' },
  { slug: 'turkey',     name: 'Турция',      flag: '🇹🇷' },
  { slug: 'indonesia',  name: 'Индонезия',   flag: '🇮🇩' },
  { slug: 'vietnam',    name: 'Вьетнам',     flag: '🇻🇳' },
  { slug: 'malaysia',   name: 'Малайзия',    flag: '🇲🇾' },
  { slug: 'spain',      name: 'Испания',     flag: '🇪🇸' },
  { slug: 'portugal',   name: 'Португалия',  flag: '🇵🇹' },
  { slug: 'serbia',     name: 'Сербия',      flag: '🇷🇸' },
  { slug: 'kazakhstan', name: 'Казахстан',   flag: '🇰🇿' },
  { slug: 'uzbekistan', name: 'Узбекистан',  flag: '🇺🇿' },
  { slug: 'israel',     name: 'Израиль',     flag: '🇮🇱' },
  { slug: 'cyprus',     name: 'Кипр',        flag: '🇨🇾' },
]

const ASSETS = [
  { id: 'real_estate', label: 'Недвижимость',      icon: '🏢' },
  { id: 'stocks',      label: 'Фондовый рынок',    icon: '📈' },
  { id: 'visa',        label: 'ВНЖ и переезд',     icon: '✈️' },
  { id: 'business',    label: 'Бизнес и стартапы', icon: '🚀' },
]

const CAPITAL_LABELS = {
  small:  'до $100 000',
  medium: '$100 000 — $1 000 000',
  large:  'от $1 000 000',
}

const HORIZON_LABELS = {
  short:  'Краткосрочный · до 1 года',
  medium: 'Среднесрочный · 1–5 лет',
  long:   'Долгосрочный · 5+ лет',
}

function Section({ title, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '24px', boxShadow: T.shadow, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'preferences'

  // Редактируемые поля
  const [displayName, setDisplayName] = useState('')
  const [countries, setCountries] = useState([])
  const [assets, setAssets] = useState([])
  const [capital, setCapital] = useState('')
  const [horizon, setHorizon] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/auth'); return }
      loadProfile(data.session.user.id)
    })
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      setDisplayName(data.display_name || '')
      setCountries(data.countries || [])
      setAssets(data.assets || [])
      setCapital(data.capital_range || '')
      setHorizon(data.invest_horizon || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('user_profiles').update({
      display_name: displayName,
      countries,
      assets,
      capital_range: capital,
      invest_horizon: horizon,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleCountry = (slug) => {
    setCountries(prev => prev.includes(slug)
      ? prev.length > 1 ? prev.filter(c => c !== slug) : prev
      : [...prev, slug]
    )
  }

  const toggleAsset = (id) => {
    setAssets(prev => prev.includes(id)
      ? prev.length > 1 ? prev.filter(a => a !== id) : prev
      : prev.length < 4 ? [...prev, id] : prev
    )
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: T.sub, fontSize: 15 }}>
        Загрузка профиля...
      </div>
    </div>
  )

  const initials = (displayName || profile?.email || '?').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Шапка профиля */}
        <div style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 100%)', borderRadius: T.radius, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.2)',
          }}>
            {!profile?.avatar_url && initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, fontFamily: '-apple-system,sans-serif' }}>
              {profile?.display_name || 'Пользователь'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
              {profile?.telegram_username ? `@${profile.telegram_username}` : profile?.email}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                {profile?.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
              </span>
              {profile?.telegram_username && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(41,182,246,0.25)', color: '#7dd3fc', fontFamily: 'monospace' }}>
                  ✈️ Telegram
                </span>
              )}
              {countries.length > 0 && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                  🌍 {countries.length} {countries.length === 1 ? 'страна' : countries.length < 5 ? 'страны' : 'стран'}
                </span>
              )}
            </div>
          </div>
          {profile?.role === 'admin' && (
            <Link href="/admin" style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: '-apple-system,sans-serif', flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              ⚙️ Админка
            </Link>
          )}
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: 4, background: T.card, borderRadius: 12, padding: 4, marginBottom: 20, border: `1px solid ${T.border}` }}>
          {[
            { id: 'profile',     label: '👤 Профиль' },
            { id: 'preferences', label: '🎯 Настройки' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none',
              background: activeTab === tab.id ? T.accent : 'transparent',
              color: activeTab === tab.id ? '#fff' : T.sub,
              fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: '-apple-system,sans-serif',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── ТАБ: ПРОФИЛЬ ── */}
        {activeTab === 'profile' && (
          <>
            <Section title="Личные данные">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif', display: 'block', marginBottom: 6 }}>Имя</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: '-apple-system,sans-serif', color: T.text, background: T.bg, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif', display: 'block', marginBottom: 6 }}>Email</label>
                  <input
                    value={profile?.email || '—'}
                    disabled
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: '-apple-system,sans-serif', color: T.sub, background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
                {profile?.telegram_username && (
                  <div>
                    <label style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif', display: 'block', marginBottom: 6 }}>Telegram</label>
                    <input
                      value={`@${profile.telegram_username}`}
                      disabled
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: '-apple-system,sans-serif', color: T.sub, background: '#f8fafc', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>
            </Section>

            <Section title="Инвестиционный профиль">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: T.bg, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginBottom: 6 }}>Капитал</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: '-apple-system,sans-serif' }}>
                    {CAPITAL_LABELS[capital] || '—'}
                  </div>
                </div>
                <div style={{ background: T.bg, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginBottom: 6 }}>Горизонт</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: '-apple-system,sans-serif' }}>
                    {HORIZON_LABELS[horizon] || '—'}
                  </div>
                </div>
                <div style={{ background: T.bg, borderRadius: 10, padding: '14px 16px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginBottom: 8 }}>Активы</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {assets.length > 0 ? assets.map(a => {
                      const asset = ASSETS.find(x => x.id === a)
                      return asset ? (
                        <span key={a} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: T.accent2, color: T.accent, fontFamily: '-apple-system,sans-serif', fontWeight: 500 }}>
                          {asset.icon} {asset.label}
                        </span>
                      ) : null
                    }) : <span style={{ fontSize: 13, color: T.sub }}>—</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('preferences')} style={{
                marginTop: 14, padding: '9px 18px', borderRadius: 9, border: `1px solid ${T.accent}`,
                background: 'transparent', color: T.accent, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: '-apple-system,sans-serif',
              }}>
                Изменить настройки →
              </button>
            </Section>

            <Section title="Безопасность">
              <button onClick={handleLogout} style={{
                padding: '11px 20px', borderRadius: 10, border: '1px solid #FCA5A5',
                background: '#FEF2F2', color: '#DC2626', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, fontFamily: '-apple-system,sans-serif',
              }}>
                Выйти из аккаунта
              </button>
            </Section>
          </>
        )}

        {/* ── ТАБ: НАСТРОЙКИ ── */}
        {activeTab === 'preferences' && (
          <>
            {/* Страны */}
            <Section title="Отслеживаемые страны">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>
                  Выбрано: <strong style={{ color: T.accent }}>{countries.length}</strong>
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setCountries(COUNTRIES.map(c => c.slug))} style={{ fontSize: 12, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
                    Все
                  </button>
                  <button onClick={() => setCountries(countries.length > 1 ? [countries[0]] : countries)} style={{ fontSize: 12, color: T.sub, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
                    Сбросить
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {COUNTRIES.map(c => {
                  const on = countries.includes(c.slug)
                  return (
                    <button key={c.slug} onClick={() => toggleCountry(c.slug)} style={{
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      background: on ? T.accent2 : T.bg,
                      border: `2px solid ${on ? T.accent : T.border}`,
                      display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 18 }}>{c.flag}</span>
                      <span style={{ fontSize: 12, fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </Section>

            {/* Активы */}
            <Section title="Интересующие активы">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ASSETS.map(a => {
                  const on = assets.includes(a.id)
                  return (
                    <button key={a.id} onClick={() => toggleAsset(a.id)} style={{
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: on ? T.accent2 : T.bg,
                      border: `2px solid ${on ? T.accent : T.border}`,
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{a.label}</span>
                      {on && <span style={{ marginLeft: 'auto', color: T.accent, fontSize: 14 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </Section>

            {/* Капитал */}
            <Section title="Размер капитала">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'small',  label: 'до $100 000',          icon: '💼' },
                  { id: 'medium', label: '$100 000 — $1 000 000', icon: '💰' },
                  { id: 'large',  label: 'от $1 000 000',         icon: '🏦' },
                ].map(c => (
                  <button key={c.id} onClick={() => setCapital(c.id)} style={{
                    padding: '14px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: capital === c.id ? T.accent2 : T.bg,
                    border: `2px solid ${capital === c.id ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 22 }}>{c.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: capital === c.id ? 700 : 400, color: capital === c.id ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{c.label}</span>
                    {capital === c.id && <span style={{ marginLeft: 'auto', color: T.accent }}>✓</span>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Горизонт */}
            <Section title="Горизонт инвестирования">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'short',  label: 'Краткосрочный', sub: 'до 1 года', icon: '⚡' },
                  { id: 'medium', label: 'Среднесрочный',  sub: '1–5 лет',  icon: '📅' },
                  { id: 'long',   label: 'Долгосрочный',   sub: '5+ лет',   icon: '🌱' },
                ].map(h => (
                  <button key={h.id} onClick={() => setHorizon(h.id)} style={{
                    padding: '14px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: horizon === h.id ? T.accent2 : T.bg,
                    border: `2px solid ${horizon === h.id ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 22 }}>{h.icon}</span>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: horizon === h.id ? 700 : 400, color: horizon === h.id ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{h.label}</span>
                      <span style={{ fontSize: 12, color: T.sub, marginLeft: 8, fontFamily: 'monospace' }}>{h.sub}</span>
                    </div>
                    {horizon === h.id && <span style={{ marginLeft: 'auto', color: T.accent }}>✓</span>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Кнопка сохранить */}
            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: saved ? '#059669' : T.accent,
              border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: '-apple-system,sans-serif',
              transition: 'background 0.3s', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Сохраняем...' : saved ? '✓ Сохранено!' : 'Сохранить изменения'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
