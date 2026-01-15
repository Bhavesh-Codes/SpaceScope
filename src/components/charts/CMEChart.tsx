'use client';

import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { CMEEvent } from '@/services/nasaApi';

interface Props {
    data: CMEEvent[];
}

export default function CMEChart({ data }: Props) {
    // Transform data for the chart
    const chartData = data
        .map(cme => {
            const speed = cme.cmeAnalyses?.[0]?.speed || 0;
            const type = cme.cmeAnalyses?.[0]?.type || 'Unknown';
            return {
                date: new Date(cme.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: new Date(cme.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                speed,
                type,
                location: cme.sourceLocation || 'N/A',
                fullDate: cme.startTime,
                isEarthDirected: cme.note?.toLowerCase().includes('earth') || type.toLowerCase().includes('halo')
            };
        })
        .filter(d => d.speed > 0)
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
        .slice(-15); // Last 15 events

    const getSpeedColor = (speed: number) => {
        if (speed >= 2000) return '#ef4444';
        if (speed >= 1500) return '#f97316';
        if (speed >= 1000) return '#eab308';
        return '#22c55e';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                    <p className="text-white font-orbitron font-bold text-lg mb-1">
                        {data.speed} km/s
                    </p>
                    <p className="text-slate-400 text-xs font-inter">Type: {data.type}</p>
                    <p className="text-slate-400 text-xs font-inter">Location: {data.location}</p>
                    <p className="text-slate-400 text-xs font-inter">{data.date} at {data.time}</p>
                    {data.isEarthDirected && (
                        <p className="text-red-400 text-xs font-inter mt-2 flex items-center gap-1">
                            ⚠️ Potentially Earth-directed
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="w-full h-48 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-slate-500 font-inter">No CME data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-orbitron text-sm uppercase tracking-wider mb-4">
                CME Speed Analysis (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="cmeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickFormatter={(value) => `${value}`}
                        label={{ value: 'km/s', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="speed" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getSpeedColor(entry.speed)} fillOpacity={0.8} />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="speed"
                        stroke="#fff"
                        strokeWidth={2}
                        dot={false}
                        strokeOpacity={0.3}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
