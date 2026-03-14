'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const T = {
  bg:     '#F5F7FA',
  card:   '#FFFFFF',
  accent: '#0066FF',
  text:   '#1A1A2E',
  sub:    '#6B7280',
  border: '#E5E9F0',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
}

function ConfirmContent() {
  const params = useSearchParams()
  const email = params.get('email') || 'вашу почту'

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Лого */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'Georgia,serif' }}>M</div>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: 'Georgia,serif' }}>MacroView</span>
      </Link>

      <div style={{ background: T.card, borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: '48px 40px', maxWidth: 460, width: '100%', textAlign: 'center' }}>

        {/* Иконка */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
          📬
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 12px', fontFamily: '-apple-system,sans-serif' }}>
          Подтвердите email
        </h1>

        <p style={{ fontSize: 15, color: T.sub, lineHeight: 1.7, margin: '0 0 8px', fontFamily: '-apple-system,sans-serif' }}>
          Мы отправили письмо на
        </p>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.accent, marginBottom: 24, fontFamily: 'monospace', background: '#EFF6FF', padding: '8px 16px', borderRadius: 8, display: 'inline-block' }}>
          {email}
        </div>

        <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, margin: '0 0 32px', fontFamily: '-apple-system,sans-serif' }}>
          Нажмите на ссылку в письме чтобы активировать аккаунт и перейти к настройке профиля.
        </p>

        {/* Советы */}
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Не пришло письмо?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Проверьте папку "Спам"',
              'Письмо может идти до 5 минут',
              'Убедитесь что email введён верно',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: T.accent, fontSize: 14, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/auth" style={{
          display: 'block', padding: '12px', borderRadius: 12,
          border: `1px solid ${T.border}`, textDecoration: 'none',
          fontSize: 14, color: T.sub, fontFamily: '-apple-system,sans-serif',
          transition: 'all 0.15s',
        }}>
          ← Вернуться к входу
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F7FA' }} />}>
      <ConfirmContent />
    </Suspense>
  )
}
