'use client'
// client: Recharts requires DOM APIs

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; gradeA: number; gradeB: number }

export function ProductionBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="gradeA" name="Grade A" fill="#7aadd4" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gradeB" name="Grade B" fill="#d4a96a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
