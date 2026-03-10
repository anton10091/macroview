'use client'
import Link from 'next/link'
import { Navbar } from '../components/layout/Navbar'

export default function AdvisorPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#1a1612', borderBottom: '1px solid #2a2520' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🤖</div>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
            Персональный советник
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#9a948e', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Молчит пока нет сигнала. Приходит в Telegram когда что-то изменилось именно для твоего профиля.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Как работает */}
        <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 20 }}>Как работает</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { step: '01', title: 'Мониторинг 24/7', desc: 'Агент следит за всеми 20 странами ежедневно. Проверяет CHI, RESI, Cash Flow, политические события.' },
              { step: '02', title: 'Три триггера', desc: 'Уведомление приходит только при: пересечении порога индекса / смене тренда / экстраординарном событии.' },
              { step: '03', title: 'Персональный брифинг', desc: 'Не просто пуш — контекстуальное сообщение в Telegram с историческим контекстом и тремя действиями.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#fff', fontWeight: 700 }}>{step}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1612', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a6460', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Пример брифинга */}
        <div style={{ background: '#1a1612', borderRadius: 16, padding: 24, border: '1px solid #2a2520' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📱 Telegram · Пример брифинга</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#22c55e' }}>сейчас</span>
            </div>
          </div>
          <div style={{ background: '#2a2520', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 12 }}>
            <div style={{ color: '#9a948e', marginBottom: 8 }}>MacroView Советник</div>
            <div style={{ background: '#1a3a6a', borderRadius: '8px 8px 8px 2px', padding: 12, color: '#fff', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>🇬🇪 Грузия — появился сигнал</div>
              <div style={{ color: '#bfdbfe' }}>CHI вырос с 65 → 74 за последний квартал.</div>
              <div>Причина: ВВП 8.2% — рекорд. Туристов 7.1 млн.</div>
              <div style={{ color: '#bfdbfe', fontSize: 10, fontStyle: 'italic' }}>Это соответствует твоему профилю: недвижимость · $150к · горизонт 5 лет.</div>
              <div style={{ color: '#93c5fd', fontSize: 10, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 8 }}>
                📜 Последний раз похожий сигнал по Грузии был в Q2 2021 — тогда цены выросли на 28% за два года.
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 8, fontSize: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>→ Смотреть карточку Грузии</div>
                <div>→ Рассчитать доходность</div>
                <div style={{ color: '#93c5fd' }}>→ Отложить на потом</div>
              </div>
            </div>
          </div>
        </div>

        {/* Тарифы */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '2px solid #e8e2d8', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Бесплатно</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 900, color: '#1a1612', marginBottom: 16 }}>$0</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: 12, color: '#4a4540', marginBottom: 20 }}>
              {['Карточки 20 стран', 'CHI индекс', 'Аналитика и дневник', 'Макроданные'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22c55e' }}>✓</span>{f}
                </div>
              ))}
              {['Советник', 'Прогноз 10 лет', 'Калькуляторы', 'Сравнения'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                  <span>—</span>{f}
                </div>
              ))}
            </div>
            <button style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, border: '1px solid #e8e2d8', borderRadius: 12, padding: '10px 0', color: '#4a4540', background: 'none', cursor: 'default' }}>
              Текущий план
            </button>
          </div>

          <div style={{ background: '#1a3a6a', border: '2px solid #1a3a6a', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pro · Скоро</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
              $X<span style={{ fontSize: 16, fontWeight: 400, color: '#93c5fd' }}>/мес</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: 12, color: '#bfdbfe', marginBottom: 20 }}>
              {['Всё из бесплатного', 'Советник в Telegram', 'Прогноз 10 лет', 'Калькуляторы', 'Сравнительные экраны', 'Карта капитала'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#4ade80' }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, background: '#fff', color: '#1a3a6a', borderRadius: 12, padding: '10px 0', border: 'none', cursor: 'pointer' }}>
              Уведомить о запуске
            </button>
          </div>
        </div>

        {/* Telegram */}
        <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1612', marginBottom: 4 }}>Подключить Telegram</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a6460' }}>Напиши боту одну фразу — профиль создастся автоматически</div>
          </div>
          <a href="https://t.me/macroview_bot" target="_blank" rel="noopener noreferrer" style={{
            fontFamily: 'monospace', fontSize: 13, background: '#2563eb', color: '#fff',
            borderRadius: 12, padding: '10px 20px', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Открыть бот ↗
          </a>
        </div>

      </div>
    </div>
  )
}
