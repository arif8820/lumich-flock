'use client'
// client: Recharts requires DOM APIs

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; fcr: number }

export function FcrLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis domain={[1, 3]} tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip formatter={(v: number) => [v.toFixed(2), 'FCR']} />
        <ReferenceLine y={2.1} stroke="#e07a6a" strokeDasharray="4 2" label={{ value: '2.1', fill: '#e07a6a', fontSize: 10 }} />
        <Line type="monotone" dataKey="fcr" stroke="#7ab8b0" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
