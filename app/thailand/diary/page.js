'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TICKER = [
  { label: "BAHT/USD", value: "33.82", delta: "+0.3%", up: true },
  { label: "SET Index", value: "1,284", delta: "−0.8%", up: false },
  { label: "Ставка BOT", value: "1.75%", delta: "↓", up: false },
  { label: "Инфляция", value: "0.8%", delta: "−0.2%", up: false },
  { label: "Brent", value: "$71.4", delta: "−1.2%", up: false },
  { label: "Золото", value: "$2,910", delta: "+0.6%", up: true },
  { label: "EUR/USD", value: "1.081", delta: "+0.4%", up: true },
  { label: "ВВП 2026п", value: "1.6%", delta: "↓WB", up: false },
];

const KPI = [
  { emoji: "📉", label: "Прогноз ВВП 2026", value: "1.6%",  sub: "World Bank · фев 2026",          valueColor: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { emoji: "🏦", label: "Ставка ЦБ",        value: "1.00%", sub: "снижена до минимума · фев 2026", valueColor: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  { emoji: "💳", label: "Долг домохозяйств", value: "~88%", sub: "% ВВП · рекорд 20 лет",          valueColor: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  { emoji: "🌡️", label: "Инфляция 2026п",  value: "−0.7%", sub: "ниже нуля · янв 2026",           valueColor: "#6d28d9", bg: "#faf5ff", border: "#ddd6fe" },
];

export const ENTRIES = [
  {
    id: "wb-gdp-forecast-2026",
    date: "28 февраля 2026",
    emoji: "😔",
    title: "WB срезал прогноз почти вдвое",
    tags: ["ВВП", "World Bank", "Прогноз"],
    excerpt: "Всемирный банк пересмотрел прогноз роста ВВП Таиланда на 2026 год с 2,9% до 1,6% — почти вдвое.",
    text: "Всемирный банк пересмотрел прогноз роста ВВП Таиланда на 2026 год с 2,9% до 1,6% — почти вдвое. Основные причины: слабый внутренний спрос, торможение экспорта и высокая долговая нагрузка домохозяйств. Регулятор отметил, что структурные проблемы экономики требуют долгосрочных реформ, а не краткосрочного стимулирования. Особую обеспокоенность вызывает долг домохозяйств на уровне 88% ВВП — рекорд за 20 лет.",
    color: "#dc2626",
    bg: "#fef2f2",
    priority: "HIGH",
  },
  {
    id: "bot-rate-cut-min",
    date: "15 февраля 2026",
    emoji: "🏦",
    title: "Банк Таиланда снизил ставку до исторического минимума",
    tags: ["Ставка", "BOT", "Монетарная политика"],
    excerpt: "BOT снизил ключевую ставку до 1.00% — минимума за всю историю.",
    text: "BOT снизил ключевую ставку до 1.00% — минимума за всю историю. Регулятор сигнализирует о готовности к дальнейшему смягчению при необходимости. Бат отреагировал ослаблением до 35.2 за доллар. Решение было принято единогласно на фоне замедления экономического роста и дефляционного давления. Аналитики ожидают ещё одного снижения во второй половине 2026 года.",
    color: "#15803d",
    bg: "#f0fdf4",
    priority: "HIGH",
  },
  {
    id: "thailand-ev-hub",
    date: "3 февраля 2026",
    emoji: "🚗",
    title: "Таиланд становится региональным хабом EV",
    tags: ["EV", "Инвестиции", "Промышленность"],
    excerpt: "BYD, Great Wall и SAIC объявили о локализации производства в Таиланде.",
    text: "BYD, Great Wall и SAIC объявили о локализации производства в Таиланде. Правительство предоставляет налоговые льготы до 2030 года. Страна претендует на роль «Detroit Азии» в секторе электромобилей. Общий объём заявленных инвестиций превысил $3 млрд. BOI одобрил 47 проектов в секторе EV за последние 12 месяцев.",
    color: "#15803d",
    bg: "#f0fdf4",
    priority: "MEDIUM",
  },
  {
    id: "household-debt-record",
    date: "20 января 2026",
    emoji: "💳",
    title: "Долг домохозяйств достиг рекорда за 20 лет",
    tags: ["Долг", "Макро", "Риски"],
    excerpt: "Долг домохозяйств Таиланда достиг 88% ВВП — максимума за два десятилетия.",
    text: "Долг домохозяйств Таиланда достиг 88% ВВП — максимума за два десятилетия. Это существенно ограничивает потребительский спрос и создаёт риски финансовой стабильности. Банк Таиланда призвал коммерческие банки ужесточить кредитные стандарты. По оценкам МВФ, высокая долговая нагрузка может снизить потенциальный рост ВВП на 0.3-0.5 п.п. ежегодно.",
    color: "#c2410c",
    bg: "#fff7ed",
    priority: "HIGH",
  },
  {
    id: "tourism-recovery-2026",
    date: "10 января 2026",
    emoji: "✈️",
    title: "Туризм восстанавливается, но медленнее ожиданий",
    tags: ["Туризм", "Спрос", "Сервисы"],
    excerpt: "Таиланд принял 34 млн иностранных туристов в 2025 году — на 8% меньше прогноза.",
    text: "Таиланд принял 34 млн иностранных туристов в 2025 году — на 8% меньше прогноза. Основная причина: замедление китайского турпотока, который так и не восстановился до допандемийных уровней. Туристический сектор обеспечивает около 12% ВВП страны. Правительство запустило программу visa-free для 93 стран в попытке компенсировать отставание.",
    color: "#6d28d9",
    bg: "#faf5ff",
    priority: "MEDIUM",
  },
  {
    id: "set-index-low-2025",
    date: "28 декабря 2025",
    emoji: "📉",
    title: "SET Index завершил 2025 год на минимуме за 10 лет",
    tags: ["SET", "Фондовый рынок", "Акции"],
    excerpt: "Тайский фондовый рынок потерял 15% в 2025 году, закрывшись у отметки 1,284.",
    text: "Тайский фондовый рынок потерял 15% в 2025 году, закрывшись у отметки 1,284 — минимума за 10 лет. Основные факторы давления: слабый экономический рост, отток иностранного капитала и укрепление доллара. P/E рынка опустился до 13.5x — исторически привлекательного уровня для долгосрочных инвесторов. Дивидендная доходность выросла до 4.1%.",
    color: "#dc2626",
    bg: "#fef2f2",
    priority: "MEDIUM",
  },
  {
    id: "baht-weakening-2025",
    date: "15 декабря 2025",
    emoji: "💱",
    title: "Бат ослаб до 36 за доллар — двойной эффект",
    tags: ["Бат", "Валюта", "Макро"],
    excerpt: "THB торгуется у 35–36 за доллар. Для экспортёров плюс, для импортёров энергии — минус.",
    text: "THB торгуется у 35–36 за доллар — это двузначное ослабление с начала года. Для экспортёров и туризма это конкурентное преимущество. Однако для импортёров энергии — существенный минус: Таиланд импортирует около 57% электроэнергии на основе природного газа. Банк Таиланда пока воздерживается от валютных интервенций.",
    color: "#b08c3a",
    bg: "#f5edda",
    priority: "MEDIUM",
  },
  {
    id: "kasikorn-gdp-outlook",
    date: "5 декабря 2025",
    emoji: "🔍",
    title: "KASIKORN Research снизил прогноз ВВП до 2.1%",
    tags: ["ВВП", "KASIKORN", "Прогноз"],
    excerpt: "KASIKORN Research Center пересмотрел прогноз роста ВВП Таиланда на 2025 год вниз.",
    text: "KASIKORN Research Center пересмотрел прогноз роста ВВП Таиланда на 2025 год с 2.6% до 2.1%. Аналитики указывают на три ключевых фактора: замедление экспорта электроники, слабый внутренний спрос и политическую неопределённость. При этом туристический сектор остаётся единственным источником позитивных сюрпризов.",
    color: "#2a4a8a",
    bg: "#dde7f5",
    priority: "MEDIUM",
  },
];

const PER_PAGE = 5;

function LiveTicker() {
  return (
    <div style={{ background: "#1a1612", height: 30, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes diary-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .diary-ticker { display: flex; width: max-content; animation: diary-scroll 30s linear infinite; }
        .diary-ticker:hover { animation-play-state: paused; }
      `}</style>
      <div className="diary-ticker">
        {[...TICKER, ...TICKER].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 20px", borderRight: "1px solid #2a2520", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#6a6460", letterSpacing: "0.07em", textTransform: "uppercase" }}>{t.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: "#d4cec8" }}>{t.value}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: t.up ? "#4ade80" : "#f87171" }}>{t.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e8e2d8",
      padding: "0 32px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 0.25s",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a3a6a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 900, color: "#fff" }}>M</span>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#1a1612", letterSpacing: "-0.02em" }}>MacroView</span>
      </Link>
      <div style={{ display: "flex", gap: 2 }}>
        {[
          { label: "Главная", href: "/" },
          { label: "Таиланд", href: "/thailand" },
          { label: "Страны", href: "/" },
          { label: "Аналитика", href: "/" },
        ].map(({ label, href }) => (
          <Link key={label} href={href} style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            background: label === "Таиланд" ? "#f0f4fa" : "none",
            borderRadius: 7, padding: "6px 13px",
            color: label === "Таиланд" ? "#1a3a6a" : "#9a948e",
            fontWeight: label === "Таиланд" ? 600 : 400,
            textDecoration: "none", display: "inline-block",
          }}>{label}</Link>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 6px #16a34a80" }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#9a948e" }}>март 2026</span>
      </div>
    </nav>
  );
}

function KpiCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: hovered ? item.bg : "#fff",
      border: `1px solid ${hovered ? item.border : "#e8e2d8"}`,
      borderRadius: 12, padding: "16px 18px", transition: "all 0.2s",
      transform: hovered ? "translateY(-2px)" : "none",
      boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.07)" : "0 1px 3px rgba(0,0,0,0.04)",
      cursor: "default",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{item.emoji}</span>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.valueColor, opacity: 0.6, marginTop: 5 }} />
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: item.valueColor, lineHeight: 1, marginBottom: 6 }}>{item.value}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#4a4540", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{item.label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#9a948e" }}>{item.sub}</div>
    </div>
  );
}

function DiaryEntry({ entry }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/thailand/diary/${entry.id}`} style={{ textDecoration: "none" }}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
        background: hovered ? entry.bg : "#fff",
        border: `1px solid ${hovered ? entry.color + "40" : "#e8e2d8"}`,
        borderLeft: `3px solid ${entry.color}`,
        borderRadius: 12, padding: "24px 28px", marginBottom: 16,
        transition: "all 0.2s",
        transform: hovered ? "translateX(4px)" : "none",
        cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>{entry.emoji}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#9a948e" }}>{entry.date}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {entry.tags.map(t => (
              <span key={t} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, background: "#f5f2ee", color: "#6a6460", borderRadius: 4, padding: "2px 7px" }}>{t}</span>
            ))}
          </div>
          {entry.priority === "HIGH" && (
            <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 7px" }}>HIGH</span>
          )}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#1a1612", margin: "0 0 10px", lineHeight: 1.3 }}>{entry.title}</h3>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#6a6460", lineHeight: 1.8, margin: "0 0 12px" }}>{entry.excerpt}</p>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: entry.color }}>Читать запись →</span>
      </div>
    </Link>
  );
}

