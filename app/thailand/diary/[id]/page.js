'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

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
    <nav style={{ background:"#fff", borderBottom:"1px solid #e8e2d8", padding:"0 32px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:scrolled?"0 1px 12px rgba(0,0,0,0.06)":"none", transition:"box-shadow 0.25s" }}>
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
  const [entry, setEntry] = useState(null);
  const [prevEntry, setPrevEntry] = useState(null);
  const [nextEntry, setNextEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [params.id]);

  async function fetchEntry() {
    setLoading(true);

    // Получаем текущую запись
    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', params.id)
      .single();

    setEntry(data);

    if (data) {
      // Предыдущая (более старая)
      const { data: prev } = await supabase
        .from('diary_entries')
        .select('id, title, emoji')
        .eq('published', true)
        .lt('created_at', data.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Следующая (более новая)
      const { data: next } = await supabase
        .from('diary_entries')
        .select('id, title, emoji')
        .eq('published', true)
        .gt('created_at', data.created_at)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      setPrevEntry(prev);
      setNextEntry(next);
    }

    setLoading(false);
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf8f4", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#9a948e" }}>Загрузка...</span>
    </div>
  );

  if (!entry) return (
    <div style={{ minHeight:"100vh", background:"#faf8f4", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:"#1a1612" }}>Запись не найдена</p>
        <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#1a3a6a" }}>← Вернуться в дневник</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#faf8f4" }}>
      <LiveTicker />
      <Navbar />

      <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 32px 80px" }}>

        {/* Breadcrumbs */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:32, flexWrap:"wrap" }}>
          <Link href="/" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>MacroView</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <Link href="/thailand" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>Таиланд</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.07em", textDecoration:"none" }}>Дневник</Link>
          <span style={{ color:"#c8c2b8" }}>›</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#1a1612", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>{entry.title}</span>
        </div>

        {/* Мета */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
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
          {entry.tags?.map(t => (
            <span key={t} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, background:entry.bg, color:entry.color, border:`1px solid ${entry.color}30`, borderRadius:5, padding:"3px 10px" }}>{t}</span>
          ))}
        </div>

        <div style={{ height:1, background:"#e8e2d8", marginBottom:32 }} />

        {/* Текст */}
        <div style={{ marginBottom:40 }}>
          {entry.text?.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontFamily:"Georgia, serif", fontSize:16, color:"#2a2520", lineHeight:1.9, margin:"0 0 24px" }}>{para}</p>
          ))}
        </div>

        {/* Источник */}
        {entry.source && (
          <div style={{ background:"#f5f2ee", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 18px", marginBottom:40, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", textTransform:"uppercase", letterSpacing:"0.08em" }}>Источник</span>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#1a1612", margin:"4px 0 0", fontWeight:600 }}>{entry.source}</p>
            </div>
            {entry.source_url && (
              <a href={entry.source_url} target="_blank" rel="noreferrer" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#1a3a6a", textDecoration:"none" }}>Открыть →</a>
            )}
          </div>
        )}

        {/* Навигация */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:32 }}>
          {prevEntry ? (
            <Link href={`/thailand/diary/${prevEntry.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 16px", cursor:"pointer" }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", margin:"0 0 6px" }}>← Предыдущая</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1612", margin:0, fontWeight:700, lineHeight:1.4 }}>{prevEntry.emoji} {prevEntry.title}</p>
              </div>
            </Link>
          ) : <div />}
          {nextEntry ? (
            <Link href={`/thailand/diary/${nextEntry.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", border:"1px solid #e8e2d8", borderRadius:10, padding:"14px 16px", cursor:"pointer", textAlign:"right" }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#9a948e", margin:"0 0 6px" }}>Следующая →</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1612", margin:0, fontWeight:700, lineHeight:1.4 }}>{nextEntry.emoji} {nextEntry.title}</p>
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Назад */}
        <div style={{ textAlign:"center" }}>
          <Link href="/thailand/diary" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#1a3a6a", textDecoration:"none", background:"#f0f4fa", border:"1px solid #1a3a6a30", borderRadius:8, padding:"10px 24px", display:"inline-block" }}>
            ← Все записи дневника
          </Link>
        </div>

      </div>
    </div>
  );
}