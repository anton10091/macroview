'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

const ENTRIES = [
  {
    id: "wb-gdp-forecast-2026",
    date: "28 февраля 2026",
    emoji: "😔",
    title: "WB срезал прогноз почти вдвое",
    tags: ["ВВП", "World Bank", "Прогноз"],
    excerpt: "Всемирный банк пересмотрел прогноз роста ВВП Таиланда на 2026 год с 2,9% до 1,6% — почти вдвое.",
    text: `Всемирный банк пересмотрел прогноз роста ВВП Таиланда на 2026 год с 2,9% до 1,6% — почти вдвое. Основные причины: слабый внутренний спрос, торможение экспорта и высокая долговая нагрузка домохозяйств.

Регулятор отметил, что структурные проблемы экономики требуют долгосрочных реформ, а не краткосрочного стимулирования. Особую обеспокоенность вызывает долг домохозяйств на уровне 88% ВВП — рекорд за 20 лет.

Для сравнения: соседние Вьетнам и Индонезия в 2026 году ожидают роста на 6.5% и 5.1% соответственно. Таиланд рискует окончательно потерять позиции как инвестиционный хаб ЮВА, если не ускорит структурные реформы.

Ключевые риски по версии World Bank: перегретый рынок потребительского кредитования, зависимость от китайского туризма и экспорта электроники, а также старение населения, которое уже сейчас снижает потенциальный рост.`,
    color: "#dc2626",
    bg: "#fef2f2",
    priority: "HIGH",
    source: "World Bank Thailand Economic Monitor",
    sourceUrl: "https://www.worldbank.org/en/country/thailand",
  },
  {
    id: "bot-rate-cut-min",
    date: "15 февраля 2026",
    emoji: "🏦",
    title: "Банк Таиланда снизил ставку до исторического минимума",
    tags: ["Ставка", "BOT", "Монетарная политика"],
    excerpt: "BOT снизил ключевую ставку до 1.00% — минимума за всю историю.",
    text: `BOT снизил ключевую ставку до 1.00% — минимума за всю историю регулятора. Решение было принято единогласно на фоне замедления экономического роста и дефляционного давления.

Бат отреагировал ослаблением: курс THB/USD опустился до 35.5 в течение дня после объявления. Фондовый рынок SET вырос на 0.8% — инвесторы восприняли смягчение позитивно.

Регулятор сигнализирует о готовности к дальнейшему снижению при необходимости. Аналитики KASIKORN Research ожидают ещё одного снижения на 25 б.п. во второй половине 2026 года — до 0.75%.

Главный вопрос: поможет ли монетарное смягчение при структурно высокой долговой нагрузке домохозяйств? Многие экономисты скептичны — спрос ограничен не стоимостью кредита, а уже накопленным долгом.`,
    color: "#15803d",
    bg: "#f0fdf4",
    priority: "HIGH",
    source: "Bank of Thailand",
    sourceUrl: "https://www.bot.or.th",
  },
  {
    id: "thailand-ev-hub",
    date: "3 февраля 2026",
    emoji: "🚗",
    title: "Таиланд становится региональным хабом EV",
    tags: ["EV", "Инвестиции", "Промышленность"],
    excerpt: "BYD, Great Wall и SAIC объявили о локализации производства в Таиланде.",
    text: `BYD, Great Wall и SAIC объявили о локализации производства в Таиланде. Правительство предоставляет налоговые льготы до 2030 года. Страна претендует на роль «Detroit Азии» в секторе электромобилей.

Общий объём заявленных инвестиций превысил $3 млрд. BOI (Board of Investment) одобрил 47 проектов в секторе EV за последние 12 месяцев — рекордный показатель.

Таиланд исторически является крупнейшим автопроизводителем ЮВА: страна выпускает около 1.5 млн автомобилей в год, преимущественно для японских брендов. Переход к EV меняет расстановку сил: японские производители теряют позиции, китайские — наращивают.

Инфраструктура зарядки пока отстаёт: по стране установлено лишь около 3,000 публичных зарядных станций. Правительство планирует довести цифру до 15,000 к 2030 году.`,
    color: "#15803d",
    bg: "#f0fdf4",
    priority: "MEDIUM",
    source: "BOI Thailand",
    sourceUrl: "https://www.boi.go.th",
  },
  {
    id: "household-debt-record",
    date: "20 января 2026",
    emoji: "💳",
    title: "Долг домохозяйств достиг рекорда за 20 лет",
    tags: ["Долг", "Макро", "Риски"],
    excerpt: "Долг домохозяйств Таиланда достиг 88% ВВП — максимума за два десятилетия.",
    text: `Долг домохозяйств Таиланда достиг 88% ВВП — максимума за два десятилетия. Это существенно ограничивает потребительский спрос и создаёт риски финансовой стабильности.

Банк Таиланда призвал коммерческие банки ужесточить кредитные стандарты, особенно в сегменте потребительского и автокредитования. Доля просроченных кредитов (NPL) выросла до 3.1% — максимума с 2017 года.

По оценкам МВФ, высокая долговая нагрузка может снижать потенциальный рост ВВП на 0.3-0.5 п.п. ежегодно. При текущей траектории Таиланд рискует войти в «долговую ловушку» — ситуацию, когда обслуживание долга съедает прирост доходов.

Для сравнения: в Южной Корее долг домохозяйств составляет около 105% ВВП, однако корейская экономика растёт быстрее и имеет более высокий уровень доходов.`,
    color: "#c2410c",
    bg: "#fff7ed",
    priority: "HIGH",
    source: "Bank of Thailand",
    sourceUrl: "https://www.bot.or.th",
  },
  {
    id: "tourism-recovery-2026",
    date: "10 января 2026",
    emoji: "✈️",
    title: "Туризм восстанавливается, но медленнее ожиданий",
    tags: ["Туризм", "Спрос", "Сервисы"],
    excerpt: "Таиланд принял 34 млн иностранных туристов в 2025 году — на 8% меньше прогноза.",
    text: `Таиланд принял 34 млн иностранных туристов в 2025 году — на 8% меньше прогноза и всё ещё ниже допандемийного рекорда в 39.8 млн (2019 год).

Основная причина: замедление китайского турпотока. Китайские туристы в 2019 году составляли около 28% от общего числа, сейчас — лишь 14%. Полного восстановления эксперты не ждут: китайцы переориентируются на внутренний туризм и альтернативные направления.

Туристический сектор обеспечивает около 12% ВВП страны — один из самых высоких показателей в мире. Это делает экономику Таиланда особенно уязвимой к внешним шокам.

Правительство запустило программу visa-free для 93 стран в попытке компенсировать отставание. Пхукет и Самуи показывают более сильную динамику за счёт европейских и российских туристов.`,
    color: "#6d28d9",
    bg: "#faf5ff",
    priority: "MEDIUM",
    source: "Tourism Authority of Thailand",
    sourceUrl: "https://www.tourismthailand.org",
  },
  {
    id: "set-index-low-2025",
    date: "28 декабря 2025",
    emoji: "📉",
    title: "SET Index завершил 2025 год на минимуме за 10 лет",
    tags: ["SET", "Фондовый рынок", "Акции"],
    excerpt: "Тайский фондовый рынок потерял 15% в 2025 году, закрывшись у отметки 1,284.",
    text: `Тайский фондовый рынок потерял 15% в 2025 году, закрывшись у отметки 1,284 — минимума за 10 лет. SET стал одним из худших рынков АСЕАН по итогам года.

Основные факторы давления: слабый экономический рост, массовый отток иностранного капитала (-$2.1 млрд по итогам года) и укрепление доллара, которое сделало тайские активы менее привлекательными.

P/E рынка опустился до 13.5x — исторически привлекательного уровня для долгосрочных инвесторов. Дивидендная доходность выросла до 4.1%, что выше доходности 10-летних гособлигаций США.

Среди аутсайдеров — банковский и девелоперский секторы. Среди лидеров — экспортёры и туристические компании, выигравшие от слабого бата.`,
    color: "#dc2626",
    bg: "#fef2f2",
    priority: "MEDIUM",
    source: "Stock Exchange of Thailand",
    sourceUrl: "https://www.set.or.th",
  },
  {
    id: "baht-weakening-2025",
    date: "15 декабря 2025",
    emoji: "💱",
    title: "Бат ослаб до 36 за доллар — двойной эффект",
    tags: ["Бат", "Валюта", "Макро"],
    excerpt: "THB торгуется у 35–36 за доллар. Для экспортёров плюс, для импортёров энергии — минус.",
    text: `THB торгуется у 35–36 за доллар — это ослабление более чем на 8% с начала 2025 года. Для экспортёров и туризма это конкурентное преимущество: тайские товары и услуги стали дешевле для иностранных покупателей.

Однако для импортёров энергии картина обратная. Таиланд импортирует около 57% электроэнергии на основе природного газа и около 80% нефти. Слабый бат напрямую увеличивает затраты.

Банк Таиланда пока воздерживается от валютных интервенций. Регулятор считает текущий курс отражением фундаментальных факторов, а не спекулятивного давления.

Исторически бат был одной из наиболее стабильных валют ЮВА. Текущее ослабление — симптом более глубокого структурного замедления экономики.`,
    color: "#b08c3a",
    bg: "#f5edda",
    priority: "MEDIUM",
    source: "Bank of Thailand",
    sourceUrl: "https://www.bot.or.th",
  },
  {
    id: "kasikorn-gdp-outlook",
    date: "5 декабря 2025",
    emoji: "🔍",
    title: "KASIKORN Research снизил прогноз ВВП до 2.1%",
    tags: ["ВВП", "KASIKORN", "Прогноз"],
    excerpt: "KASIKORN Research Center пересмотрел прогноз роста ВВП Таиланда на 2025 год вниз.",
    text: `KASIKORN Research Center пересмотрел прогноз роста ВВП Таиланда на 2025 год с 2.6% до 2.1%. Это уже третий пересмотр вниз за год — в начале 2025-го ожидалось 3.0%.

Аналитики указывают на три ключевых фактора: замедление экспорта электроники (−6% г/г), слабый внутренний спрос из-за долговой нагрузки домохозяйств, и политическую неопределённость после смены правительства.

При этом туристический сектор остаётся единственным источником позитивных сюрпризов: поступления от туризма превысили прогноз на 5%.

KASIKORN также отметил риск дефляции: индекс потребительских цен в ноябре снизился на 0.4% г/г — третий месяц подряд в отрицательной зоне. Дефляция опасна тем, что откладывает потребительские решения и ухудшает реальную долговую нагрузку.`,
    color: "#2a4a8a",
    bg: "#dde7f5",
    priority: "MEDIUM",
    source: "KASIKORN Research Center",
    sourceUrl: "https://www.kasikornresearch.com",
  },
];

