'use client';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const fuelMix = [
  { name: 'Природный газ', value: 57, color: '#2a4a8a' },
  { name: 'Уголь/лигнит', value: 21, color: '#c8622a' },
  { name: 'ВИЭ + ГЭС', value: 20, color: '#2a7a4a' },
  { name: 'Прочее', value: 2, color: '#9a948e' },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e2d9', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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

export default function ThailandPage() {
  const [tab, setTab] = useState('macro');
  const [macroData, setMacroData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // World Bank API — ВВП и инфляция Таиланда
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
        const combined = years.map(y => ({ y, gdp: gdpMap[y] ?? null, inflation: inflMap[y] ?? null }));
        setMacroData(combined);
      } catch (e) {
        // Фолбэк на статичные данные если API недоступен
        setMacroData([
          { y: '2018', gdp: 4.2, inflation: 1.1 },
          { y: '2019', gdp: 2.2, inflation: 0.7 },
          { y: '2020', gdp: -6.1, inflation: -0.8 },
          { y: '2021', gdp: 1.5, inflation: 1.2 },
          { y: '2022', gdp: 2.6, inflation: 6.1 },
          { y: '2023', gdp: 1.9, inflation: 1.2 },
          { y: '2024', gdp: 2.6, inflation: 0.4 },
        ]);
      }

      // Данные по электроэнергии (статичные — EPPO не имеет открытого API)
      setEnergyData([
        { y: '2018', twh: 187.6 },
        { y: '2019', twh: 190.1 },
        { y: '2020', twh: 177.4 },
        { y: '2021', twh: 181.0 },
        { y: '2022', twh: 186.5 },
        { y: '2023', twh: 213.0 },
        { y: '2024', twh: 225.0 },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'macro', label: 'Макро' },
    { id: 'realestate', label: 'Недвижимость' },
    { id: 'equity', label: 'Фондовый рынок' },
    { id: 'energy', label: 'Энергетика' },
    { id: 'notes', label: 'Заметки' },
  ];

  return (
    <div style={{ background: '#f5f2ee', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <Nav />

      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', padding: '28px 40px 24px', marginTop: 56 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>🇹🇭</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 28, color: '#1a1612', margin: 0 }}>Таиланд</h1>
                <span style={{ background: '#dde7f5', color: '#2a4a8a', borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', fontSize: 10 }}>ЮВА</span>
                <span style={{ background: '#f5edda', color: '#b08c3a', borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', fontSize: 10 }}>Нейтрально</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: 0 }}>
                {loading ? 'Загрузка данных...' : 'Данные обновлены · World Bank API · EPPO'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
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
              <Kpi label="ВВП рост 2024" value="+2.6" unit="%" delta="▲ vs 1.9% в 2023" deltaPos color="#2a7a4a" />
              <Kpi label="Инфляция 2024" value="0.4" unit="%" delta="▼ с 1.2% в 2023" deltaPos={false} color="#c8622a" />
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
                Таиланд демонстрирует умеренный рост при практически нулевой инфляции — нетипичная комбинация для региона. Банк Таиланда удерживает ставку на уровне 2.5%, балансируя между стимулированием роста и слабостью бата. Ключевые риски: замедление китайского спроса на экспорт и зависимость от импортного газа.
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

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 28 }}>
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

        {!loading && tab === 'realestate' && (
          <div>
            <p style={{ color: '#2a7a4a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Недвижимость</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>Цены, доходность и ключевые рынки</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="Индекс цен 2024" value="112" unit="(2019=100)" delta="▲ +12% с 2019" deltaPos color="#2a7a4a" />
              <Kpi label="Аренда Бангкок" value="~600" unit="$/мес" delta="1-bed кондо центр" color="#2a4a8a" />
              <Kpi label="Доходность" value="4–6" unit="% г." delta="Gross yield, кондо" color="#2a7a4a" />
              <Kpi label="Квота иностр." value="49" unit="%" delta="Макс. доля в кондо" color="#b08c3a" />
            </div>
            <div style={{ background: '#dff0e8', border: '1px solid rgba(42,122,74,0.25)', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a7a4a', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Аналитический вывод · Недвижимость</p>
              <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Пхукет и Паттайя остаются наиболее привлекательными для иностранных инвесторов: gross yield 5–6% при растущем турпотоке. Бангкок — рынок более насыщенный, но стабильный. Иностранцы не могут владеть землёй, только кондо (до 49% в здании).
              </p>
            </div>
          </div>
        )}

        {!loading && tab === 'equity' && (
          <div>
            <p style={{ color: '#2a4a8a', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Фондовый рынок</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>SET Index и ключевые секторы</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <Kpi label="SET Index 2024" value="1 482" unit="" delta="▼ -11% с пика 2022" color="#c8622a" />
              <Kpi label="P/E рынка" value="~15" unit="x" delta="Ниже среднего АСЕАН" deltaPos color="#2a4a8a" />
              <Kpi label="Дивдоходность" value="~3.5" unit="%" delta="По индексу SET" deltaPos color="#2a7a4a" />
              <Kpi label="Капитализация" value="~490" unit="млрд $" delta="43-я в мире" color="#2a4a8a" />
            </div>
            <div style={{ background: '#dde7f5', border: '1px solid rgba(42,74,138,0.25)', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a4a8a', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Аналитический вывод · Фондовый рынок</p>
              <p style={{ color: '#4a4540', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                SET торгуется с дисконтом к историческим уровням и к аналогам по региону. P/E ~15x при дивдоходности 3.5% делает рынок интересным для стоимостных инвесторов. Основные риски: слабый бат, зависимость от китайского туризма, политическая нестабильность.
              </p>
            </div>
          </div>
        )}

        {!loading && tab === 'notes' && (
          <div>
            <p style={{ color: '#4a4540', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>Заметки</p>
            <h2 style={{ fontSize: 22, color: '#1a1612', margin: '0 0 24px' }}>Аналитические наблюдения</h2>
            {[
              { date: 'Март 2026', tag: 'Макро', title: 'Слабый бат — двойной эффект', text: 'THB торгуется у 35–36 за доллар. Для экспортёров и туризма это плюс, для импортёров энергии — существенный минус.', color: '#c8622a' },
              { date: 'Февраль 2026', tag: 'Недвижимость', title: 'Пхукет: ажиотаж или устойчивый рост?', text: 'Продажи кондо иностранцам выросли на 18% г/г. Основные покупатели — граждане РФ, Китая и Европы. Квота 49% в ряде проектов уже выбрана.', color: '#2a7a4a' },
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