'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

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
  { id: 'real_estate', label: 'Недвижимость',       icon: '🏢', desc: 'Покупка, аренда, инвестиции в зарубежную недвижимость' },
  { id: 'stocks',      label: 'Фондовый рынок',     icon: '📈', desc: 'Акции, облигации, ETF и другие биржевые инструменты' },
  { id: 'visa',        label: 'ВНЖ и переезд',      icon: '✈️', desc: 'Визы, резидентство, релокация и жизнь за рубежом' },
  { id: 'business',    label: 'Бизнес и стартапы',  icon: '🚀', desc: 'Открытие компаний, стартапы и предпринимательство' },
]

const CAPITAL = [
  { id: 'small',  label: 'до $100 000',          icon: '💼', desc: 'Начальный капитал, фокус на диверсификации' },
  { id: 'medium', label: '$100 000 — $1 000 000', icon: '💰', desc: 'Средний капитал, широкие возможности' },
  { id: 'large',  label: 'от $1 000 000',         icon: '🏦', desc: 'Крупный капитал, premium-инструменты' },
]

const HORIZON = [
  { id: 'short',  label: 'Краткосрочный',   sub: 'до 1 года',  icon: '⚡', desc: 'Быстрые результаты, активное управление' },
  { id: 'medium', label: 'Среднесрочный',   sub: '1–5 лет',    icon: '📅', desc: 'Баланс риска и доходности' },
  { id: 'long',   label: 'Долгосрочный',    sub: '5+ лет',     icon: '🌱', desc: 'Устойчивый рост, сложный процент' },
]

const STEPS = [
  { id: 1, title: 'Выберите страны',         sub: 'Какие рынки вам интересны? Минимум 1' },
  { id: 2, title: 'Интересующие активы',     sub: 'В каких направлениях хотите инвестировать?' },
  { id: 3, title: 'Размер капитала',         sub: 'Это поможет подобрать подходящие инструменты' },
  { id: 4, title: 'Горизонт инвестирования', sub: 'На какой срок планируете вложения?' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState([])
  const [assets, setAssets] = useState([])
  const [capital, setCapital] = useState('')
  const [horizon, setHorizon] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/auth'); return }
      setUserId(data.session.user.id)
      // Если уже прошёл онбординг — редирект
      supabase.from('user_profiles').select('onboarding_done').eq('id', data.session.user.id).single()
        .then(({ data: p }) => { if (p?.onboarding_done) router.push('/') })
    })
  }, [])

  const toggleCountry = (slug) => {
    setCountries(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug])
  }

  const toggleAsset = (id) => {
    setAssets(prev => prev.includes(id)
      ? prev.length > 1 ? prev.filter(a => a !== id) : prev
      : prev.length < 4 ? [...prev, id] : prev
    )
  }

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
      countries,
      assets,
      capital_range: capital,
      invest_horizon: horizon,
      onboarding_done: true,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
    router.push('/')
  }

  const progress = ((step - 1) / 4) * 100

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Шапка с прогрессом */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: 'Georgia,serif' }}>M</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: 'Georgia,serif' }}>MacroView</span>
            </div>
            <span style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>Шаг {step} из 4</span>
          </div>
          {/* Прогресс-бар */}
          <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${progress + 25}%`, background: T.accent, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          {/* Шаги-точки */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {STEPS.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: s.id <= step ? T.accent : T.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: s.id <= step ? '#fff' : T.sub,
                  transition: 'all 0.3s',
                }}>{s.id < step ? '✓' : s.id}</div>
                <span style={{ fontSize: 11, color: s.id === step ? T.accent : T.sub, fontFamily: '-apple-system,sans-serif' }}>
                  {s.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 6px', fontFamily: '-apple-system,sans-serif' }}>
              {STEPS[step - 1].title}
            </h1>
            <p style={{ fontSize: 14, color: T.sub, margin: 0, fontFamily: '-apple-system,sans-serif' }}>
              {STEPS[step - 1].sub}
            </p>
          </div>

          {/* ШАГ 1: Страны */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>
                  Выбрано: <strong style={{ color: T.accent }}>{countries.length}</strong>
                </span>
                <button onClick={() => setCountries(COUNTRIES.map(c => c.slug))} style={{
                  fontSize: 12, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '-apple-system,sans-serif',
                }}>Выбрать все</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {COUNTRIES.map(c => {
                  const on = countries.includes(c.slug)
                  return (
                    <button key={c.slug} onClick={() => toggleCountry(c.slug)} style={{
                      padding: '12px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: on ? T.accent2 : T.card,
                      border: `2px solid ${on ? T.accent : T.border}`,
                      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 20 }}>{c.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>
                        {c.name}
                      </span>
                      {on && <span style={{ marginLeft: 'auto', color: T.accent, fontSize: 14 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ШАГ 2: Активы */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: T.sub, marginBottom: 4, fontFamily: '-apple-system,sans-serif' }}>
                Выбрано: <strong style={{ color: T.accent }}>{assets.length}</strong> из 4
              </div>
              {ASSETS.map(a => {
                const on = assets.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggleAsset(a.id)} style={{
                    padding: '18px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: on ? T.accent2 : T.card,
                    border: `2px solid ${on ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: on ? T.accent : T.text, marginBottom: 3, fontFamily: '-apple-system,sans-serif' }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{a.desc}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: on ? T.accent : T.border,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', transition: 'all 0.15s',
                    }}>{on ? '✓' : ''}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ШАГ 3: Капитал */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAPITAL.map(c => {
                const on = capital === c.id
                return (
                  <button key={c.id} onClick={() => setCapital(c.id)} style={{
                    padding: '20px 24px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: on ? T.accent2 : T.card,
                    border: `2px solid ${on ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: on ? T.accent : T.text, marginBottom: 4, fontFamily: '-apple-system,sans-serif' }}>{c.label}</div>
                      <div style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{c.desc}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: on ? T.accent : 'transparent',
                      border: `2px solid ${on ? T.accent : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', transition: 'all 0.15s',
                    }}>{on ? '✓' : ''}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ШАГ 4: Горизонт */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HORIZON.map(h => {
                const on = horizon === h.id
                return (
                  <button key={h.id} onClick={() => setHorizon(h.id)} style={{
                    padding: '20px 24px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: on ? T.accent2 : T.card,
                    border: `2px solid ${on ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{h.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: on ? T.accent : T.text, fontFamily: '-apple-system,sans-serif' }}>{h.label}</span>
                        <span style={{ fontSize: 12, color: T.sub, fontFamily: 'monospace' }}>{h.sub}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{h.desc}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: on ? T.accent : 'transparent',
                      border: `2px solid ${on ? T.accent : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', transition: 'all 0.15s',
                    }}>{on ? '✓' : ''}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Навигация */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: '0 0 auto', padding: '13px 24px', borderRadius: 12,
                background: T.card, border: `1px solid ${T.border}`,
                fontSize: 15, color: T.text, cursor: 'pointer',
                fontFamily: '-apple-system,sans-serif', fontWeight: 500,
              }}>← Назад</button>
            )}
            <button
              onClick={step === 4 ? handleFinish : () => setStep(s => s + 1)}
              disabled={!canNext() || saving}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                background: canNext() ? T.accent : T.border,
                border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: canNext() ? 'pointer' : 'not-allowed',
                fontFamily: '-apple-system,sans-serif',
                transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Сохраняем...' : step === 4 ? '🎉 Начать работу' : 'Далее →'}
            </button>
          </div>

          {step === 4 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: T.sub, marginTop: 14, fontFamily: '-apple-system,sans-serif' }}>
              Всё можно изменить позже в профиле
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
