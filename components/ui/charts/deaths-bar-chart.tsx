'use client'
// client: Recharts requires DOM APIs

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; deaths: number }

export function DeathsBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip formatter={(v) => [v, 'Kematian']} />
        <Bar dataKey="deaths" name="Kematian" fill="#e8a5a0" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