export default function ThailandDiary() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(ENTRIES.length / PER_PAGE);
  const paginated = ENTRIES.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f4" }}>
      <LiveTicker />
      <Navbar />

      {/* Hero */}
      <div style={{ background: "#faf8f4", borderBottom: "1px solid #e8e2d8", padding: "40px 32px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #1a3a6a, #1a3a6a40, transparent)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <Link href="/" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#6a6460", textTransform: "uppercase", letterSpacing: "0.07em", textDecoration: "none" }}>MacroView</Link>
            <span style={{ color: "#c8c2b8", fontSize: 10 }}>›</span>
            <Link href="/thailand" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#6a6460", textTransform: "uppercase", letterSpacing: "0.07em", textDecoration: "none" }}>Таиланд</Link>
            <span style={{ color: "#c8c2b8", fontSize: 10 }}>›</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#1a1612", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Дневник Таиланда</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3.8vw, 44px)", fontWeight: 900, color: "#1a1612", margin: "0 0 14px", lineHeight: 1.15 }}>
                Таиланд <span style={{ color: "#1a3a6a" }}>пишет</span> о себе сам
              </h1>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#6a6460", margin: "0 0 22px", lineHeight: 1.85 }}>
                ВВП, ставки, долги и кризисы — скучно звучит. Но не когда об этом говорит сама страна. Таиланд ведёт дневник: пишет о туристах, тарифах и больших переменах — без формул и без воды.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#9a948e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Ключевые темы <span style={{ color: "#c8c2b8" }}>(янв–фев 2026)</span>
                </span>
                <div style={{ flex: 1, height: 1, background: "#e8e2d8" }} />
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {[
                  { label: "⚠️ Замедление роста",  color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
                  { label: "📊 Долговая нагрузка",  color: "#c2410c", bg: "#fff7ed", border: "#fdba74" },
                  { label: "🚗 EV-трансформация",   color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
                  { label: "📉 Слабый спрос",       color: "#6d28d9", bg: "#faf5ff", border: "#c4b5fd" },
                ].map(({ label, color, bg, border }) => (
                  <span key={label} style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color,
                    background: bg, border: `1px solid ${border}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 6, padding: "5px 10px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>{label}</span>
                ))}
              </div>
            </div>

            {/* Последняя запись */}
            <div style={{ background: "#fff", border: "1px solid #e8e2d8", borderRadius: 14, padding: "18px 20px", minWidth: 220, maxWidth: 260, flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#9a948e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Последняя запись</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>😔</div>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#9a948e", marginBottom: 4 }}>28 февраля 2026</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, color: "#1a1612", lineHeight: 1.4 }}>WB срезал прогноз почти вдвое</div>
                </div>
              </div>
              <div style={{ height: 1, background: "#f0ece6", marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {["ВВП", "World Bank", "Прогноз"].map(t => (
                  <span key={t} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, background: "#f5f2ee", color: "#6a6460", borderRadius: 4, padding: "2px 7px" }}>{t}</span>
                ))}
              </div>
              <Link href="/thailand/diary/wb-gdp-forecast-2026" style={{ display: "block", width: "100%", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, background: "#1a3a6a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", cursor: "pointer", letterSpacing: "0.03em", textAlign: "center", textDecoration: "none" }}>
                Читать запись →
              </Link>
            </div>
          </div>

          {/* KPI */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
            {KPI.map((item, i) => <KpiCard key={i} item={item} />)}
          </div>
        </div>
      </div>

      {/* Записи с пагинацией */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#9a948e", textTransform: "uppercase", letterSpacing: "0.08em" }}>Записи дневника</span>
          <div style={{ flex: 1, height: 1, background: "#e8e2d8" }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#9a948e" }}>{ENTRIES.length} записей</span>
        </div>

        {paginated.map((entry) => <DiaryEntry key={entry.id} entry={entry} />)}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                background: "none", border: "1px solid #e8e2d8", borderRadius: 6,
                padding: "7px 14px", cursor: page === 1 ? "default" : "pointer",
                color: page === 1 ? "#c8c2b8" : "#4a4540",
              }}
            >← Назад</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: p === page ? 700 : 400,
                  background: p === page ? "#1a3a6a" : "#fff",
                  border: `1px solid ${p === page ? "#1a3a6a" : "#e8e2d8"}`,
                  borderRadius: 6, padding: "7px 14px", cursor: "pointer",
                  color: p === page ? "#fff" : "#4a4540",
                  minWidth: 38,
                }}
              >{p}</button>
            ))}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                background: "none", border: "1px solid #e8e2d8", borderRadius: 6,
                padding: "7px 14px", cursor: page === totalPages ? "default" : "pointer",
                color: page === totalPages ? "#c8c2b8" : "#4a4540",
              }}
            >Вперёд →</button>
          </div>
        )}
      </div>
    </div>
  );
}