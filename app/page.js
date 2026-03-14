'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from './lib/mock'
import { CountryCard } from './components/home/CountryCard'
import { Navbar } from './components/layout/Navbar'
import { supabase } from './lib/supabase'

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

const TELEGRAM_BOT_NAME = 'macroview_auth_bot'

const REGIONS = ['Все', 'ЮВА', 'Ближний Восток', 'Европа', 'СНГ', 'Азия', 'Северная Америка']

const COUNTRY_NAMES_RU = {
  world:'Мир', usa:'США', china:'Китай', india:'Индия', russia:'Россия',
  germany:'Германия', uk:'Британия', thailand:'Таиланд', uae:'ОАЭ',
  georgia:'Грузия', turkey:'Турция', indonesia:'Индонезия', vietnam:'Вьетнам',
  malaysia:'Малайзия', spain:'Испания', portugal:'Португалия', serbia:'Сербия',
  kazakhstan:'Казахстан', uzbekistan:'Узбекистан', israel:'Израиль', cyprus:'Кипр',
}

// ─── Telegram Login Widget ────────────────────────────────────
function TelegramButton({ onAuth }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || ref.current.querySelector('script')) return
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    ref.current.appendChild(script)
    window.onTelegramAuth = (user) => onAuth(user)
    return () => { delete window.onTelegramAuth }
  }, [])
  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center' }} />
}