function LiveTicker() {
  return (
    <div style={{ background: "#1a1612", height: 30, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes diary-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .diary-ticker { display:flex; width:max-content; animation:diary-scroll 30s linear infinite; }
        .diary-ticker:hover { animation-play-state:paused; }
      `}</style>
      <div className="diary-ticker">
        {[...TICKER, ...TICKER].map((t, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"0 20px", borderRight:"1px solid #2a2520", whiteSpace:"nowrap" }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#6a6460", letterSpacing:"0.07em", textTransform:"uppercase" }}>{t.label}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:600, color:"#d4cec8" }}>{t.value}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:t.up?"#4ade80":"#f87171" }}>{t.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ background:"#fff", borderBottom:"1px solid #e8e2d8", padding:"0 32px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow: scrolled?"0 1px 12px rgba(0,0,0,0.06)":"none", transition:"box-shadow 0.25s" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"#1a3a6a", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:900, color:"#fff" }}>M</span>
        </div>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#1a1612" }}>MacroView</span>
      </Link>
      <div style={{ display:"flex", gap:2 }}>
        {[{label:"Главная",href:"/"},{label:"Таиланд",href:"/thailand"},{label:"Страны",href:"/"},{label:"Аналитика",href:"/"}].map(({label,href})=>(
          <Link key={label} href={href} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, background:label==="Таиланд"?"#f0f4fa":"none", borderRadius:7, padding:"6px 13px", color:label==="Таиланд"?"#1a3a6a":"#9a948e", fontWeight:label==="Таиланд"?600:400, textDecoration:"none", display:"inline-block" }}>{label}</Link>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 6px #16a34a80" }} />
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e" }}>март 2026</span>
      </div>
    </nav>
  );
}

export default function DiaryEntryPage() {
  const params = useParams();
  const entry = ENTRIES.find(e => e.id === params.id);

  if (!entry) return (
    <div style={{ minHeight:"100vh", background:"#faf8f4", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:"#1a1612" }}>Запись не найдена</p>
        <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#1a3a6a" }}>← Вернуться в дневник</Link>
      </div>
    </div>
  );

  const currentIndex = ENTRIES.findIndex(e => e.id === params.id);
  const prevEntry = ENTRIES[currentIndex + 1] || null;
  const nextEntry = ENTRIES[currentIndex - 1] || null;

  return (
    <div style={{ minHeight:"100vh", background:"#faf8f4" }}>
      <LiveTicker />
      <Navbar />

      <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 32px 80px" }}>

        {/* Breadcrumbs */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:32 }}>
          <Link href="/" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>MacroView</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <Link href="/thailand" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>Таиланд</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>Дневник</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#1a1612", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{entry.title}</span>
        </div>

        {/* Метаданные */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <span style={{ fontSize:28 }}>{entry.emoji}</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#9a948e" }}>{entry.date}</span>
          {entry.priority === "HIGH" && (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:4, padding:"2px 8px" }}>HIGH PRIORITY</span>
          )}
        </div>

        {/* Заголовок */}
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,4vw,36px)", fontWeight:900, color:"#1a1612", margin:"0 0 16px", lineHeight:1.2, borderLeft:`4px solid ${entry.color}`, paddingLeft:16 }}>
          {entry.title}
        </h1>

        {/* Теги */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32 }}>
          {entry.tags.map(t => (
            <span key={t} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, background:entry.bg, color:entry.color, border:`1px solid ${entry.color}30`, borderRadius:5, padding:"3px 10px" }}>{t}</span>
          ))}
        </div>

        {/* Разделитель */}
        <div style={{ height:1, background:"#e8e2d8", marginBottom:32 }} />

        {/* Текст записи */}
        <div style={{ marginBottom:40 }}>
          {entry.text.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontFamily:"Georgia, serif", fontSize:16, color:"#2a2520", lineHeight:1.9, margin:"0 0 24px" }}>{para}</p>
          ))}
        </div>

        {/* Источник */}
        <div style={{ background:"#f5f2ee", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 18px", marginBottom:40, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.08em" }}>Источник</span>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#1a1612", margin:"4px 0 0", fontWeight:600 }}>{entry.source}</p>
          </div>
          <a href={entry.sourceUrl} target="_blank" rel="noreferrer" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#1a3a6a", textDecoration:"none" }}>
            Открыть →
          </a>
        </div>

        {/* Навигация между записями */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:32 }}>
          {prevEntry ? (
            <Link href={`/thailand/diary/${prevEntry.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 16px", cursor:"pointer" }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", margin:"0 0 6px" }}>← Предыдущая запись</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1612", margin:0, fontWeight:700, lineHeight:1.4 }}>{prevEntry.emoji} {prevEntry.title}</p>
              </div>
            </Link>
          ) : <div />}
          {nextEntry ? (
            <Link href={`/thailand/diary/${nextEntry.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 16px", cursor:"pointer", textAlign:"right" }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", margin:"0 0 6px" }}>Следующая запись →</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1612", margin:0, fontWeight:700, lineHeight:1.4 }}>{nextEntry.emoji} {nextEntry.title}</p>
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Кнопка назад */}
        <div style={{ textAlign:"center" }}>
          <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#1a3a6a", textDecoration:"none", background:"#f0f4fa", border:"1px solid #1a3a6a30", borderRadius:8, padding:"10px 24px", display:"inline-block" }}>
            ← Все записи дневника
          </Link>
        </div>

      </div>
    </div>
  );
}