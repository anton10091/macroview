'use client'
import { useState, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCountry, getEntriesByCountry, COUNTRIES } from '../../lib/mock'
import { DIRECTIONS } from '../../lib/types'
import { Navbar } from '../../components/layout/Navbar'
import { SignalBadge } from '../../components/ui/SignalBadge'
import { CHIChart } from '../../components/ui/CHIChart'

// ─── Historical periods data ──────────────────────────────────────────────
const HIST_PERIODS = [
  { year:1700, label:'Аюттхая — пик', pct:100, km:'~800 000', chg:'', dir:'n',
    bounds:[[5,97],[23,106]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[97,7],[102,5],[104,10],[105,15],[105,21],[103,22],[101,21],[99,20],[98,18],[97,14],[97,10],[97,7]]] }},
    lost:[],
    cause:'Аюттхая — крупнейшее государство ЮВА. Вассальные отношения охватывают Чиангмай, Лаос, западную Камбоджу и четыре малайских султаната.',
    terr:'~800 000 км²: весь современный Таиланд + части Лаоса, Камбоджи, северные малайские земли.',
    fwd:'Сиам-1700 — модель торгового государства без природных ресурсов. Аналог: ОАЭ, Сингапур.',
    inv:'Модель государства-хаба. Таиланд воспроизводит ту же логику через туризм и логистику АСЕАН.',
    invT:'Паттерн: государство-хаб', invS:'n' },

  { year:1767, label:'Падение Аюттхаи', pct:58, km:'~465 000', chg:'−42%', dir:'l',
    bounds:[[10,98],[21,104]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[99,12],[101,11],[103,12],[103,16],[103,18],[102,20],[101,20],[99,19],[98,17],[98,14],[99,12]]] }},
    lost:[],
    cause:'Апрель 1767: бирманские войска сожгли Аюттхаю. Государство сжалось до долины Чао Прайя.',
    terr:'Вассальные территории отпали мгновенно. Таксин основал столицу Тхонбури.',
    fwd:'Chinese-Thai капитал заполнил вакуум. Тот же паттерн в 1997 и 2014.',
    inv:'После краха активы дешевеют — Chinese-Thai сети подбирают первыми.',
    invT:'Паттерн: после коллапса', invS:'l' },

  { year:1782, label:'Основание Бангкока', pct:72, km:'~575 000', chg:'+восст.', dir:'g',
    bounds:[[6,97],[22,105]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[99,7],[101,6],[102,7],[103,11],[104,16],[104,18],[103,21],[102,21],[101,21],[99,20],[98,18],[97,14],[98,10],[99,7]]] }},
    lost:[],
    cause:'Рама I основал Бангкок. Торговля с Китаем по системе «дань-привилегия» финансирует строительство.',
    terr:'Возвращён Чиангмай, лаосские вассалы частично под контролем.',
    fwd:'С 1782 Бангкок — единственный финансовый центр страны. 244 года непрерывной концентрации.',
    inv:'244 года столичной концентрации. Бангкокская недвижимость восстанавливалась после каждого кризиса.',
    invT:'Паттерн: столичная концентрация', invS:'g' },

  { year:1855, label:'Договор Боуринга', pct:80, km:'~640 000', chg:'торговый бум', dir:'g',
    bounds:[[5,97],[22,106]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[99,5],[101,5],[102,6],[103,10],[104,14],[105,18],[104,21],[102,22],[101,21],[99,20],[98,18],[97,14],[97,10],[98,7],[99,5]]] }},
    lost:[],
    cause:'Рама IV подписал Договор Боуринга с Британией: свободная торговля, пошлины 3%.',
    terr:'Рисовый экспорт за 40 лет вырастет в 7×. Монокультурная зависимость закрепляется.',
    fwd:'Монокультурная логика: рис→каучук→туризм→электроника. Туризм = 20% ВВП сегодня.',
    inv:'Либерализация → commodity boom. Аналог сегодня: EV-производство, новые SEZ.',
    invT:'Паттерн: торговое открытие', invS:'g' },

  { year:1893, label:'Утрата Лаоса', pct:62, km:'~495 000', chg:'−18%', dir:'l',
    bounds:[[5,97],[22,106]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[99,5],[101,5],[102,6],[103,10],[103,14],[103,17],[102,20],[101,21],[99,20],[98,18],[97,14],[97,10],[98,7],[99,5]]] }},
    lost:[{ type:'Feature', properties:{ name:'Лаос → Франции 1893' }, geometry:{ type:'Polygon', coordinates:[[[103,14],[105,15],[105,21],[103,22],[102,21],[103,18],[103,14]]] }}],
    cause:'Французские канонерки вошли в Чао Прайя. Ультиматум: 48 часов — отдать все земли к востоку от Меконга.',
    terr:'Лаос (~143 000 км²) передан Французскому Индокитаю. Крупнейшая единовременная потеря.',
    fwd:'Геополитическое принуждение малых стран не изменилось — сегодня вместо канонерок санкции.',
    inv:'Внешнее принуждение → краткосрочное обесценение. Сиам выжил. Геополитические риски 2026 управляемы.',
    invT:'Паттерн: геополитический шок', invS:'l' },

  { year:1909, label:'Совр. граница', pct:53, km:'~513 000', chg:'−3%', dir:'l',
    bounds:[[5.5,97.5],[20.5,105.6]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[102.1,5.6],[101.4,4.9],[100.1,5.6],[99.6,6.4],[99,7.8],[98.5,9.5],[98.7,10.5],[98.6,11.5],[97.5,12.5],[97.8,15],[98.8,16.5],[99.5,18.2],[100.5,19.5],[101.2,19.5],[102.1,20.2],[101.7,21],[102,22],[103,22],[104,21.8],[104.6,21.8],[103,22],[101.7,22.5],[101.2,21.8],[100.1,21.5],[99,21.8],[98.1,22.5],[97.8,24],[98.5,25.5],[98.7,27.5],[97.5,28.5],[96,28.3],[94,28],[92.2,27.8],[102.1,5.6]]] }},
    lost:[
      { type:'Feature', properties:{ name:'Лаос (с 1893)' }, geometry:{ type:'Polygon', coordinates:[[[103,14],[105,15],[105,21],[103,22],[102,21],[103,18],[103,14]]] }},
      { type:'Feature', properties:{ name:'Камбоджа (с 1907)' }, geometry:{ type:'Polygon', coordinates:[[[103,12],[105,12],[105,14],[103,14],[102.5,13],[103,12]]] }},
      { type:'Feature', properties:{ name:'Малайя (с 1909)' }, geometry:{ type:'Polygon', coordinates:[[[99.6,6.4],[101.4,6],[101.8,7],[101,8],[100.2,7.5],[99.6,6.4]]] }},
    ],
    cause:'Договор Бэнгкока 1909: 4 малайских султаната переданы Британии. Государство достигло современных границ.',
    terr:'Буферный статус между двумя колониальными империями сохранил независимость.',
    fwd:'Южные провинции (Паттани, Яла, Наратхиват) — зона конфликта до 2026. 115-летняя проблема.',
    inv:'Три южные провинции — зона высокого риска. Пхукет и Краби — исключение: безопасны для инвестиций.',
    invT:'Паттерн: юг Таиланда — исторический риск', invS:'l' },

  { year:1932, label:'Конституционный переворот', pct:54, km:'~513 000', chg:'граница зафикс.', dir:'n',
    bounds:[[5.5,97.5],[20.5,105.6]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[102.1,5.6],[100.1,5.6],[99.6,6.4],[98.5,9.5],[98.6,11.5],[97.5,12.5],[97.8,15],[99.5,18.2],[100.5,19.5],[101.2,19.5],[102.1,20.2],[104.1,22.4],[104.6,21.8],[102.1,5.6]]] }},
    lost:[
      { type:'Feature', properties:{ name:'Лаос' }, geometry:{ type:'Polygon', coordinates:[[[103,14],[105,15],[105,21],[103,22],[102,21],[103,18],[103,14]]] }},
      { type:'Feature', properties:{ name:'Камбоджа' }, geometry:{ type:'Polygon', coordinates:[[[103,12],[105,12],[105,14],[103,14],[102.5,13],[103,12]]] }},
      { type:'Feature', properties:{ name:'Малайя' }, geometry:{ type:'Polygon', coordinates:[[[99.6,6.4],[101.4,6],[101.8,7],[101,8],[100.2,7.5],[99.6,6.4]]] }},
    ],
    cause:'1932: военные офицеры свергли абсолютную монархию. Начало 94-летнего цикла военно-гражданского маятника.',
    terr:'Границы зафиксированы. В 1941 при японской поддержке Таиланд временно вернул Лаос и Камбоджу — отдал в 1946.',
    fwd:'12 военных переворотов за 94 года. Каждый: просадка SET 15–30%, восстановление 9–18 мес.',
    inv:'Каждый переворот: просадка SET 15–30%, восстановление 9–18 мес. Следующий кризис = возможность.',
    invT:'Паттерн: военный цикл = инвест-возможность', invS:'n' },

  { year:1997, label:'Азиатский кризис', pct:54, km:'~513 000', chg:'бат −60%', dir:'l',
    bounds:[[5.5,97.5],[20.5,105.6]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[102.1,5.6],[100.1,5.6],[99.6,6.4],[98.5,9.5],[98.6,11.5],[97.5,12.5],[97.8,15],[99.5,18.2],[100.5,19.5],[101.2,19.5],[102.1,20.2],[104.1,22.4],[104.6,21.8],[102.1,5.6]]] }},
    lost:[
      { type:'Feature', properties:{ name:'Лаос' }, geometry:{ type:'Polygon', coordinates:[[[103,14],[105,15],[105,21],[103,22],[102,21],[103,18],[103,14]]] }},
      { type:'Feature', properties:{ name:'Камбоджа' }, geometry:{ type:'Polygon', coordinates:[[[103,12],[105,12],[105,14],[103,14],[102.5,13],[103,12]]] }},
      { type:'Feature', properties:{ name:'Малайя' }, geometry:{ type:'Polygon', coordinates:[[[99.6,6.4],[101.4,6],[101.8,7],[101,8],[100.2,7.5],[99.6,6.4]]] }},
    ],
    cause:'2 июля 1997: Банк Таиланда отпустил курс бата. Трёхлетний пузырь в недвижимости лопнул.',
    terr:'Бат −60%. ВВП −10.8%, недвижимость −40–60%. МВФ $17.2 млрд. Долг домохозяйств: 52% → 88% ВВП к 2026.',
    fwd:'Долг 88% ВВП в 2026 — прямое эхо реформ 1997. Триггер: CDS >200 bp или долг >90% ВВП.',
    inv:'Недвижимость в USD (лизхолд) защищает от девальвации бата.',
    invT:'Паттерн: защита от девальвации', invS:'l' },

  { year:2026, label:'Делеверидж — сейчас', pct:54, km:'~513 000', chg:'CHI 56/100', dir:'n',
    bounds:[[5.5,97.5],[20.5,105.6]],
    geojson:{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[[[102.1,5.6],[100.1,5.6],[99.6,6.4],[98.5,9.5],[98.6,11.5],[97.5,12.5],[97.8,15],[99.5,18.2],[100.5,19.5],[101.2,19.5],[102.1,20.2],[104.1,22.4],[104.6,21.8],[102.1,5.6]]] }},
    lost:[
      { type:'Feature', properties:{ name:'Лаос' }, geometry:{ type:'Polygon', coordinates:[[[103,14],[105,15],[105,21],[103,22],[102,21],[103,18],[103,14]]] }},
      { type:'Feature', properties:{ name:'Камбоджа' }, geometry:{ type:'Polygon', coordinates:[[[103,12],[105,12],[105,14],[103,14],[102.5,13],[103,12]]] }},
      { type:'Feature', properties:{ name:'Малайя' }, geometry:{ type:'Polygon', coordinates:[[[99.6,6.4],[101.4,6],[101.8,7],[101,8],[100.2,7.5],[99.6,6.4]]] }},
    ],
    cause:'Таиланд 2026 несёт все паттерны 326 лет: нейтралитет, Chinese-Thai капитал (60%+ SET), монокультурная логика, военный цикл.',
    terr:'Граница стабильна с 1946. Рост 1.6%, долг 88%, дефляция −0.2%. Структурно идентично 1985–87.',
    fwd:'60% — FDI-бум при реформе прав собственности. 25% — долговой кризис. 15% — стагфляция.',
    inv:'Базовый (60%): Пхукет/Паттайя + ожидание реформ. Хедж (25%): USD-активы, мониторинг CDS.',
    invT:'Инвест-вывод 2026 — исторический синтез', invS:'n' },
]