// ─── Модальное окно авторизации ───────────────────────────────
function AuthModal({ mode: initialMode, onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  // Закрытие по Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const checkOnboarding = async (userId) => {
    const { data } = await supabase.from('user_profiles').select('onboarding_done, role').eq('id', userId).single()
    if (data?.role === 'admin') { router.push('/admin'); return }
    if (!data?.onboarding_done) { router.push('/profile'); return }
    onSuccess()
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Неверный email или пароль') }
      else { await checkOnboarding(data.user.id) }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) { setError(error.message) }
      else { setSent(true); setTimeout(() => { onClose(); router.push('/profile') }, 1500) }
    }
    setLoading(false)
  }

  const handleTelegramAuth = async (tgUser) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tgUser) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token })
      const { data: { user } } = await supabase.auth.getUser()
      await checkOnboarding(user.id)
    } catch (err) { setError('Ошибка входа через Telegram') }
    setLoading(false)
  }

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${T.border}`, fontSize: 14,
    fontFamily: '-apple-system,sans-serif', color: T.text,
    background: T.bg, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {/* Фон */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(4px)' }} />

      {/* Карточка */}
      <div style={{ position: 'relative', background: T.card, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: 420, padding: '32px 28px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.bg, cursor: 'pointer', fontSize: 16, color: T.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

        {/* Лого */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Georgia,serif' }}>M</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: 'Georgia,serif' }}>MacroView</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>
          {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        </h2>
        <p style={{ fontSize: 13, color: T.sub, margin: '0 0 20px', fontFamily: '-apple-system,sans-serif' }}>
          {mode === 'login' ? 'Войдите для персонализированной аналитики' : 'Создайте аккаунт — это займёт 2 минуты'}
        </p>

        {/* Переключатель */}
        <div style={{ display: 'flex', background: T.bg, borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none',
              background: mode === m ? T.card : 'transparent',
              boxShadow: mode === m ? T.shadow : 'none',
              fontSize: 13, fontWeight: mode === m ? 700 : 400,
              color: mode === m ? T.text : T.sub, cursor: 'pointer',
              fontFamily: '-apple-system,sans-serif', transition: 'all 0.15s',
            }}>{m === 'login' ? 'Войти' : 'Регистрация'}</button>
          ))}
        </div>

        {sent ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#D1FAE5', borderRadius: 12, color: '#059669', fontSize: 14, fontFamily: '-apple-system,sans-serif' }}>
            ✓ Письмо отправлено! Проверьте почту.
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'register' && (
                <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} style={inp} required
                  onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
              )}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inp} required
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
              <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={inp} required
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
            </div>

            {error && <div style={{ marginTop: 10, padding: '9px 12px', background: '#FEE2E2', borderRadius: 8, fontSize: 12, color: '#DC2626', fontFamily: '-apple-system,sans-serif' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: 14, padding: '12px', borderRadius: 10,
              background: T.accent, border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: '-apple-system,sans-serif', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? '...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.sub }}>или</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <TelegramButton onAuth={handleTelegramAuth} />
      </div>
    </div>
  )
}

// ─── Онбординг-модал (принудительный) ────────────────────────
function OnboardingModal({ userId, onComplete }) {
  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState([])
  const [assets, setAssets] = useState([])
  const [capital, setCapital] = useState('')
  const [horizon, setHorizon] = useState('')
  const [saving, setSaving] = useState(false)

  const ASSETS = [
    { id: 'real_estate', label: 'Недвижимость', icon: '🏢' },
    { id: 'stocks',      label: 'Фондовый рынок', icon: '📈' },
    { id: 'visa',        label: 'ВНЖ и переезд', icon: '✈️' },
    { id: 'business',    label: 'Бизнес и стартапы', icon: '🚀' },
  ]

  const COUNTRY_LIST = COUNTRIES.filter(c => c.slug !== 'world').map(c => ({ slug: c.slug, name: c.name, flag: c.flag }))

  const canNext = () => {
    if (step === 1) return countries.length >= 1
    if (step === 2) return assets.length >= 1
    if (step === 3) return capital !== ''
    if (step === 4) return horizon !== ''
    return false
  }

  const handleFinish = async () => {
    setSaving(true)
    await supabase.from('user_profiles').update({
      countries, assets, capital_range: capital, invest_horizon: horizon,
      onboarding_done: true, updated_at: new Date().toISOString(),
    }).eq('id', userId)
    onComplete()
  }

  const STEPS = ['Страны', 'Активы', 'Капитал', 'Горизонт']

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: T.card, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: '32px 28px' }}>

        {/* Прогресс */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i + 1 <= step ? T.accent : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i + 1 <= step ? '#fff' : T.sub }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i + 1 === step ? T.accent : T.sub, fontFamily: '-apple-system,sans-serif' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: T.border, borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: T.accent, borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Шаг 1: Страны */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>Выберите страны</h2>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', fontFamily: '-apple-system,sans-serif' }}>Какие рынки вам интересны? Минимум 1</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: T.sub }}>{countries.length} выбрано</span>
              <button onClick={() => setCountries(COUNTRY_LIST.map(c => c.slug))} style={{ fontSize: 12, color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Выбрать все</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {COUNTRY_LIST.map(c => {
                const on = countries.includes(c.slug)
                return (
                  <button key={c.slug} onClick={() => setCountries(prev => prev.includes(c.slug) ? prev.filter(x => x !== c.slug) : [...prev, c.slug])} style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    background: on ? T.accent2 : T.bg, border: `2px solid ${on ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
                  }}>
                    <img src={`/flags/${c.slug}.png`} onError={e => { e.target.onerror = null; e.target.src = `https://flagcdn.com/w40/${c.slug === 'uk' ? 'gb' : c.slug}.png` }}
                      width={24} height={16} alt={c.name} style={{ borderRadius: 2, objectFit: 'cover' }} />
                    <span style={{ fontSize: 12, fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Шаг 2: Активы */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>Интересующие активы</h2>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', fontFamily: '-apple-system,sans-serif' }}>В каких направлениях хотите инвестировать? Мин. 1</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ASSETS.map(a => {
                const on = assets.includes(a.id)
                return (
                  <button key={a.id} onClick={() => setAssets(prev => prev.includes(a.id) ? prev.length > 1 ? prev.filter(x => x !== a.id) : prev : prev.length < 4 ? [...prev, a.id] : prev)} style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: on ? T.accent2 : T.bg, border: `2px solid ${on ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 24 }}>{a.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{a.label}</span>
                    {on && <span style={{ marginLeft: 'auto', color: T.accent }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Шаг 3: Капитал */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>Размер капитала</h2>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', fontFamily: '-apple-system,sans-serif' }}>Поможет подобрать подходящие инструменты</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'small',  label: 'до $100 000',          icon: '💼' },
                { id: 'medium', label: '$100 000 — $1 000 000', icon: '💰' },
                { id: 'large',  label: 'от $1 000 000',         icon: '🏦' },
              ].map(c => (
                <button key={c.id} onClick={() => setCapital(c.id)} style={{
                  padding: '16px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: capital === c.id ? T.accent2 : T.bg, border: `2px solid ${capital === c.id ? T.accent : T.border}`,
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: capital === c.id ? 700 : 400, color: capital === c.id ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{c.label}</span>
                  {capital === c.id && <span style={{ marginLeft: 'auto', color: T.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаг 4: Горизонт */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>Горизонт инвестирования</h2>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', fontFamily: '-apple-system,sans-serif' }}>На какой срок планируете вложения?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'short',  label: 'Краткосрочный', sub: 'до 1 года', icon: '⚡' },
                { id: 'medium', label: 'Среднесрочный',  sub: '1–5 лет',  icon: '📅' },
                { id: 'long',   label: 'Долгосрочный',   sub: '5+ лет',   icon: '🌱' },
              ].map(h => (
                <button key={h.id} onClick={() => setHorizon(h.id)} style={{
                  padding: '16px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: horizon === h.id ? T.accent2 : T.bg, border: `2px solid ${horizon === h.id ? T.accent : T.border}`,
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 24 }}>{h.icon}</span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: horizon === h.id ? 700 : 400, color: horizon === h.id ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{h.label}</span>
                    <span style={{ fontSize: 12, color: T.sub, marginLeft: 8, fontFamily: 'monospace' }}>{h.sub}</span>
                  </div>
                  {horizon === h.id && <span style={{ marginLeft: 'auto', color: T.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Навигация */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 20px', borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
              ← Назад
            </button>
          )}
          <button onClick={step === 4 ? handleFinish : () => setStep(s => s + 1)} disabled={!canNext() || saving} style={{
            flex: 1, padding: '12px', borderRadius: 10, background: canNext() ? T.accent : T.border,
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: '-apple-system,sans-serif',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Сохраняем...' : step === 4 ? '🎉 Начать работу' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Главная страница ─────────────────────────────────────────
export default function HomePage() {
  const [region, setRegion] = useState('Все')
  const [search, setSearch] = useState('')
  const [authModal, setAuthModal] = useState(null) // null | 'login' | 'register'
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadProfile(data.session.user)
      else setLoadingUser(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) loadProfile(session.user)
      else { setUser(null); setProfile(null); setLoadingUser(false) }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const loadProfile = async (u) => {
    setUser(u)
    const { data } = await supabase.from('user_profiles').select('*').eq('id', u.id).single()
    setProfile(data)
    if (data && !data.onboarding_done) setShowOnboarding(true)
    setLoadingUser(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  // Фильтрация: если залогинен — только его страны
  const allCountries = user && profile?.countries?.length > 0
    ? COUNTRIES.filter(c => profile.countries.includes(c.slug))
    : COUNTRIES

  const filtered = allCountries.filter(c => {
    if (region !== 'Все' && c.region !== region) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const greenCount  = allCountries.filter(c => c.chi.signal === 'green').length
  const yellowCount = allCountries.filter(c => c.chi.signal === 'yellow').length
  const redCount    = allCountries.filter(c => c.chi.signal === 'red').length

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />

      {/* Модальное окно авторизации */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => { setAuthModal(null) }}
        />
      )}

      {/* Принудительный онбординг */}
      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => {
            setShowOnboarding(false)
            loadProfile(user)
          }}
        />
      )}

      {/* ── Hero-блок ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 60%, #2563eb 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
                Глобальные инвестиции · 20 стран
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 900, margin: '0 0 16px', lineHeight: 1.15 }}>
                Инвестируй глобально.<br />Решай обоснованно.
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: '0 0 28px', maxWidth: 500, fontFamily: '-apple-system,sans-serif' }}>
                MacroView анализирует макроэкономику 20 стран и помогает принимать взвешенные решения по недвижимости, фондовым рынкам, ВНЖ и бизнесу за рубежом.
              </p>

              {/* Кнопки auth или профиль */}
              {!loadingUser && (
                user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {(profile?.display_name || user.email || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: '-apple-system,sans-serif' }}>
                        {profile?.display_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Link href="/profile" style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)', fontFamily: '-apple-system,sans-serif' }}>
                      Профиль
                    </Link>
                    <button onClick={handleLogout} style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 13, fontFamily: '-apple-system,sans-serif' }}>
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => setAuthModal('register')} style={{ padding: '13px 28px', borderRadius: 12, background: '#fff', color: '#1a3a6a', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
                      Начать бесплатно
                    </button>
                    <button onClick={() => setAuthModal('login')} style={{ padding: '13px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
                      Войти
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Статистика */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Стабильно',  count: greenCount,  color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
                { label: 'Следи',      count: yellowCount, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
                { label: 'Осторожно', count: redCount,    color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} style={{ textAlign: 'center', padding: '16px 20px', borderRadius: 14, background: bg, border: `1px solid ${color}30` }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 900, color }}>{count}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color, opacity: 0.8, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Персонализация для залогиненного */}
          {user && profile?.countries?.length > 0 && (
            <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system,sans-serif' }}>
                Показываем {profile.countries.length} {profile.countries.length === 1 ? 'страну' : 'страны'} из вашего профиля:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {profile.countries.slice(0, 6).map(slug => (
                  <span key={slug} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: '-apple-system,sans-serif' }}>
                    {COUNTRY_NAMES_RU[slug] || slug}
                  </span>
                ))}
                {profile.countries.length > 6 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>+{profile.countries.length - 6}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Контент ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Фильтры */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>
            {user && profile?.countries?.length > 0 ? 'Ваши страны' : 'Все страны'} · {filtered.length}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
              style={{ fontFamily: 'monospace', fontSize: 12, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', outline: 'none', width: 150, color: T.text }} />
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)} style={{
                fontFamily: 'monospace', fontSize: 10,
                background: region === r ? '#1a3a6a' : T.card,
                color: region === r ? '#fff' : T.sub,
                border: `1px solid ${region === r ? '#1a3a6a' : T.border}`,
                borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s',
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Сетка карточек */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 48 }}>
          {filtered.map(country => <CountryCard key={country.slug} country={country} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', fontFamily: 'monospace', fontSize: 14, color: T.sub }}>
              Страны не найдены
            </div>
          )}
        </div>

        {/* Сравнительный экран */}
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 16 }}>
            Сравнительный экран · Топ по CHI
          </h2>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: T.shadow }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1612' }}>
                  {['Страна', 'Регион', 'CHI', 'Долгосрочный', 'Среднесрочный', 'Краткосрочный', 'Сигнал'].map(h => (
                    <th key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', padding: '12px 16px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...allCountries].sort((a, b) => b.chi.index - a.chi.index).map((c, i) => {
                  const s = c.chi.signal === 'green'
                    ? { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
                    : c.chi.signal === 'yellow'
                    ? { color: '#854d0e', bg: '#fefce8', border: '#fde047' }
                    : { color: '#991b1b', bg: '#fef2f2', border: '#fecaca' }
                  return (
                    <tr key={c.slug} style={{ borderTop: `1px solid ${T.border}`, background: i % 2 === 0 ? T.card : T.bg }}>
                      <td style={{ padding: '10px 16px' }}>
                        <Link href={`/country/${c.slug}`} style={{ textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, color: T.text }}>
                          {c.flag} {c.name}
                        </Link>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: T.sub }}>{c.region}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: T.text }}>{c.chi.index}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#1a3a6a' }}>{c.chi.longTerm}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#2563eb' }}>{c.chi.midTerm}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#d97706' }}>{c.chi.shortTerm}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${s.border}`, color: s.color, background: s.bg }}>
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

        {/* CTA для незалогиненных */}
        {!user && !loadingUser && (
          <div style={{ marginTop: 40, background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 100%)', borderRadius: 20, padding: '40px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                Получите персональную аналитику
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: '-apple-system,sans-serif', maxWidth: 480 }}>
                Зарегистрируйтесь — и MacroView будет показывать только те страны и активы, которые важны именно вам.
              </p>
            </div>
            <button onClick={() => setAuthModal('register')} style={{ padding: '14px 32px', borderRadius: 12, background: '#fff', color: '#1a3a6a', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: '-apple-system,sans-serif', flexShrink: 0 }}>
              Начать бесплатно →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
