'use client';
import Link from 'next/link';
import Nav from './components/Nav';

const countries = [
  {
    code: 'thailand',
    name: 'Таиланд',
    flag: '🇹🇭',
    region: 'ЮВА',
    gdp: '+2.6%',
    rating: 'Нейтрально',
    ratingColor: '#b08c3a',
    tags: ['Недвижимость', 'Туризм', 'Энергетика'],
    summary: 'Восстановление после COVID, рост туризма. Слабый бат, высокая зависимость от импортного газа.',
    active: true,
  },
  {
    code: 'usa',
    name: 'США',
    flag: '🇺🇸',
    region: 'Северная Америка',
    gdp: '+2.8%',
    rating: 'Осторожно',
    ratingColor: '#c8622a',
    tags: ['Фондовый рынок', 'Ставки ФРС'],
    summary: 'Высокие ставки давят на недвижимость. Рынок труда устойчив, инфляция снижается.',
    active: false,
  },
  {
    code: 'uae',
    name: 'ОАЭ / Дубай',
    flag: '🇦🇪',
    region: 'Ближний Восток',
    gdp: '+4.0%',
    rating: 'Позитивно',
    ratingColor: '#2a7a4a',
    tags: ['Недвижимость', 'Капитал'],
    summary: 'Бум недвижимости продолжается. Приток капитала и налоговые льготы привлекают инвесторов.',
    active: false,
  },
  {
    code: 'china',
    name: 'Китай',
    flag: '🇨🇳',
    region: 'Азия',
    gdp: '+4.9%',
    rating: 'Осторожно',
    ratingColor: '#c8622a',
    tags: ['Недвижимость', 'Дефляция'],
    summary: 'Кризис в секторе недвижимости. Дефляционное давление, слабый внутренний спрос.',
    active: false,
  },
];

export default function Home() {
  return (
    <div style={{ background: '#f5f2ee', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 40px 60px' }}>

        <div style={{ marginBottom: 56, paddingTop: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f5e8df', border: '1px solid rgba(200,98,42,0.3)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2a7a4a' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#c8622a', letterSpacing: '0.1em' }}>
              МАКРО · НЕДВИЖИМОСТЬ · ФОНДОВЫЙ РЫНОК
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
            color: '#1a1612', lineHeight: 1.2, margin: '0 0 16px',
          }}>
            Глобальный макроанализ<br />
            <span style={{ color: '#c8622a' }}>для инвесторов</span>
          </h1>
          <p style={{ color: '#4a4540', fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
            Страновой анализ через призму макроэкономики: ВВП, инфляция, ставки,
            рынок недвижимости и фондовый рынок в одном месте.
          </p>
        </div>

        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', letterSpacing: '0.1em', margin: '0 0 20px', textTransform: 'uppercase' }}>
          Страны — {countries.length} / более в разработке
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {countries.map((c) => (
            <div key={c.code} style={{
              background: '#ffffff', borderRadius: 14,
              border: `1px solid ${c.active ? '#e8e2d9' : '#f0ebe3'}`,
              padding: '28px 28px 24px',
              opacity: c.active ? 1 : 0.55,
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              {!c.active && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: '#e8e2d9', borderRadius: 4,
                  padding: '2px 8px', fontFamily: 'monospace',
                  fontSize: 9, color: '#9a948e', letterSpacing: '0.08em',
                }}>СКОРО</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{c.flag}</span>
                  <div>
                    <h3 style={{ fontSize: 18, color: '#1a1612', margin: '0 0 2px' }}>{c.name}</h3>
                    <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', margin: 0 }}>{c.region}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 4px' }}>ВВП 2024</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#2a7a4a', margin: 0 }}>{c.gdp}</p>
                </div>
              </div>

              <p style={{ color: '#4a4540', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>{c.summary}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.tags.map(t => (
                    <span key={t} style={{
                      background: '#dde7f5', color: '#2a4a8a',
                      border: '1px solid rgba(42,74,138,0.2)',
                      borderRadius: 4, padding: '2px 8px',
                      fontFamily: 'monospace', fontSize: 10,
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{
                  background: `${c.ratingColor}15`,
                  border: `1px solid ${c.ratingColor}40`,
                  borderRadius: 6, padding: '4px 10px',
                  fontFamily: 'monospace', fontSize: 10, color: c.ratingColor,
                }}>{c.rating}</div>
              </div>

              {c.active && (
                <Link href={`/${c.code}`} style={{
                  display: 'block', marginTop: 16, paddingTop: 16,
                  borderTop: '1px solid #f0ebe3',
                  fontFamily: 'monospace', fontSize: 11,
                  color: '#c8622a', textDecoration: 'none',
                }}>
                  Открыть анализ →
                </Link>
              )}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 40, padding: '16px 20px',
          background: '#f5edda', border: '1px solid rgba(176,140,58,0.3)', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>📌</span>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a4540', margin: 0, lineHeight: 1.6 }}>
            Данные носят аналитический характер и не являются инвестиционной рекомендацией.
          </p>
        </div>
      </div>
    </div>
  );
}