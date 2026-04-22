'use client'
// client: Recharts requires DOM APIs

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; cumulativeDepletion: number }

export function DepletionAreaChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip formatter={(v: number) => [v, 'Kumulatif Depletion']} />
        <Area type="monotone" dataKey="cumulativeDepletion" stroke="#e8a5a0" fill="#fdeeed" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
