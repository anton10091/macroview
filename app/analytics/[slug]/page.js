'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Navbar } from '../../components/layout/Navbar'

// ─── Дизайн-токены (совпадают с macro-indicators) ────────────────
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

// ─── Рендер блоков контента из body_sections jsonb ───────────────
function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      const Tag = `h${block.level || 2}`
      const sizes = { 2: 22, 3: 18, 4: 15 }
      return (
        <Tag style={{
          fontSize: sizes[block.level || 2],
          fontWeight: 700,
          color: T.text,
          margin: '2rem 0 0.75rem',
          lineHeight: 1.3,
          fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif',
        }}>{block.text}</Tag>
      )

    case 'paragraph':
      return (
        <p style={{
          fontSize: 16, color: '#2d2d3a', lineHeight: 1.8,
          margin: '0 0 1.25rem',
          fontFamily: 'Georgia, serif',
        }}>{block.text}</p>
      )

    case 'quote':
      return (
        <blockquote style={{
          margin: '1.5rem 0',
          padding: '1.25rem 1.5rem',
          borderLeft: `4px solid ${T.accent}`,
          background: T.accent2,
          borderRadius: '0 12px 12px 0',
        }}>
          <p style={{ fontSize: 16, color: T.text, lineHeight: 1.7, margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            «{block.text}»
          </p>
          {block.author && (
            <div style={{ fontSize: 12, color: T.sub, marginTop: 8, fontFamily: 'monospace' }}>
              — {block.author}
            </div>
          )}
        </blockquote>
      )

    case 'callout':
      const calloutStyles = {
        warning: { bg: '#FEF3C7', border: '#D97706', icon: '⚠️', label: 'Риск' },
        success: { bg: '#D1FAE5', border: '#059669', icon: '✅', label: 'Возможность' },
        info:    { bg: '#DBEAFE', border: '#2563EB', icon: 'ℹ️', label: 'Важно' },
        danger:  { bg: '#FEE2E2', border: '#DC2626', icon: '🚨', label: 'Внимание' },
      }
      const cs = calloutStyles[block.variant] || calloutStyles.info
      return (
        <div style={{
          margin: '1.5rem 0',
          padding: '1rem 1.25rem',
          background: cs.bg,
          borderLeft: `4px solid ${cs.border}`,
          borderRadius: '0 12px 12px 0',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{cs.icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: cs.border, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {cs.label}
            </div>
            <p style={{ fontSize: 14, color: T.text, lineHeight: 1.6, margin: 0, fontFamily: '-apple-system,sans-serif' }}>
              {block.text}
            </p>
          </div>
        </div>
      )

    case 'table':
      return (
        <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: '-apple-system,sans-serif' }}>
            <thead>
              <tr>
                {(block.headers || []).map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 14px', textAlign: 'left',
                    background: T.accent, color: '#fff',
                    fontWeight: 600,
                    borderRadius: i === 0 ? '8px 0 0 0' : i === block.headers.length - 1 ? '0 8px 0 0' : 0,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(block.rows || []).map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? T.card : T.bg }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '9px 14px', borderBottom: `1px solid ${T.border}`, color: T.text }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'divider':
      return <hr style={{ border: 'none', borderTop: `1px solid ${T.border}`, margin: '2rem 0' }} />

    default:
      return null
  }
}

// ─── Прогресс-бар чтения ─────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1000,
      background: 'rgba(0,102,255,0.15)',
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: T.accent, transition: 'width 0.1s linear',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}

