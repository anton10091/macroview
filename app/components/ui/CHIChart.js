'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export function CHIChart({ history, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={history} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
        <XAxis dataKey="date" tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#9a948e' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#9a948e' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 10, borderRadius: 8, border: '1px solid #e8e2d8' }} />
        <ReferenceLine y={65} stroke="#15803d" strokeDasharray="4 4" strokeWidth={1} opacity={0.4} />
        <ReferenceLine y={45} stroke="#d97706" strokeDasharray="4 4" strokeWidth={1} opacity={0.4} />
        <Line type="monotone" dataKey="longTerm"  name="🏔 Долгосрочная"  stroke="#1a3a6a" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="midTerm"   name="📊 Среднесрочная" stroke="#2563eb" strokeWidth={2}   dot={false} />
        <Line type="monotone" dataKey="shortTerm" name="⚡ Краткосрочная" stroke="#d97706" strokeWidth={1.5} dot={false} strokeDasharray="5 2" />
      </LineChart>
    </ResponsiveContainer>
  )
}
