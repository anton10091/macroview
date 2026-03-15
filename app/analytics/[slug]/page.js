'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Navbar } from '../../components/layout/Navbar'

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

const COUNTRY_NAMES = {
  world:'Мир', usa:'США', china:'Китай', india:'Индия', russia:'Россия',
  germany:'Германия', uk:'Британия', thailand:'Таиланд', uae:'ОАЭ',
  georgia:'Грузия', turkey:'Турция', indonesia:'Индонезия', vietnam:'Вьетнам',
  malaysia:'Малайзия', spain:'Испания', portugal:'Португалия', serbia:'Сербия',
  kazakhstan:'Казахстан', uzbekistan:'Узбекистан', israel:'Израиль', cyprus:'Кипр',
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1000, background: 'rgba(0,102,255,0.12)' }}>
      <div style={{ height: '100%', width: `${progress}%`, background: T.accent, transition: 'width 0.1s linear', borderRadius: '0 2px 2px 0' }} />
    </div>
  )
}

function InfographicBlock({ block }) {
  const items = block.items || []
  return (
    <div style={{ margin: '2rem 0', background: '#f8fafc', border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 24px 20px' }}>
      {block.title && (
        <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
          {block.title}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 14 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 12, padding: '18px 16px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: item.color || T.accent, lineHeight: 1, marginBottom: 8 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.4, fontFamily: '-apple-system,sans-serif' }}>{item.label}</div>
            {item.trend != null && (
              <div style={{ fontSize: 12, fontWeight: 600, color: item.trend > 0 ? '#059669' : '#dc2626', marginTop: 6 }}>
                {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
              </div>
            )}
          </div>
        ))}
      </div>
      {block.source && <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginTop: 14 }}>Источник: {block.source}</div>}
    </div>
  )
}

