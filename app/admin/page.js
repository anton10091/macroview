'use client'
import { useState, useEffect, useRef } from 'react'
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

const TABS = [
  { id: 'articles', label: 'Статьи аналитики' },
  { id: 'editor',   label: 'Редактор статьи' },
  { id: 'images',   label: 'Загрузка картинок' },
  { id: 'users',    label: 'Пользователи' },
]

const EMPTY_ARTICLE = {
  id: '', slug: '', title: '', excerpt: '', cover_url: '', cover_alt: '',
  read_time: 5, tags: [], section_tag: 'Аналитика', gradient_index: 0,
  country_slugs: [], date: new Date().toISOString().split('T')[0],
  author: 'MacroView', lead: '', conclusion: '', key_takeaways: [],
  body_sections: [], seo_title: '', seo_description: '', seo_keywords: [],
  is_published: false, is_featured: false,
}

function inp(extra = {}) {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${T.border}`, fontSize: 13,
    fontFamily: '-apple-system,sans-serif', color: T.text,
    background: T.bg, outline: 'none', boxSizing: 'border-box',
    ...extra,
  }
}

// ── Список статей ────────────────────────────────────────
function ArticlesList({ onEdit }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('population_analytics')
      .select('id, slug, title, date, is_published, is_featured, views')
      .order('date', { ascending: false })
      .then(({ data }) => { if (data) setArticles(data); setLoading(false) })
  }, [])

  const togglePublish = async (slug, current) => {
    await supabase.from('population_analytics').update({ is_published: !current }).eq('slug', slug)
    setArticles(prev => prev.map(a => a.slug === slug ? { ...a, is_published: !current } : a))
  }

  const deleteArticle = async (slug) => {
    if (!confirm('Удалить статью?')) return
    await supabase.from('population_analytics').delete().eq('slug', slug)
    setArticles(prev => prev.filter(a => a.slug !== slug))
  }

  if (loading) return <div style={{ color: T.sub, fontSize: 14 }}>Загрузка...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: T.sub }}>{articles.length} статей</div>
        <button onClick={() => onEdit(null)} style={{ padding: '8px 18px', borderRadius: 8, background: T.accent, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Новая статья
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {articles.map(a => (
          <div key={a.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: T.sub, fontFamily: 'monospace' }}>{a.slug} · {a.date} · {a.views || 0} просм.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              {a.is_featured && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#FEF3C7', color: '#854F0B', fontFamily: 'monospace' }}>★ топ</span>}
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: a.is_published ? '#D1FAE5' : '#F3F4F6', color: a.is_published ? '#065F46' : T.sub, fontFamily: 'monospace', cursor: 'pointer' }}
                onClick={() => togglePublish(a.slug, a.is_published)}>
                {a.is_published ? 'опубл.' : 'черновик'}
              </span>
              <button onClick={() => onEdit(a.id)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, fontSize: 12, cursor: 'pointer', color: T.accent }}>
                Редактировать
              </button>
              <button onClick={() => deleteArticle(a.slug)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #FCA5A5', background: '#FEF2F2', fontSize: 12, cursor: 'pointer', color: '#DC2626' }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Редактор статьи ──────────────────────────────────────
function ArticleEditor({ articleId, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_ARTICLE })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')

  // Поля для удобного ввода массивов
  const [tagsStr, setTagsStr] = useState('')
  const [countriesStr, setCountriesStr] = useState('')
  const [takeawaysStr, setTakeawaysStr] = useState('')
  const [seoKwStr, setSeoKwStr] = useState('')
  const [sectionsStr, setSectionsStr] = useState('')

  useEffect(() => {
    if (!articleId) {
      setForm({ ...EMPTY_ARTICLE })
      setTagsStr(''); setCountriesStr(''); setTakeawaysStr(''); setSeoKwStr(''); setSectionsStr('')
      return
    }
    setLoading(true)
    supabase.from('population_analytics').select('*').eq('id', articleId).single()
      .then(({ data }) => {
        if (data) {
          setForm(data)
          setTagsStr((data.tags || []).join(', '))
          setCountriesStr((data.country_slugs || []).join(', '))
          setTakeawaysStr((data.key_takeaways || []).join('\n'))
          setSeoKwStr((data.seo_keywords || []).join(', '))
          setSectionsStr(JSON.stringify(data.body_sections || [], null, 2))
        }
        setLoading(false)
      })
  }, [articleId])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const payload = {
        ...form,
        tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean),
        country_slugs: countriesStr.split(',').map(s => s.trim()).filter(Boolean),
        key_takeaways: takeawaysStr.split('\n').map(s => s.trim()).filter(Boolean),
        seo_keywords: seoKwStr.split(',').map(s => s.trim()).filter(Boolean),
        body_sections: sectionsStr ? JSON.parse(sectionsStr) : [],
        updated_at: new Date().toISOString(),
      }
      if (!payload.id) payload.id = payload.slug

      const { error } = await supabase.from('population_analytics').upsert(payload)
      if (error) throw error
      setSaved(true); setMsg('Сохранено!')
      setTimeout(() => { setSaved(false); setMsg('') }, 2500)
      onSaved()
    } catch (e) {
      setMsg('Ошибка: ' + e.message)
    }
    setSaving(false)
  }

  if (loading) return <div style={{ color: T.sub }}>Загрузка...</div>

  const field = (label, key, type = 'text', extra = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)} style={inp(extra)} />
    </div>
  )

  const textarea = (label, value, onChange, rows = 3, mono = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ ...inp(), resize: 'vertical', fontFamily: mono ? 'monospace' : '-apple-system,sans-serif', fontSize: mono ? 12 : 13 }} />
    </div>
  )

  const toggle = (label, key) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
      <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
      <span style={{ fontSize: 13, color: T.text, fontFamily: '-apple-system,sans-serif' }}>{label}</span>
    </label>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{articleId ? 'Редактирование статьи' : 'Новая статья'}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 13, color: saved ? '#059669' : '#DC2626', fontFamily: '-apple-system,sans-serif' }}>{msg}</span>}
          <button onClick={onSaved} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, fontSize: 13, cursor: 'pointer', color: T.sub }}>Отмена</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, background: saved ? '#059669' : T.accent, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Колонка 1 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12 }}>Основное</div>
          {field('Slug (URL)', 'slug')}
          {field('Заголовок', 'title')}
          {textarea('Excerpt (превью)', form.excerpt, v => set('excerpt', v))}
          {field('Дата публикации', 'date', 'date')}
          {field('Автор', 'author')}
          {field('Время чтения (мин)', 'read_time', 'number')}
          {field('Индекс градиента (0–7)', 'gradient_index', 'number')}
          {field('Section tag', 'section_tag')}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Теги (через запятую)</label>
            <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} style={inp()} placeholder="Индия, Китай, демография" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Страны (slug через запятую)</label>
            <input value={countriesStr} onChange={e => setCountriesStr(e.target.value)} style={inp()} placeholder="india, china" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 10, marginTop: 8 }}>Публикация</div>
            {toggle('Опубликовано', 'is_published')}
            {toggle('Закреплено в топе', 'is_featured')}
          </div>
        </div>

        {/* Колонка 2 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12 }}>Картинка</div>
          {field('URL обложки (cover_url)', 'cover_url')}
          {form.cover_url && (
            <img src={form.cover_url} alt="preview" style={{ width: '100%', borderRadius: 10, marginBottom: 12, maxHeight: 160, objectFit: 'cover' }} />
          )}
          {field('Alt текст обложки', 'cover_alt')}

          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>SEO</div>
          {field('SEO title (до 60 символов)', 'seo_title')}
          {textarea('SEO description (до 160 символов)', form.seo_description, v => set('seo_description', v), 2)}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>SEO keywords (через запятую)</label>
            <input value={seoKwStr} onChange={e => setSeoKwStr(e.target.value)} style={inp()} />
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12 }}>Контент статьи</div>
        {textarea('Лид (крупный вводный абзац)', form.lead, v => set('lead', v), 3)}
        {textarea('Ключевые тезисы (каждый с новой строки)', takeawaysStr, setTakeawaysStr, 5)}
        {textarea('Вывод MacroView', form.conclusion, v => set('conclusion', v), 3)}
        {textarea('Body sections (JSON)', sectionsStr, setSectionsStr, 10, true)}
        <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', marginTop: -8, marginBottom: 14 }}>
          Типы блоков: paragraph, heading, quote, callout, table, infographic, bar_chart, image, divider
        </div>
      </div>
    </div>
  )
}

// ── Загрузка картинок ────────────────────────────────────
function ImageUploader() {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])
  const [copied, setCopied] = useState('')
  const fileRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data, error } = await supabase.storage.from('analytics-covers').upload(name, file, { cacheControl: '3600', upsert: false })
      if (!error) {
        const { data: urlData } = supabase.storage.from('analytics-covers').getPublicUrl(name)
        setUploaded(prev => [...prev, { name, url: urlData.publicUrl }])
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const copy = (url) => {
    navigator.clipboard?.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div>
      <div style={{ border: `2px dashed ${T.border}`, borderRadius: 14, padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: 20 }}
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
        <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 4 }}>{uploading ? 'Загружаем...' : 'Нажмите или перетащите картинки'}</div>
        <div style={{ fontSize: 12, color: T.sub }}>JPG, PNG, WebP · Bucket: analytics-covers</div>
      </div>

      {uploaded.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12 }}>Загруженные файлы</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uploaded.map(f => (
              <div key={f.url} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={f.url} alt={f.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: T.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.url}</div>
                </div>
                <button onClick={() => copy(f.url)} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${copied === f.url ? '#059669' : T.border}`, background: copied === f.url ? '#D1FAE5' : T.card, fontSize: 12, cursor: 'pointer', color: copied === f.url ? '#059669' : T.text, flexShrink: 0 }}>
                  {copied === f.url ? '✓ Скопировано' : 'Копировать URL'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Пользователи ─────────────────────────────────────────
function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('user_profiles')
      .select('id, email, display_name, role, plan, onboarding_done, countries, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setUsers(data); setLoading(false) })
  }, [])

  if (loading) return <div style={{ color: T.sub, fontSize: 14 }}>Загрузка...</div>

  return (
    <div>
      <div style={{ fontSize: 14, color: T.sub, marginBottom: 16 }}>{users.length} пользователей</div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1a1612' }}>
              {['Пользователь', 'Роль', 'Онбординг', 'Стран', 'Дата'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#9a948e', fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${T.border}`, background: i % 2 === 0 ? T.card : T.bg }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 600, color: T.text }}>{u.display_name || '—'}</div>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: 'monospace' }}>{u.email}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: u.role === 'admin' ? '#EEEDFE' : T.bg, color: u.role === 'admin' ? '#534AB7' : T.sub, fontFamily: 'monospace' }}>
                    {u.role || 'user'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: u.onboarding_done ? '#059669' : T.sub }}>
                    {u.onboarding_done ? '✓ Готово' : '○ Нет'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: T.sub, fontSize: 12 }}>
                  {(u.countries || []).length}
                </td>
                <td style={{ padding: '10px 14px', color: T.sub, fontSize: 11, fontFamily: 'monospace' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Главный компонент ────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('articles')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [articlesKey, setArticlesKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/auth'); return }
      supabase.from('user_profiles').select('role').eq('id', data.session.user.id).single()
        .then(({ data: p }) => {
          if (p?.role !== 'admin') { router.push('/'); return }
          setLoading(false)
        })
    })
  }, [])

  const handleEdit = (id) => {
    setEditingId(id)
    setTab('editor')
  }

  const handleSaved = () => {
    setEditingId(null)
    setTab('articles')
    setArticlesKey(k => k + 1)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: T.sub }}>
        Проверка доступа...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 64px' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', fontFamily: '-apple-system,sans-serif' }}>
              Панель администратора
            </h1>
            <div style={{ fontSize: 13, color: T.sub, fontFamily: 'monospace' }}>MacroView · Admin</div>
          </div>
          <Link href="/" style={{ fontSize: 13, color: T.accent, textDecoration: 'none' }}>← На сайт</Link>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: 4, background: T.card, borderRadius: 12, padding: 4, marginBottom: 24, border: `1px solid ${T.border}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== 'editor') setEditingId(null) }} style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none',
              background: tab === t.id ? T.accent : 'transparent',
              color: tab === t.id ? '#fff' : T.sub,
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: '-apple-system,sans-serif',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Контент */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '24px', boxShadow: T.shadow }}>
          {tab === 'articles' && <ArticlesList key={articlesKey} onEdit={handleEdit} />}
          {tab === 'editor'   && <ArticleEditor articleId={editingId} onSaved={handleSaved} />}
          {tab === 'images'   && <ImageUploader />}
          {tab === 'users'    && <UsersList />}
        </div>
      </div>
    </div>
  )
}