const HIST_SIG = {
  g:{ color:'#2a7a4a', bg:'#dff0e8', border:'#a8dfc0', label:'Расширение' },
  l:{ color:'#c8622a', bg:'#f5e8df', border:'#e8c4a8', label:'Потеря / кризис' },
  n:{ color:'#b08c3a', bg:'#f5edda', border:'#e8d898', label:'Нейтрально' },
}

// ─── Leaflet Map (loaded client-side) ─────────────────────────────────────
function HistoricalMapSection() {
  const [idx, setIdx] = useState(0)
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const siamLayerRef = useRef(null)
  const lostLayersRef = useRef([])

  const p = HIST_PERIODS[idx]
  const sig = HIST_SIG[p.dir]
  const dc = p.dir==='l' ? '#c8622a' : p.dir==='g' ? '#2a7a4a' : '#b08c3a'
  const invSig = HIST_SIG[p.invS]

  // Init Leaflet once
  useEffect(() => {
    if (leafletRef.current) return

    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (window.L) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!mapRef.current || leafletRef.current) return
      const L = window.L

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 10,
      }).addTo(map)

      leafletRef.current = map
      renderPeriod(HIST_PERIODS[0])
    }

    loadLeaflet()

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [])

  // Re-render on period change
  useEffect(() => {
    renderPeriod(p)
  }, [idx])

  const renderPeriod = (period) => {
    const map = leafletRef.current
    if (!map || !window.L) return
    const L = window.L

    // Remove old layers
    if (siamLayerRef.current) { map.removeLayer(siamLayerRef.current); siamLayerRef.current = null }
    lostLayersRef.current.forEach(l => map.removeLayer(l))
    lostLayersRef.current = []

    // Add lost territories (red dashed)
    period.lost.forEach(geojson => {
      const layer = L.geoJSON(geojson, {
        style: { color:'#cc3311', fillColor:'#dd4422', fillOpacity:0.35, weight:1.5, dashArray:'6 4' }
      }).addTo(map)
      layer.bindTooltip(geojson.properties.name, { sticky: true, className: 'hist-tooltip' })
      lostLayersRef.current.push(layer)
    })

    // Add Siam territory (orange)
    siamLayerRef.current = L.geoJSON(period.geojson, {
      style: { color:'#b8702a', fillColor:'#e8a060', fillOpacity:0.6, weight:2.5 }
    }).addTo(map)
    siamLayerRef.current.bindTooltip(`Сиам ${period.year} · ${period.km} км²`, { sticky: true })

    // Fit bounds
    const [[s,w],[n,e]] = period.bounds
    map.fitBounds([[s,w],[n,e]], { padding: [20,20] })
  }

  return (
    <div>
      {/* Map */}
      <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #e8e2d8', marginBottom:0 }}>
        <div ref={mapRef} style={{ height:480, width:'100%', background:'#a8cce0' }} />
      </div>

      {/* Period controls */}
      <div style={{ background:'#1a1612', padding:'12px 16px', borderRadius:'0 0 0 0' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
          {HIST_PERIODS.map((pp, i) => (
            <button key={pp.year} onClick={() => setIdx(i)} style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'5px 12px', borderRadius:20,
              border: i===idx ? '1.5px solid #fff' : '1px solid #3a3530',
              background: i===idx ? '#fff' : 'transparent',
              color: i===idx ? '#1a1612' : '#9a948e',
              fontFamily:'monospace', fontSize:11, cursor:'pointer', transition:'all .15s',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background:HIST_SIG[pp.dir].color }} />
              {pp.year}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid #3a3530', background:'transparent', color:idx===0?'#4a4540':'#fff', fontSize:18, cursor:idx===0?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <input type="range" min={0} max={HIST_PERIODS.length-1} value={idx} step={1}
            onChange={e => setIdx(+e.target.value)} style={{ flex:1 }} />
          <button onClick={() => setIdx(i => Math.min(HIST_PERIODS.length-1,i+1))} disabled={idx===HIST_PERIODS.length-1}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid #3a3530', background:'transparent', color:idx===HIST_PERIODS.length-1?'#4a4540':'#fff', fontSize:18, cursor:idx===HIST_PERIODS.length-1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
          <span style={{ fontFamily:'monospace', fontSize:11, color:'#6a6460', flexShrink:0 }}>{idx+1} / {HIST_PERIODS.length}</span>
        </div>
      </div>

      {/* Dashboard */}
      <div style={{ border:'1px solid #e8e2d8', borderTop:'none', borderRadius:'0 0 12px 12px', background:'#fff', padding:'20px 20px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #e8e2d8' }}>
          <div>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'#9a948e', marginBottom:4 }}>{p.period} · {p.dynasty || ''}</div>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:18, fontWeight:900, color:'#1a1612', margin:0 }}>{p.year} — {p.label}</h3>
          </div>
          <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, padding:'4px 12px', borderRadius:6, background:sig.bg, color:sig.color, flexShrink:0 }}>{sig.label}</span>
        </div>

        {/* Two columns */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* Left: causal chain + invest */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

            {/* Area bar */}
            <div style={{ padding:'10px 14px', background:'#faf8f4', border:'1px solid #e8e2d8', borderRadius:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontFamily:'monospace', fontSize:10, color:'#9a948e' }}>Территория от пика Аюттхаи</span>
                <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:dc }}>{p.pct}% · {p.km} км²</span>
              </div>
              <div style={{ background:'#e8e2d8', borderRadius:4, height:8, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${p.pct}%`, background:dc, borderRadius:4, transition:'width .5s,background .3s' }} />
              </div>
              {p.chg && <div style={{ marginTop:4, fontFamily:'monospace', fontSize:10, fontWeight:700, color:dc, textAlign:'right' }}>{p.chg}</div>}
            </div>

            {/* Causal chain */}
            {[
              { tag:'причина',    bg:'#f5edda', col:'#b08c3a', txt:p.cause },
              { tag:'территория', bg:'#f5e8df', col:'#c8622a', txt:p.terr },
              { tag:'→ 2026',     bg:'#eeedfe', col:'#534AB7', txt:p.fwd },
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', gap:8, padding:'9px 12px', background:'#faf8f4', border:'1px solid #e8e2d8', borderRadius:8 }}>
                <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:600, padding:'2px 7px', borderRadius:10, whiteSpace:'nowrap', flexShrink:0, marginTop:1, background:r.bg, color:r.col }}>{r.tag}</span>
                <p style={{ fontSize:12, color:'#6a6460', lineHeight:1.6, margin:0 }}>{r.txt}</p>
              </div>
            ))}
          </div>

          {/* Right: invest */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ padding:'14px 16px', borderRadius:10, background:invSig.bg, border:`1px solid ${invSig.border}`, flex:1 }}>
              <p style={{ fontSize:12, fontWeight:700, color:invSig.color, marginBottom:8 }}>{p.invT}</p>
              <p style={{ fontSize:13, color:'#6a6460', lineHeight:1.7, margin:0 }}>{p.inv}</p>
            </div>

            {/* Pattern summary */}
            <div style={{ padding:'14px 16px', borderRadius:10, background:'#faf8f4', border:'1px solid #e8e2d8' }}>
              <p style={{ fontSize:11, fontFamily:'monospace', color:'#9a948e', marginBottom:6 }}>Ключевые цифры</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, color:dc }}>{p.pct}%</div>
                  <div style={{ fontFamily:'monospace', fontSize:10, color:'#9a948e' }}>от пика 1700</div>
                </div>
                <div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, color:'#1a1612' }}>{p.km}</div>
                  <div style={{ fontFamily:'monospace', fontSize:10, color:'#9a948e' }}>км²</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function CountryPage() {
  const params = useParams()
  const country = getCountry(params.slug)
  if (!country) return notFound()

  const entries = getEntriesByCountry(params.slug)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4' }}>
      <Navbar />

      {/* Хедер */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 24px 0' }}>

          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>
            <Link href="/" style={{ color: '#9a948e', textDecoration: 'none' }}>MacroView</Link>
            <span>›</span>
            <span style={{ color: '#1a1612', fontWeight: 600 }}>{country.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 40 }}>{country.flag}</span>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 900, color: '#1a1612', margin: '0 0 4px' }}>{country.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a948e' }}>{country.region}</span>
                  <SignalBadge signal={country.chi.signal} index={country.chi.index} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'ВВП рост',  val: `${country.macro.gdpGrowth}%` },
                { label: 'Инфляция',  val: `${country.macro.inflation}%` },
                { label: 'Ставка ЦБ', val: `${country.macro.cbRate}%` },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center', background: '#f5f2ee', border: '1px solid #e8e2d8', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1a1612' }}>{val}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Навигация */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e2d8', overflowX: 'auto' }}>
            {[
              { id: 'indicator',    label: '📡 Индикатор' },
              { id: 'capital-flow', label: '💰 Карта капитала' },
              { id: 'history',      label: '📜 Живая история' },
              { id: 'macro',        label: '📊 Макроданные' },
            ].map(tab => (
              <a key={tab.id} href={`#${tab.id}`} style={{
                fontFamily: 'monospace', fontSize: 11, color: '#6a6460', padding: '10px 16px',
                borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </a>
            ))}
            <Link href={`/country/${params.slug}/history`} style={{
              fontFamily: 'monospace', fontSize: 11, color: '#1a3a6a', padding: '10px 16px',
              borderBottom: '2px solid #1a3a6a', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 700,
            }}>
              🗺 История 1700–2026
            </Link>
            <div style={{ width: 1, background: '#e8e2d8', margin: '4px 8px' }} />
            {DIRECTIONS.map(dir => (
              <Link key={dir.id} href={`/country/${params.slug}/${dir.path}`} style={{
                fontFamily: 'monospace', fontSize: 11, color: '#6a6460', padding: '10px 16px',
                borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {dir.icon} {dir.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ─── ИНДИКАТОР ─── */}
        <section id="indicator">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>📡 Индикатор CHI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

            {/* Главный сигнал */}
            <div style={{
              borderRadius: 12, border: `2px solid ${country.chi.signal === 'green' ? '#bbf7d0' : country.chi.signal === 'yellow' ? '#fde047' : '#fecaca'}`,
              background: country.chi.signal === 'green' ? '#f0fdf4' : country.chi.signal === 'yellow' ? '#fefce8' : '#fef2f2',
              padding: 20,
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>CHI · Март 2026</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${country.chi.signal === 'green' ? '#22c55e' : country.chi.signal === 'yellow' ? '#eab308' : '#ef4444'}`,
                }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1a1612' }}>{country.chi.index}</span>
                </div>
                <SignalBadge signal={country.chi.signal} size="lg" />
              </div>

              {[
                { label: '🏔 Долгосрочная', val: country.chi.longTerm,  color: '#1a3a6a' },
                { label: '📊 Среднесрочная', val: country.chi.midTerm,   color: '#2563eb' },
                { label: '⚡ Краткосрочная', val: country.chi.shortTerm, color: '#d97706' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.6)', borderRadius: 9999 }}>
                    <div style={{ height: '100%', borderRadius: 9999, width: `${val}%`, background: color }} />
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Вывод агента</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#2a2520', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{country.chi.agentNote}</p>
              </div>
            </div>

            {/* График */}
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>История CHI</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['#1a3a6a', '🏔 Долг.'], ['#2563eb', '📊 Средн.'], ['#d97706', '⚡ Кратк.']].map(([color, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <CHIChart history={country.chi.history} />
            </div>
          </div>

          {/* Прогноз */}
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, marginTop: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Прогноз CHI на 10 лет · Три сценария</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[country.chi.forecast.positive, country.chi.forecast.base, country.chi.forecast.negative].map(s => (
                <div key={s.label} style={{
                  borderRadius: 8, padding: 16,
                  border: `1px solid ${s.label === 'Позитивный' ? '#bbf7d0' : s.label === 'Базовый' ? '#bfdbfe' : '#fecaca'}`,
                  background: s.label === 'Позитивный' ? '#f0fdf4' : s.label === 'Базовый' ? '#eff6ff' : '#fef2f2',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{s.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>{s.probability}%</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, color: '#1a1612' }}>{s.chiIn5y}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>CHI · 5 лет</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, color: '#1a1612' }}>{s.chiIn10y}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9a948e' }}>CHI · 10 лет</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a4540', lineHeight: 1.6, margin: 0 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Что повлияло */}
          {country.chi.factors.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, marginTop: 16 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Что повлияло на индекс</div>
              {country.chi.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.impact === 'positive' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>{f.impact === 'positive' ? '↑' : '↓'}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: f.impact === 'positive' ? '#15803d' : '#991b1b', flex: 1 }}>{f.title}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{f.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── КАРТА КАПИТАЛА ─── */}
        <section id="capital-flow">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>💰 Карта капитала</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'FDI', sublabel: 'Прямые инвестиции', val: country.capitalFlow.fdi.value, yoy: country.capitalFlow.fdi.yoy, icon: '🏭' },
              { label: 'Portfolio', sublabel: 'Портфельные', val: country.capitalFlow.portfolio.value, yoy: country.capitalFlow.portfolio.yoy, icon: '📊' },
              { label: 'Remittances', sublabel: 'Переводы', val: country.capitalFlow.remittances.value, yoy: country.capitalFlow.remittances.yoy, icon: '💸' },
              { label: 'RE Foreign', sublabel: 'Недвижимость', val: country.capitalFlow.reForeign.value, yoy: country.capitalFlow.reForeign.yoy, icon: '🏠' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612' }}>
                  {item.val > 0 ? '+' : ''}{item.val.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 400, color: '#9a948e' }}>млрд $</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>{item.sublabel}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, marginTop: 4, color: item.yoy >= 0 ? '#15803d' : '#991b1b' }}>
                  {item.yoy >= 0 ? '↑' : '↓'} {Math.abs(item.yoy)}% г/г
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net Capital Flow Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 900, color: '#1a1612' }}>{country.capitalFlow.score}</div>
            </div>
            <SignalBadge signal={country.capitalFlow.signal} size="lg" />
          </div>
        </section>

        {/* ─── ИСТОРИЧЕСКАЯ КАРТА ─── */}
        <section id="history">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 8 }}>🗺 История 1700–2026</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a948e', marginBottom: 16 }}>
            Территориальные изменения · причинно-следственные связи · инвест-выводы
          </p>
          {country.slug === 'thailand' ? (
            <HistoricalMapSection />
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#9a948e' }}>Исторические данные для {country.name} в разработке</p>
            </div>
          )}
        </section>
        {/* ─── МАКРОДАННЫЕ ─── */}
        <section id="macro">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>📊 Макроданные</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Экономика</div>
              {[
                { label: 'ВВП рост', val: `${country.macro.gdpGrowth}%`, note: 'WB · Ежекварт.' },
                { label: 'Инфляция', val: `${country.macro.inflation}%`, note: 'ЦБ · Ежемес.' },
                { label: 'Ставка ЦБ', val: `${country.macro.cbRate}%`, note: 'ЦБ · Ежемес.' },
                { label: 'Безработица', val: `${country.macro.unemployment}%`, note: 'Нац. стат.' },
                { label: 'Долг домохозяйств', val: `${country.macro.householdDebt}% ВВП`, note: 'BIS' },
                { label: 'Госдолг', val: `${country.macro.govDebt}% ВВП`, note: 'IMF' },
                { label: 'Торговый баланс', val: `${country.macro.tradeBalance}% ВВП`, note: 'ЦБ' },
                { label: 'ВВП на душу', val: `$${country.macro.gdpPerCapita.toLocaleString()}`, note: 'WB' },
              ].map(({ label, val, note }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f2ee' : 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{val}</span>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9a948e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Общество и политика</div>
              {[
                { label: 'Индекс счастья', val: `${country.society.happinessScore}/10 · #${country.society.happinessRank}`, note: 'WHR' },
                { label: 'ИЧР', val: country.society.hdi.toFixed(3), note: 'UNDP' },
                { label: 'Неравенство (Gini)', val: country.society.gini.toFixed(1), note: 'WB' },
                { label: 'Индекс демократии', val: `${country.society.democracyIndex}/10`, note: 'EIU' },
                { label: 'Медианный возраст', val: `${country.society.medianAge} лет`, note: 'UN' },
                { label: 'Рост населения', val: `${country.society.populationGrowth}%`, note: 'UN' },
                { label: 'Население', val: `${country.macro.population} млн`, note: 'UN' },
                { label: 'Военная безопасность', val: `${country.society.militarySafety}/100`, note: 'GPI' },
              ].map(({ label, val, note }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f2ee' : 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a4540' }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a1612' }}>{val}</span>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8c2b8' }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 10, color: '#9a948e' }}>Обновлено: {country.macro.updatedAt}</div>
        </section>

        {/* ─── НАПРАВЛЕНИЯ ─── */}
        <section>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1612', marginBottom: 16 }}>Направления для инвестора</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {DIRECTIONS.map(dir => {
              const isAvailable = country.priority.includes(dir.id)
              return (
                <Link key={dir.id} href={isAvailable ? `/country/${params.slug}/${dir.path}` : '#'} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #e8e2d8', borderRadius: 12, padding: 20,
                    opacity: isAvailable ? 1 : 0.5, cursor: isAvailable ? 'pointer' : 'not-allowed',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{dir.icon}</span>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1612' }}>{dir.label}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: isAvailable ? '#1a3a6a' : '#c8c2b8' }}>
                        {isAvailable ? '→' : 'Скоро'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9a948e', margin: 0 }}>
                      {dir.id === 'real-estate'  && 'Сигнал RESI · Калькулятор доходности · Карта районов · Прогноз 10 лет'}
                      {dir.id === 'stock-market' && 'Сигнал фондового рынка · Скринер акций · Дивидендный радар'}
                      {dir.id === 'visa'         && 'Чеклист переезда · Налоговый калькулятор · Сравнение ВНЖ программ'}
                      {dir.id === 'business'     && 'Индекс деловой среды · Калькулятор открытия компании · Экосистема'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