function BarChartBlock({ block }) {
  const bars = block.bars || []
  const maxVal = Math.max(...bars.map(b => b.value), 1)
  return (
    <div style={{ margin: '2rem 0', background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px' }}>
      {block.title && <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: '-apple-system,sans-serif' }}>{block.title}</div>}
      {block.subtitle && <div style={{ fontSize: 12, color: T.sub, marginBottom: 20, fontFamily: 'monospace' }}>{block.subtitle}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bars.map((bar, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{bar.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: bar.color || T.accent, fontFamily: 'monospace' }}>{bar.value}{bar.unit || ''}</span>
            </div>
            <div style={{ height: 8, background: T.border, borderRadius: 4 }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${(bar.value / maxVal) * 100}%`, background: bar.color || T.accent }} />
            </div>
          </div>
        ))}
      </div>
      {block.source && <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginTop: 16 }}>Источник: {block.source}</div>}
    </div>
  )
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading': {
      const sizes = { 2: 22, 3: 18, 4: 15 }
      const margins = { 2: '2.5rem 0 0.75rem', 3: '2rem 0 0.5rem', 4: '1.5rem 0 0.5rem' }
      const lvl = block.level || 2
      return <div style={{ fontSize: sizes[lvl], fontWeight: 700, color: T.text, margin: margins[lvl], lineHeight: 1.3, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>{block.text}</div>
    }
    case 'paragraph':
      return <p style={{ fontSize: 16, color: '#2d2d3a', lineHeight: 1.85, margin: '0 0 1.25rem', fontFamily: 'Georgia, serif' }}>{block.text}</p>
    case 'quote':
      return (
        <blockquote style={{ margin: '1.75rem 0', padding: '1.25rem 1.5rem', borderLeft: `4px solid ${T.accent}`, background: T.accent2, borderRadius: '0 12px 12px 0' }}>
          <p style={{ fontSize: 17, color: T.text, lineHeight: 1.7, margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>«{block.text}»</p>
          {block.author && <div style={{ fontSize: 12, color: T.sub, marginTop: 8, fontFamily: 'monospace' }}>— {block.author}</div>}
        </blockquote>
      )
    case 'callout': {
      const styles = {
        warning: { bg: '#FFFBEB', border: '#D97706', label: 'Риск' },
        success: { bg: '#F0FDF4', border: '#059669', label: 'Возможность' },
        info:    { bg: '#EFF6FF', border: '#2563EB', label: 'Важно' },
        danger:  { bg: '#FFF1F2', border: '#DC2626', label: 'Внимание' },
      }
      const cs = styles[block.variant] || styles.info
      return (
        <div style={{ margin: '1.5rem 0', padding: '1rem 1.25rem 1rem 1.5rem', background: cs.bg, borderLeft: `4px solid ${cs.border}`, borderRadius: '0 12px 12px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: cs.border, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{cs.label}</div>
          <p style={{ fontSize: 14, color: T.text, lineHeight: 1.65, margin: 0, fontFamily: '-apple-system,sans-serif' }}>{block.text}</p>
        </div>
      )
    }
    case 'table':
      return (
        <div style={{ overflowX: 'auto', margin: '1.75rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: '-apple-system,sans-serif' }}>
            <thead>
              <tr>{(block.headers || []).map((h, i) => <th key={i} style={{ padding: '11px 16px', textAlign: 'left', background: '#1a3a6a', color: '#fff', fontWeight: 600, borderRadius: i === 0 ? '8px 0 0 0' : i === (block.headers.length - 1) ? '0 8px 0 0' : 0 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(block.rows || []).map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? T.card : '#f8fafc' }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, color: T.text }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'infographic': return <InfographicBlock block={block} />
    case 'bar_chart': return <BarChartBlock block={block} />
    case 'image':
      return (
        <div style={{ margin: '2rem 0' }}>
          <img src={block.url} alt={block.caption || ''} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
          {block.caption && <div style={{ fontSize: 12, color: T.sub, marginTop: 8, fontFamily: 'monospace', textAlign: 'center' }}>{block.caption}</div>}
        </div>
      )
    case 'divider': return <hr style={{ border: 'none', borderTop: `1px solid ${T.border}`, margin: '2rem 0' }} />
    default: return null
  }
}

function ShareButtons({ title, bookmarked, onBookmark }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const enc = encodeURIComponent(url)
  const encT = encodeURIComponent(title || '')
  const socials = [
    { label: 'TG',  color: '#229ED9', href: `https://t.me/share/url?url=${enc}&text=${encT}` },
    { label: 'ВК',  color: '#4C75A3', href: `https://vk.com/share.php?url=${enc}&title=${encT}` },
    { label: 'OK',  color: '#EE8208', href: `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&url=${enc}` },
    { label: 'X',   color: '#1a1a1a', href: `https://twitter.com/intent/tweet?url=${enc}&text=${encT}` },
    { label: 'Pin', color: '#E60023', href: `https://pinterest.com/pin/create/button/?url=${enc}&description=${encT}` },
  ]
  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Поделиться</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={onBookmark} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${bookmarked ? '#d97706' : T.border}`, background: bookmarked ? '#FEF3C7' : T.card, cursor: 'pointer', fontSize: 13, color: bookmarked ? '#d97706' : T.text, fontFamily: '-apple-system,sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
          {bookmarked ? '★ В закладках' : '☆ Сохранить'}
        </button>
        <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${copied ? '#059669' : T.border}`, background: copied ? '#D1FAE5' : T.card, cursor: 'pointer', fontSize: 13, color: copied ? '#059669' : T.text, fontFamily: '-apple-system,sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
          {copied ? '✓ Скопировано' : '🔗 Скопировать'}
        </button>
        {socials.map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', borderRadius: 8, background: s.color, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: '-apple-system,sans-serif' }}>{s.label}</a>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsArticlePage() {
  const params = useParams()
  const slug = params?.slug
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [views, setViews] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!slug) return
    supabase.from('population_analytics').select('*').eq('slug', slug).single()
      .then(({ data, error }) => {
        if (!error && data) { setArticle(data); setViews(data.views || 0) }
        setLoading(false)
      })
    supabase.rpc('increment_article_views', { article_slug: slug }).then(() => {}).catch?.(() => {})
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUser(data.session.user)
        supabase.from('user_bookmarks').select('id').eq('user_id', data.session.user.id).eq('article_id', slug).single()
          .then(({ data: bm }) => { if (bm) setBookmarked(true) })
      }
    })
  }, [slug])

  const handleBookmark = async () => {
    if (!user) return
    if (bookmarked) {
      await supabase.from('user_bookmarks').delete().eq('user_id', user.id).eq('article_id', slug)
      setBookmarked(false)
    } else {
      await supabase.from('user_bookmarks').insert({ user_id: user.id, article_id: slug, table_name: 'population_analytics' })
      setBookmarked(true)
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: T.bg }}><Navbar /><div style={{ maxWidth: 780, margin: '80px auto', padding: '0 24px', textAlign: 'center', color: T.sub, fontSize: 15 }}>Загрузка...</div></div>

  if (!article) return (
    <div style={{ minHeight: '100vh', background: T.bg }}><Navbar />
      <div style={{ maxWidth: 780, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
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
      {article.structured_data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article.structured_data) }} />}

      {/* Обложка — только градиент, без картинки */}
      <div style={{ background: gradient, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 960, margin: '0 auto', width: '100%', padding: '0 24px 36px' }}>

          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <Link href="/macro-indicators" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>Макроиндикаторы</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Аналитика</span>
          </div>

          {/* Кликабельные теги */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href={`/analytics?tag=${encodeURIComponent(article.section_tag || 'Аналитика')}`} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
              {article.section_tag || 'Аналитика'}
            </Link>
            {(article.tags || []).slice(0, 4).map(tag => (
              <Link key={tag} href={`/analytics?tag=${encodeURIComponent(tag)}`} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>
                {tag}
              </Link>
            ))}
          </div>

          {/* Заголовок */}
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 18px', lineHeight: 1.22, maxWidth: 720 }}>{article.title}</h1>

          {/* Мета */}
          <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'rgba(255,255,255,0.72)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{article.date ? new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
            <span>· {article.read_time || 5} мин</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {(views + 1).toLocaleString('ru')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {article.comments_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 72px', display: 'grid', gridTemplateColumns: '1fr 268px', gap: 36, alignItems: 'start' }}>
        <div>
          {/* Картинка со скруглёнными углами — сразу после обложки */}
          {article.cover_url && (
            <div style={{ marginTop: 32, marginBottom: '2rem' }}>
              <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: '100%', borderRadius: 16, display: 'block', maxHeight: 440, objectFit: 'cover' }} />
              {article.cover_alt && <div style={{ fontSize: 12, color: T.sub, marginTop: 8, fontFamily: 'monospace', textAlign: 'center' }}>{article.cover_alt}</div>}
            </div>
          )}

          {/* Лид */}
          {article.lead && (
            <p style={{ fontSize: 18, color: T.text, lineHeight: 1.75, fontWeight: 500, margin: `${article.cover_url ? '0' : '2rem'} 0 2rem`, padding: '0 0 2rem', borderBottom: `2px solid ${T.border}`, fontFamily: 'Georgia, serif' }}>
              {article.lead}
            </p>
          )}

          {/* Ключевые тезисы */}
          {takeaways.length > 0 && (
            <div style={{ background: T.accent2, border: `1px solid ${T.accent}28`, borderRadius: 14, padding: '20px 24px', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Ключевые тезисы</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {takeaways.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.accent, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: T.text, lineHeight: 1.55, fontFamily: '-apple-system,sans-serif' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Тело статьи с инфографикой */}
          {sections.map((block, i) => <ContentBlock key={i} block={block} />)}

          {/* Вывод */}
          {article.conclusion && (
            <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6a 100%)', borderRadius: 16, padding: '28px 32px', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>Вывод MacroView</div>
              <p style={{ fontSize: 16, lineHeight: 1.8, margin: 0, color: 'rgba(255,255,255,0.93)', fontFamily: 'Georgia, serif' }}>{article.conclusion}</p>
            </div>
          )}

          <ShareButtons title={article.title} bookmarked={bookmarked} onBookmark={handleBookmark} />
        </div>

        {/* Сайдбар */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px 16px', boxShadow: T.shadow, display: 'flex', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.sub} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{(views + 1).toLocaleString('ru')}</span>
              <span style={{ fontSize: 12, color: T.sub }}>просм.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.sub} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{article.comments_count || 0}</span>
              <span style={{ fontSize: 12, color: T.sub }}>комм.</span>
            </div>
          </div>

          {article.country_slugs?.length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', boxShadow: T.shadow }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Страны в материале</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {article.country_slugs.map(s => (
                  <Link key={s} href={`/country/${s}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: T.bg, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                    <img src={`/flags/${s}.png`} onError={e => { e.target.style.display = 'none' }} width={24} height={16} alt={s} style={{ borderRadius: 2, objectFit: 'cover' }} />
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{COUNTRY_NAMES[s] || s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    <span style={{ marginLeft: 'auto', color: T.accent, fontSize: 14 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>О материале</div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, fontFamily: '-apple-system,sans-serif' }}>
              <div style={{ marginBottom: 6 }}>📅 {article.date ? new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</div>
              <div style={{ marginBottom: 6 }}>⏱ {article.read_time || 5} мин чтения</div>
              <div>✍️ {article.author || 'MacroView'}</div>
            </div>
          </div>

          {(article.tags || []).length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', boxShadow: T.shadow }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Теги</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(article.tags || []).map(tag => (
                  <Link key={tag} href={`/analytics?tag=${encodeURIComponent(tag)}`} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: T.accent2, color: T.accent, border: `1px solid ${T.accent}28`, textDecoration: 'none', fontFamily: '-apple-system,sans-serif', fontWeight: 500 }}>{tag}</Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/macro-indicators" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: T.radius, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow, textDecoration: 'none', fontSize: 13, color: T.accent, fontWeight: 600 }}>
            ← Все индикаторы
          </Link>
        </div>
      </div>
    </div>
  )
}
