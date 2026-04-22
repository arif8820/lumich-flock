'use client'
// client: Recharts requires DOM APIs

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; hdp: number }

export function HdpLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#8fa08f' }} unit="%" />
        <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'HDP']} />
        <Line type="monotone" dataKey="hdp" stroke="#7aadd4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
