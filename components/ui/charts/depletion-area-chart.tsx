'use client'
// client: Recharts requires DOM APIs

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; deaths: number }

export function DepletionAreaChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" /* --lf-border */ />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' /* --lf-text-soft */ }} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Deplesi']} />
        <Bar dataKey="deaths" fill="#e8a5a0" /* --lf-rose */ radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
