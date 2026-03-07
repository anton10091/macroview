'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function calcMacroScore(gdp, inflation, rate) {
  let score = 0;
  if (gdp > 4) score += 5;
  else if (gdp > 2) score += 3;
  else if (gdp > 0) score += 2;
  else score += 1;
  if (inflation >= 1 && inflation <= 3) score += 5;
  else if (inflation > 0 && inflation < 1) score += 4;
  else if (inflation >= 3 && inflation <= 5) score += 3;
  else score += 1;
  const realRate = rate - inflation;
  if (realRate > 0 && realRate < 3) score += 5;
  else if (realRate >= 3) score += 3;
  else score += 2;
  return score / 15;
}

function calcRealEstateScore(y, pg) {
  let score = 0;
  if (y >= 6) score += 5;
  else if (y >= 4) score += 3;
  else score += 1;
  if (pg > 2 && pg < 10) score += 5;
  else if (pg >= 10) score += 2;
  else score += 3;
  return score / 10;
}

function calcEquityScore(pe, div, idx) {
  let score = 0;
  if (pe < 12) score += 5;
  else if (pe < 16) score += 4;
  else if (pe < 20) score += 3;
  else score += 1;
  if (div >= 4) score += 5;
  else if (div >= 3) score += 4;
  else if (div >= 2) score += 3;
  else score += 1;
  if (idx > 5) score += 5;
  else if (idx > 0) score += 3;
  else if (idx > -10) score += 2;
  else score += 1;
  return score / 15;
}

function calcRating(macro, re, eq) {
  const w = macro * 0.30 + re * 0.35 + eq * 0.35;
  if (w >= 0.65) return { label: 'Позитивно', color: '#2a7a4a', bg: '#dff0e8' };
  if (w >= 0.40) return { label: 'Нейтрально', color: '#b08c3a', bg: '#f5edda' };
  return { label: 'Осторожно', color: '#c8622a', bg: '#f5e8df' };
}

const STATIC = { rate: 2.50, reYield: 5.0, priceGrowth: 4.0, pe: 15, div: 3.5, idxChange: -4.5 };

const energyData = [
  { y: '2018', twh: 187.6 }, { y: '2019', twh: 190.1 }, { y: '2020', twh: 177.4 },
  { y: '2021', twh: 181.0 }, { y: '2022', twh: 186.5 }, { y: '2023', twh: 213.0 }, { y: '2024', twh: 225.0 },
];
const propData = [
  { y: '2019', idx: 100 }, { y: '2020', idx: 97 }, { y: '2021', idx: 99 },
  { y: '2022', idx: 103 }, { y: '2023', idx: 108 }, { y: '2024', idx: 112 },
];
const setData = [
  { y: '2018', idx: 1563 }, { y: '2019', idx: 1580 }, { y: '2020', idx: 1299 },
  { y: '2021', idx: 1658 }, { y: '2022', idx: 1669 }, { y: '2023', idx: 1416 }, { y: '2024', idx: 1482 },
];
const fuelMix = [
  { name: 'Природный газ', value: 57, color: '#2a4a8a' },
  { name: 'Уголь/лигнит', value: 21, color: '#c8622a' },
  { name: 'ВИЭ + ГЭС', value: 20, color: '#2a7a4a' },
  { name: 'Прочее', value: 2, color: '#9a948e' },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e2d9', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const Kpi = ({ label, value, unit, delta, deltaPos, color }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8e2d9', padding: '18px 20px', borderTop: `3px solid ${color}` }}>
    <p style={{ color: '#9a948e', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ color: '#1a1612', fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>
      {value}<span style={{ fontSize: 12, color: '#9a948e', fontFamily: 'monospace', marginLeft: 4 }}>{unit}</span>
    </p>
    {delta && <p style={{ fontSize: 11, fontFamily: 'monospace', color: deltaPos ? '#2a7a4a' : '#c8622a', margin: 0 }}>{delta}</p>}
  </div>
);

const RatingBar = ({ label, score, color }) => {
  const pct = Math.round(score * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#4a4540' }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{pct}/100</span>
      </div>
      <div style={{ background: '#f0ebe3', borderRadius: 4, height: 7 }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4 }} />
      </div>
    </div>
  );
};