// ─── Главный компонент страницы ───────────────────────────────────
export default function AnalyticsArticlePage() {
  const params = useParams()
  const slug = params?.slug
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('population_analytics')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setArticle(data)
        setLoading(false)
      })
  }, [slug])

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '80px auto', padding: '0 24px', textAlign: 'center', color: T.sub, fontSize: 15 }}>
        Загрузка...
      </div>
    </div>
  )

  if (!article) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Статья не найдена</div>
        <Link href="/macro-indicators" style={{ color: T.accent, fontSize: 14 }}>← Вернуться к индикаторам</Link>
      </div>
    </div>
  )

  const gradient = GRADIENTS[(article.gradient_index || 0) % GRADIENTS.length]
  const sections = article.body_sections || []
  const takeaways = article.key_takeaways || []

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <ReadingProgress />
      <Navbar />

      {/* JSON-LD SEO */}
      {article.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article.structured_data) }}
        />
      )}

      {/* ── Обложка ── */}
      <div style={{
        background: article.cover_url ? `url(${article.cover_url}) center/cover` : gradient,
        minHeight: 340,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        position: 'relative',
      }}>
        {/* Затемнение */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px 36px' }}>
          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <Link href="/macro-indicators" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Макроиндикаторы</Link>
            <span>›</span>
            <span style={{ color: '#fff' }}>Аналитика</span>
          </div>

          {/* Теги */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#fff',
            }}>{article.section_tag || 'Аналитика'}</span>
            {(article.tags || []).slice(0, 3).map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.85)',
              }}>{tag}</span>
            ))}
          </div>

          {/* Заголовок */}
          <h1 style={{
            fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 16px',
            lineHeight: 1.25, maxWidth: 700,
            fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif',
          }}>{article.title}</h1>

          {/* Мета */}
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.75)', flexWrap: 'wrap' }}>
            <span>
              {article.date ? new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </span>
            <span>· {article.read_time || 5} мин чтения</span>
            <span>· {article.author || 'MacroView'}</span>
          </div>
        </div>
      </div>

      {/* ── Контент ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 32, alignItems: 'start' }}>

        {/* Основная колонка */}
        <div>

          {/* Лид */}
          {article.lead && (
            <p style={{
              fontSize: 18, color: T.text, lineHeight: 1.7, fontWeight: 500,
              margin: '0 0 2rem', padding: '0 0 2rem',
              borderBottom: `2px solid ${T.border}`,
              fontFamily: 'Georgia, serif',
            }}>{article.lead}</p>
          )}

          {/* Ключевые тезисы */}
          {takeaways.length > 0 && (
            <div style={{
              background: T.accent2, border: `1px solid ${T.accent}30`,
              borderRadius: 12, padding: '20px 24px', marginBottom: '2rem',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Ключевые тезисы
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {takeaways.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.accent, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: T.text, lineHeight: 1.5, fontFamily: '-apple-system,sans-serif' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Тело статьи */}
          {sections.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}

          {/* Вывод */}
          {article.conclusion && (
            <div style={{
              marginTop: '2.5rem',
              background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 100%)',
              borderRadius: 16, padding: '28px 32px', color: '#fff',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                Вывод MacroView
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.75, margin: 0, color: 'rgba(255,255,255,0.92)', fontFamily: 'Georgia, serif' }}>
                {article.conclusion}
              </p>
            </div>
          )}

          {/* Поделиться */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: T.sub, fontFamily: '-apple-system,sans-serif' }}>Поделиться:</span>
            <button onClick={handleCopy} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${T.border}`,
              background: copied ? '#D1FAE5' : T.card, cursor: 'pointer',
              fontSize: 13, color: copied ? '#059669' : T.text,
              fontFamily: '-apple-system,sans-serif', fontWeight: 500,
              transition: 'all 0.2s',
            }}>
              {copied ? '✓ Скопировано' : '🔗 Копировать ссылку'}
            </button>
          </div>
        </div>

        {/* Боковая колонка */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Страны статьи */}
          {article.country_slugs?.length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', boxShadow: T.shadow }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Страны в материале
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {article.country_slugs.map(slug => (
                  <Link key={slug} href={`/country/${slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: T.bg, textDecoration: 'none',
                    border: `1px solid ${T.border}`,
                    transition: 'all 0.15s',
                  }}>
                    <img
                      src={`/flags/${slug}.png`}
                      onError={e => { e.target.style.display = 'none' }}
                      width={24} height={16} alt={slug}
                      style={{ borderRadius: 2, objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 500, textTransform: 'capitalize' }}>
                      {slug.charAt(0).toUpperCase() + slug.slice(1)}
                    </span>
                    <span style={{ marginLeft: 'auto', color: T.accent, fontSize: 14 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Источник */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              О материале
            </div>
            <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6, fontFamily: '-apple-system,sans-serif' }}>
              <div style={{ marginBottom: 6 }}>📅 {article.date ? new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</div>
              <div style={{ marginBottom: 6 }}>⏱ {article.read_time || 5} минут чтения</div>
              <div>✍️ {article.author || 'MacroView'}</div>
            </div>
          </div>

          {/* Назад */}
          <Link href="/macro-indicators" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', borderRadius: T.radius,
            background: T.card, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, textDecoration: 'none',
            fontSize: 13, color: T.accent, fontWeight: 600,
            fontFamily: '-apple-system,sans-serif',
          }}>
            ← Все индикаторы
          </Link>
        </div>
      </div>
    </div>
  )
}
