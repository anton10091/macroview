'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

// ─── Telegram Login Widget ────────────────────────────────────
// Замени TELEGRAM_BOT_NAME на username своего бота (без @)
const TELEGRAM_BOT_NAME = 'macroview_auth_bot'

function TelegramLoginButton({ onAuth }) {
  const ref = useRef(null)

  useEffect(() => {
    // Назначаем СРАЗУ до загрузки скрипта
    window.onTelegramAuth = (user) => onAuth(user)

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

    return () => { delete window.onTelegramAuth }
  }, [onAuth])

  return <div ref={ref} />
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Если уже залогинен — редиректим
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) checkOnboarding(data.session.user.id)
    })
  }, [])

  const checkOnboarding = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_done, role')
      .eq('id', userId)
      .single()

    if (data?.role === 'admin') {
      router.push('/admin')
    } else if (!data?.onboarding_done) {
      router.push('/onboarding')
    } else {
      router.push('/')
    }
  }

  // Email регистрация
  const handleEmailRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Письмо с подтверждением отправлено на ' + email)
      setTimeout(() => router.push(`/confirm?email=${encodeURIComponent(email)}`), 800)
    }
    setLoading(false)
  }

  // Email вход
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Неверный email или пароль')
    } else {
      await checkOnboarding(data.user.id)
    }
    setLoading(false)
  }

  // Telegram вход
  const handleTelegramAuth = async (tgUser) => {
    setLoading(true)
    setError('')
    try {
      // Вход через Supabase с Telegram данными
      // Используем email-less OTP через magic link или создаём сессию через API
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Устанавливаем сессию
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      await checkOnboarding(user.id)
    } catch (err) {
      setError('Ошибка входа через Telegram: ' + err.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${T.border}`, fontSize: 14,
    fontFamily: '-apple-system,sans-serif', color: T.text,
    background: T.bg, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const btnStyle = {
    width: '100%', padding: '13px', borderRadius: 10,
    background: T.accent, color: '#fff', border: 'none',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: '-apple-system,sans-serif',
    transition: 'opacity 0.15s',
    opacity: loading ? 0.7 : 1,
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Шапка */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'Georgia,serif' }}>M</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: 'Georgia,serif' }}>MacroView</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: T.sub, textDecoration: 'none' }}>← На главную</Link>
      </div>

      {/* Форма */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Заголовок */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 8px', fontFamily: '-apple-system,sans-serif' }}>
              {mode === 'login' ? 'Добро пожаловать' : 'Создать аккаунт'}
            </h1>
            <p style={{ fontSize: 14, color: T.sub, margin: 0, fontFamily: '-apple-system,sans-serif' }}>
              {mode === 'login'
                ? 'Войдите чтобы получить персонализированную аналитику'
                : 'Настройте MacroView под ваши инвестиционные цели'}
            </p>
          </div>

          <div style={{ background: T.card, borderRadius: T.radius, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '32px 28px' }}>

            {/* Переключатель */}
            <div style={{ display: 'flex', background: T.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                  background: mode === m ? T.card : 'transparent',
                  boxShadow: mode === m ? T.shadow : 'none',
                  fontSize: 14, fontWeight: mode === m ? 700 : 400,
                  color: mode === m ? T.text : T.sub,
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: '-apple-system,sans-serif',
                }}>
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>

            {/* Email форма */}
            <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mode === 'register' && (
                  <input
                    type="text" placeholder="Ваше имя" value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle} required
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                )}
                <input
                  type="email" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <input
                  type="password" placeholder="Пароль" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 4 }} required
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: T.accent, cursor: 'pointer', fontFamily: '-apple-system,sans-serif' }}>
                    Забыли пароль?
                  </span>
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 12px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626', marginBottom: 14, fontFamily: '-apple-system,sans-serif' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ padding: '10px 12px', background: '#D1FAE5', borderRadius: 8, fontSize: 13, color: '#059669', marginBottom: 14, fontFamily: '-apple-system,sans-serif' }}>
                  {success}
                </div>
              )}

              <button type="submit" style={{ ...btnStyle, marginTop: error || success ? 0 : 16 }} disabled={loading}>
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>

            {/* Разделитель */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 12, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>или</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Telegram */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TelegramLoginButton onAuth={handleTelegramAuth} />
            </div>

          </div>

          {/* Нижний текст */}
          <p style={{ textAlign: 'center', fontSize: 12, color: T.sub, marginTop: 20, fontFamily: '-apple-system,sans-serif', lineHeight: 1.6 }}>
            Регистрируясь, вы соглашаетесь с условиями использования сервиса MacroView
          </p>
        </div>
      </div>
    </div>
  )
}