const RatingBadge = ({ rating }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          background: rating.bg, color: rating.color,
          border: `1px solid ${rating.color}40`,
          borderRadius: 6, padding: '4px 10px',
          fontFamily: 'monospace', fontSize: 11,
          cursor: 'help', display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        {rating.label} <span style={{ fontSize: 10, opacity: 0.6 }}>ⓘ</span>
      </div>
      {show && (
        <div style={{
          position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: '#1a1612', color: '#f5f2ee',
          borderRadius: 8, padding: '12px 16px', fontSize: 12,
          fontFamily: 'monospace', width: 260, lineHeight: 1.6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#fff' }}>Рейтинг инвест. привлекательности</p>
          <p style={{ margin: '0 0 4px', color: '#ccc' }}>Считается автоматически:</p>
          <p style={{ margin: '0 0 2px', color: '#aaa' }}>• Макро (ВВП, инфляция, ставка) — 30%</p>
          <p style={{ margin: '0 0 2px', color: '#aaa' }}>• Недвижимость (доходность, цены) — 35%</p>
          <p style={{ margin: '0 0 8px', color: '#aaa' }}>• Фондовый рынок (P/E, дивиденды) — 35%</p>
          <p style={{ margin: 0, color: rating.color, fontWeight: 700 }}>Итог: {rating.label}</p>
        </div>
      )}
    </div>
  );
};

export default function ThailandPage() {
  const [tab, setTab] = useState('macro');
  const [macroData, setMacroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [latestGdp, setLatestGdp] = useState(2.6);
  const [latestInflation, setLatestInflation] = useState(0.4);
  const [scores, setScores] = useState({ macro: 0, re: 0, eq: 0 });
  const [rating, setRating] = useState({ label: '...', color: '#9a948e', bg: '#f0ebe3' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gdpRes, inflRes] = await Promise.all([
          fetch('https://api.worldbank.org/v2/country/TH/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=8'),
          fetch('https://api.worldbank.org/v2/country/TH/indicator/FP.CPI.TOTL.ZG?format=json&mrv=8'),
        ]);
        const [gdpJson, inflJson] = await Promise.all([gdpRes.json(), inflRes.json()]);
        const gdpMap = {};
        gdpJson[1]?.forEach(d => { if (d.value !== null) gdpMap[d.date] = parseFloat(d.value.toFixed(1)); });
        const inflMap = {};
        inflJson[1]?.forEach(d => { if (d.value !== null) inflMap[d.date] = parseFloat(d.value.toFixed(1)); });
        const years = [...new Set([...Object.keys(gdpMap), ...Object.keys(inflMap)])].sort();
        setMacroData(years.map(y => ({ y, gdp: gdpMap[y] ?? null, inflation: inflMap[y] ?? null })));
        const gdp = gdpJson[1]?.find(d => d.value !== null)?.value ?? 2.6;
        const infl = inflJson[1]?.find(d => d.value !== null)?.value ?? 0.4;
        setLatestGdp(parseFloat(gdp.toFixed(1)));
        setLatestInflation(parseFloat(infl.toFixed(1)));
        const ms = calcMacroScore(gdp, infl, STATIC.rate);
        const rs = calcRealEstateScore(STATIC.reYield, STATIC.priceGrowth);
        const es = calcEquityScore(STATIC.pe, STATIC.div, STATIC.idxChange);
        setScores({ macro: ms, re: rs, eq: es });
        setRating(calcRating(ms, rs, es));
        setLastUpdated(new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));
        setIsNew(true);
        setTimeout(() => setIsNew(false), 5000);
      } catch {
        const fallback = [
          { y: '2018', gdp: 4.2, inflation: 1.1 }, { y: '2019', gdp: 2.2, inflation: 0.7 },
          { y: '2020', gdp: -6.1, inflation: -0.8 }, { y: '2021', gdp: 1.5, inflation: 1.2 },
          { y: '2022', gdp: 2.6, inflation: 6.1 }, { y: '2023', gdp: 1.9, inflation: 1.2 },
          { y: '2024', gdp: 2.6, inflation: 0.4 },
        ];
        setMacroData(fallback);
        const ms = calcMacroScore(2.6, 0.4, STATIC.rate);
        const rs = calcRealEstateScore(STATIC.reYield, STATIC.priceGrowth);
        const es = calcEquityScore(STATIC.pe, STATIC.div, STATIC.idxChange);
        setScores({ macro: ms, re: rs, eq: es });
        setRating(calcRating(ms, rs, es));
        setLastUpdated('нет данных');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'macro', label: 'Макро' },
    { id: 'realestate', label: 'Недвижимость' },
    { id: 'equity', label: 'Фондовый рынок' },
    { id: 'energy', label: 'Энергетика' },
    { id: 'rating', label: '★ Рейтинг' },
    { id: 'notes', label: 'Заметки' },
    { id: 'diary', label: '📖 Дневник Таиланда', link: '/thailand/diary' },
  ];

  return (
    <div style={{ background: '#f5f2ee', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <Nav />

      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', marginTop: 56 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 40px 24px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <span style={{ fontSize: 52 }}>🇹🇭</span>
              <h1 style={{ fontSize: 32, color: '#1a1612', margin: 0 }}>Таиланд</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e' }}>
                Регион: <span style={{ color: '#4a4540' }}>Юго-Восточная Азия</span>
              </span>
              <span style={{ color: '#e8e2d9' }}>·</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e' }}>Рейтинг:</span>
              {!loading && <RatingBadge rating={rating} />}
              <span style={{ color: '#e8e2d9' }}>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isNew ? '#2a7a4a' : '#9a948e',
                  boxShadow: isNew ? '0 0 6px #2a7a4a' : 'none',
                  transition: 'all 0.5s',
                }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: isNew ? '#2a7a4a' : '#9a948e', transition: 'color 0.5s' }}>
                  {loading ? 'Загрузка...' : isNew ? `Обновлено ${lastUpdated}` : `Данные от ${lastUpdated}`}
                </span>
              </div>
            </div>

            {!loading && (
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'Макро', score: scores.macro, color: '#c8622a' },
                  { label: 'Недвижимость', score: scores.re, color: '#2a7a4a' },
                  { label: 'Акции', score: scores.eq, color: '#2a4a8a' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: '#f5f2ee', border: '1px solid #e8e2d9',
                    borderRadius: 8, padding: '8px 16px', textAlign: 'center', minWidth: 80,
                  }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{Math.round(s.score * 100)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Табы */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {tabs.map(t => t.link ? (
              <Link key={t.id} href={t.link} style={{
                background: '#1a3a6a', color: '#fff',
                border: '1px solid #1a3a6a',
                borderRadius: 6, padding: '7px 16px',
                fontFamily: 'monospace', fontSize: 12,
                textDecoration: 'none', display: 'inline-block',
                transition: 'opacity 0.15s',
              }}>{t.label}</Link>
            ) : (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? '#c8622a' : 'transparent',
                color: tab === t.id ? '#fff' : '#9a948e',
                border: `1px solid ${tab === t.id ? '#c8622a' : '#e8e2d9'}`,
                borderRadius: 6, padding: '7px 16px', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 12, transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 40px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9a948e', fontFamily: 'monospace', fontSize: 13 }}>
            Загрузка данных из World Bank API...
          </div>
        )}

        {!loading && tab === 'macro' && (
          <div>
            <p style={{ color: '#c8622a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Макроэкономика</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>ВВП, инфляция и денежно-кредитная политика</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="ВВП рост 2024" value={`+${latestGdp}`} unit="%" delta="World Bank API" deltaPos color="#2a7a4a" />
              <Kpi label="Инфляция 2024" value={latestInflation} unit="%" delta="World Bank API" deltaPos={latestInflation < 3} color="#c8622a" />
              <Kpi label="Ключевая ставка" value="2.50" unit="%" delta="Банк Таиланда" color="#2a4a8a" />
              <Kpi label="Безработица" value="1.0" unit="%" delta="Исторически низкая" deltaPos color="#2a7a4a" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>ВВП (% изм. г/г) · World Bank</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={macroData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                    <XAxis dataKey="y" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="gdp" name="ВВП %" fill="#2a7a4a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>Инфляция (% г/г) · World Bank</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={macroData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                    <XAxis dataKey="y" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} />
                    <Line dataKey="inflation" name="Инфляция %" stroke="#c8622a" strokeWidth={2.5} dot={{ r: 3, fill: '#c8622a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: '#f5e8df', border: '1px solid rgba(200,98,42,0.25)', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#c8622a', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Аналитический вывод · Макро</p>
              <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Таиланд демонстрирует умеренный рост при практически нулевой инфляции. Банк Таиланда удерживает ставку на уровне 2.5%. Ключевые риски: замедление китайского спроса и зависимость от импортного газа.
              </p>
            </div>
          </div>
        )}

        {!loading && tab === 'realestate' && (
          <div>
            <p style={{ color: '#2a7a4a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Недвижимость</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>Цены, доходность и ключевые рынки</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="Индекс цен 2024" value="112" unit="(2019=100)" delta="▲ +12% с 2019" deltaPos color="#2a7a4a" />
              <Kpi label="Аренда Бангкок" value="~600" unit="$/мес" delta="1-bed кондо центр" color="#2a4a8a" />
              <Kpi label="Gross Yield" value="4–6" unit="% г." delta="Кондо" color="#2a7a4a" />
              <Kpi label="Квота иностр." value="49" unit="%" delta="Макс. доля в кондо" color="#b08c3a" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 28 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>Индекс цен (2019 = 100)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={propData}>
                    <defs>
                      <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2a7a4a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2a7a4a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                    <XAxis dataKey="y" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[90, 120]} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} />
                    <Area dataKey="idx" name="Индекс" stroke="#2a7a4a" strokeWidth={2.5} fill="url(#propGrad)" dot={{ r: 3, fill: '#2a7a4a' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>Ключевые рынки</p>
                {[
                  { city: 'Бангкок', type: 'Кондо', yield: '4.5%', trend: '→' },
                  { city: 'Паттайя', type: 'Кондо', yield: '5.5%', trend: '▲' },
                  { city: 'Пхукет', type: 'Вилла', yield: '6.0%', trend: '▲▲' },
                  { city: 'Чиангмай', type: 'Кондо', yield: '4.0%', trend: '→' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f0ebe3' : 'none' }}>
                    <div>
                      <p style={{ fontSize: 14, color: '#1a1612', margin: '0 0 2px' }}>{r.city}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', margin: 0 }}>{r.type}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#2a7a4a', margin: '0 0 2px' }}>{r.yield}</p>
                      <p style={{ fontSize: 12, color: '#2a7a4a', margin: 0 }}>{r.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#dff0e8', border: '1px solid rgba(42,122,74,0.25)', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a7a4a', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Аналитический вывод · Недвижимость</p>
              <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Пхукет и Паттайя остаются наиболее привлекательными: gross yield 5–6% при растущем турпотоке. Иностранцы не могут владеть землёй, только кондо (до 49% в здании).
              </p>
            </div>
          </div>
        )}

        {!loading && tab === 'equity' && (
          <div>
            <p style={{ color: '#2a4a8a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Фондовый рынок</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>SET Index и ключевые секторы</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="SET Index 2024" value="1 482" unit="" delta="▼ -4.5% за год" color="#c8622a" />
              <Kpi label="P/E рынка" value="~15" unit="x" delta="Ниже среднего АСЕАН" deltaPos color="#2a4a8a" />
              <Kpi label="Дивдоходность" value="~3.5" unit="%" delta="По индексу SET" deltaPos color="#2a7a4a" />
              <Kpi label="Капитализация" value="~490" unit="млрд $" delta="43-я в мире" color="#2a4a8a" />
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>SET Index (конец года)</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={setData}>
                  <defs>
                    <linearGradient id="setGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a4a8a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2a4a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                  <XAxis dataKey="y" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1100, 1800]} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TT />} />
                  <Area dataKey="idx" name="SET" stroke="#2a4a8a" strokeWidth={2.5} fill="url(#setGrad)" dot={{ r: 3, fill: '#2a4a8a' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: '#dde7f5', border: '1px solid rgba(42,74,138,0.25)', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a4a8a', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Аналитический вывод · Фондовый рынок</p>
              <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                SET торгуется с дисконтом к историческим уровням. P/E ~15x при дивдоходности 3.5% интересен для стоимостных инвесторов. Риски: слабый бат, зависимость от китайского туризма.
              </p>
            </div>
          </div>
        )}

        {!loading && tab === 'energy' && (
          <div>
            <p style={{ color: '#b08c3a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Энергетика</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>Электроэнергия и топливный баланс</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="Потребление 2024" value="225" unit="ТВтч" delta="▲ +5.6% г/г" deltaPos color="#b08c3a" />
              <Kpi label="На душу" value="3 254" unit="кВтч" delta="Исторический рекорд" deltaPos color="#2a7a4a" />
              <Kpi label="Пик нагрузки" value="34 443" unit="МВт" delta="Апрель 2024" color="#c8622a" />
              <Kpi label="Импорт энергии" value="~15" unit="%" delta="Из Лаоса (ГЭС)" color="#2a4a8a" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>Потребление электроэнергии, ТВтч · EPPO</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="enGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b08c3a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#b08c3a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                    <XAxis dataKey="y" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[160, 240]} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} />
                    <Area dataKey="twh" name="ТВтч" stroke="#b08c3a" strokeWidth={2.5} fill="url(#enGrad)" dot={{ r: 3, fill: '#b08c3a' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 16px' }}>Топливный микс 2024</p>
                {fuelMix.map((f, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#4a4540' }}>{f.name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: f.color }}>{f.value}%</span>
                    </div>
                    <div style={{ background: '#f0ebe3', borderRadius: 3, height: 5 }}>
                      <div style={{ width: `${f.value}%`, background: f.color, height: '100%', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'rating' && (
          <div>
            <p style={{ color: '#9a948e', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Автоматический расчёт</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 8px' }}>Рейтинг инвестиционной привлекательности</h2>
            <p style={{ color: '#9a948e', fontSize: 13, fontFamily: 'monospace', margin: '0 0 32px' }}>Пересчитывается при каждом обновлении данных из API</p>
            <div style={{ background: rating.bg, border: `1px solid ${rating.color}30`, borderRadius: 16, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: rating.color, letterSpacing: '0.1em', margin: '0 0 8px', textTransform: 'uppercase' }}>Итоговый рейтинг</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: rating.color, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>{rating.label}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a948e', margin: 0 }}>Обновлено: {lastUpdated}</p>
              </div>
              <span style={{ fontSize: 64 }}>🇹🇭</span>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: '24px 28px', marginBottom: 20 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Разбивка по блокам</p>
              <RatingBar label={`Макро (30%) — ВВП: +${latestGdp}%, Инфляция: ${latestInflation}%, Ставка: 2.5%`} score={scores.macro} color="#c8622a" />
              <RatingBar label="Недвижимость (35%) — Yield: 5%, Рост цен: +4% г/г" score={scores.re} color="#2a7a4a" />
              <RatingBar label="Фондовый рынок (35%) — P/E: 15x, Дивиденды: 3.5%, SET: -4.5%" score={scores.eq} color="#2a4a8a" />
            </div>
            <div style={{ background: '#f5f2ee', border: '1px solid #e8e2d9', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Методология</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { title: 'Макро · 30%', items: ['ВВП > 4% = 5 баллов', 'Инфляция 1–3% = 5 баллов', 'Реальная ставка > 0 = хорошо'], color: '#c8622a' },
                  { title: 'Недвижимость · 35%', items: ['Yield > 6% = 5 баллов', 'Рост цен 2–10% = 5 баллов', 'Перегрев > 10% = 2 балла'], color: '#2a7a4a' },
                  { title: 'Фондовый · 35%', items: ['P/E < 12 = 5 баллов', 'Дивиденды > 4% = 5 баллов', 'Рост индекса > 5% = 5 баллов'], color: '#2a4a8a' },
                ].map((block, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${block.color}`, paddingLeft: 12 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: block.color, fontWeight: 700, margin: '0 0 8px' }}>{block.title}</p>
                    {block.items.map((item, j) => (
                      <p key={j} style={{ fontSize: 12, color: '#4a4540', margin: '0 0 4px', lineHeight: 1.5 }}>• {item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'notes' && (
          <div>
            <p style={{ color: '#4a4540', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Заметки</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>Аналитические наблюдения</h2>
            {[
              { date: 'Март 2026', tag: 'Макро', title: 'Слабый бат — двойной эффект', text: 'THB торгуется у 35–36 за доллар. Для экспортёров и туризма это плюс, для импортёров энергии — существенный минус.', color: '#c8622a' },
              { date: 'Февраль 2026', tag: 'Недвижимость', title: 'Пхукет: ажиотаж или устойчивый рост?', text: 'Продажи кондо иностранцам выросли на 18% г/г. Основные покупатели — граждане РФ, Китая и Европы.', color: '#2a7a4a' },
              { date: 'Январь 2026', tag: 'Фондовый рынок', title: 'SET на многолетних минимумах — момент входа?', text: 'За 2022–2025 SET потерял ~20%. P/E на уровне 14–15x исторически соответствовал хорошим точкам входа.', color: '#2a4a8a' },
            ].map((n, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e2d9', padding: '24px 28px', marginBottom: 16, borderLeft: `3px solid ${n.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ background: `${n.color}15`, color: n.color, border: `1px solid ${n.color}40`, borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', fontSize: 10 }}>{n.tag}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{n.date}</span>
                </div>
                <h3 style={{ fontSize: 18, color: '#1a1612', margin: '0 0 10px' }}>{n.title}</h3>
                <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{n.text}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}