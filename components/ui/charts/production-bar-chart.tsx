'use client'
// client: Recharts requires DOM APIs

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const SKU_COLORS = ['#7aadd4', '#d4a96a', '#7ab8b0', '#e8a5a0', '#a0b87a', '#b87aa0']

type ProductionBarChartProps = {
  data: Array<{ date: string } & Record<string, number>>
  skuKeys: string[]
}

export function ProductionBarChart({ data, skuKeys }: ProductionBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {skuKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            name={key}
            stackId="eggs"
            fill={SKU_COLORS[i % SKU_COLORS.length]}
            radius={i === skuKeys.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
