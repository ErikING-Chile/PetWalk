"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface WalkChartProps {
    data: {
        day: string
        count: number
    }[]
}

export function WalkChart({ data }: WalkChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card variant="glass" className="p-6 h-[300px] flex items-center justify-center text-gray-500 text-sm">
                No hay datos suficientes para mostrar el gráfico.
            </Card>
        )
    }

    return (
        <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Frecuencia de Paseos</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff'
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="url(#colorVal)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        >
                            {/* Gradient definition within the SVG context of the chart */}
                        </Bar>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
