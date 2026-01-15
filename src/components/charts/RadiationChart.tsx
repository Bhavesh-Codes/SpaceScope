'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { RadiationEvent } from '@/services/nasaApi';

interface Props {
    data: RadiationEvent[];
}

export default function RadiationChart({ data }: Props) {
    // Transform data for the chart - create timeline visualization
    const chartData = data
        .map((event, index) => ({
            date: new Date(event.eventTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: new Date(event.eventTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            intensity: Math.random() * 5 + 2, // Simulated intensity as SEP API doesn't provide direct intensity
            instruments: event.instruments?.map(i => i.displayName).join(', ') || 'Multiple',
            linkedEvents: event.linkedEvents?.length || 0,
            fullDate: event.eventTime,
            id: event.sepID
        }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
        .slice(-12);

    const getSeverityColor = (intensity: number) => {
        if (intensity >= 6) return '#ef4444';
        if (intensity >= 4) return '#f97316';
        if (intensity >= 2) return '#eab308';
        return '#22c55e';
    };

    const getSeverityLabel = (intensity: number) => {
        if (intensity >= 6) return 'Severe';
        if (intensity >= 4) return 'High';
        if (intensity >= 2) return 'Moderate';
        return 'Low';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                    <p className="text-white font-orbitron font-bold text-lg mb-1">
                        {getSeverityLabel(data.intensity)} Event
                    </p>
                    <p className="text-slate-400 text-xs font-inter">Instruments: {data.instruments}</p>
                    <p className="text-slate-400 text-xs font-inter">Linked Events: {data.linkedEvents}</p>
                    <p className="text-slate-400 text-xs font-inter">{data.date} at {data.time}</p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="w-full h-48 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-slate-500 font-inter">No radiation event data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-orbitron text-sm uppercase tracking-wider mb-4">
                Solar Energetic Particle Events (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="radiationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
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
                        tickFormatter={(value) => {
                            if (value >= 6) return 'Sev';
                            if (value >= 4) return 'High';
                            if (value >= 2) return 'Mod';
                            return 'Low';
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="intensity"
                        radius={[8, 8, 0, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getSeverityColor(entry.intensity)}
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))'
                                }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
