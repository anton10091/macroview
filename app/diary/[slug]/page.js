'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DIARY_ENTRIES, COUNTRIES } from '../../lib/mock'
import { SIGNAL_CONFIG, DIRECTIONS } from '../../lib/types'
import { Navbar } from '../../components/layout/Navbar'

export default function DiaryEntryPage() {
  const params = useParams()
  const entry = DIARY_ENTRIES.find(e => e.slug === params.slug)

  if (!entry) return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1612', marginBottom: 12 }}>Запись не найдена</p>
        <Link href="/diary" style={{ fontFamily: 'monospace', fontSize: 13, color: '#1a3a6a', textDecoration: 'none' }}>← Вернуться в аналитику</Link>
      </div>
    </div>
  )

  const country = COUNTRIES.find(c => c.slug === entry.country_slug)
  const dir = DIRECTIONS.find(d => d.id === entry.direction)
  const signalCfg = entry.signal ? SIGNAL_CONFIG[entry.signal] : null

  const related = DIARY_ENTRIES
    .filter(e => e.id !== entry.id && (e.country_slug === entry.country_slug || e.direction === entry.direction))
    .slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Хлебные крошки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontFamily: 'monospace', fontSize: 10, color: '#9a948e', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#9a948e', textDecoration: 'none' }}>MacroView</Link>
          <span>›</span>
          <Link href="/diary" style={{ color: '#9a948e', textDecoration: 'none' }}>Аналитика</Link>
          {country && (
            <>
              <span>›</span>
              <Link href={`/country/${country.slug}`} style={{ color: '#9a948e', textDecoration: 'none' }}>{country.flag} {country.name}</Link>
            </>
          )}
        </div>

        {/* Мета */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {country && (
            <span style={{ fontFamily: 'monospace', fontSize: 10, background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 4, padding: '2px 8px' }}>
              {country.flag} {country.name}
            </span>
          )}
          {dir && dir.id !== 'general' && (
            <span style={{ fontFamily: 'monospace', fontSize: 10, background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 4, padding: '2px 8px' }}>
              {dir.icon} {dir.label}
            </span>
          )}
          {signalCfg && (
            <span style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 6, border: `1px solid ${signalCfg.border}`, color: signalCfg.color, background: signalCfg.bg }}>
              {signalCfg.label}
            </span>
          )}
          {entry.chi_impact !== null && (
            <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${entry.chi_impact > 0 ? '#bbf7d0' : '#fecaca'}`, color: entry.chi_impact > 0 ? '#15803d' : '#991b1b', background: entry.chi_impact > 0 ? '#f0fdf4' : '#fef2f2' }}>
              CHI {entry.chi_impact > 0 ? '+' : ''}{entry.chi_impact}
            </span>
          )}
          {entry.is_live && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Живая запись — агент дописывает
            </span>
          )}
        </div>

        {/* Заголовок */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 900, color: '#1a1612', margin: '0 0 16px', lineHeight: 1.2 }}>
          {entry.title}
        </h1>

        {/* Лид */}
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#2a2520', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic', borderLeft: '4px solid #1a3a6a', paddingLeft: 16 }}>
          {entry.lead}
        </p>

        {/* Дата и статистика */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e8e2d8', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e' }}>{entry.published_at}</span>
          {entry.updated_at !== entry.published_at && (
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e' }}>Обновлено: {entry.updated_at}</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontFamily: 'monospace', fontSize: 11, color: '#c8c2b8' }}>
            <span>👁 {entry.views.toLocaleString()}</span>
            <span>♡ {entry.likes}</span>
          </div>
        </div>

        {/* Секции */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {entry.sections.map((section, i) => {
            if (section.type === 'highlight') return (
              <div key={i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
                {section.label && <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#1a3a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{section.label}</div>}
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 600, color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>{section.content}</p>
              </div>
            )
            if (section.type === 'data') return (
              <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
                {section.label && <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{section.label}</div>}
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#166534', lineHeight: 1.6, margin: 0 }}>{section.content}</p>
              </div>
            )
            if (section.type === 'quote') return (
              <blockquote key={i} style={{ borderLeft: '4px solid #d97706', paddingLeft: 16, margin: 0 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic', color: '#2a2520', lineHeight: 1.7, margin: 0 }}>"{section.content}"</p>
                {section.author && <cite style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', display: 'block', marginTop: 4 }}>— {section.author}</cite>}
              </blockquote>
            )
            return (
              <p key={i} style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#2a2520', lineHeight: 1.8, margin: 0 }}>{section.content}</p>
            )
          })}
        </div>

        {/* Теги */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 24, borderTop: '1px solid #e8e2d8', marginBottom: 24 }}>
          {entry.tags.map(tag => (
            <span key={tag} style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460', background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 9999, padding: '3px 12px' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Ссылка на страну */}
        {country && (
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{country.flag}</span>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612' }}>{country.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>CHI: {country.chi.index} · {country.chi.agentNote.slice(0, 60)}...</div>
              </div>
            </div>
            <Link href={`/country/${country.slug}`} style={{ fontFamily: 'monospace', fontSize: 12, color: '#1a3a6a', border: '1px solid rgba(26,58,106,0.3)', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>
              Открыть страну →
            </Link>
          </div>
        )}

        {/* Похожие записи */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>Похожие записи</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {related.map(r => {
                const rc = COUNTRIES.find(c => c.slug === r.country_slug)
                return (
                  <Link key={r.id} href={`/diary/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', marginBottom: 4 }}>{rc?.flag} {rc?.name} · {r.published_at}</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1612' }}>{r.title}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
