'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { SolarFlare, flareClassToValue } from '@/services/nasaApi';

interface Props {
    data: SolarFlare[];
}

export default function SolarFlareChart({ data }: Props) {
    // Transform data for the chart
    const chartData = data
        .map(flare => ({
            date: new Date(flare.beginTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: new Date(flare.beginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: flareClassToValue(flare.classType),
            classType: flare.classType,
            region: flare.activeRegionNum ? `AR ${flare.activeRegionNum}` : 'Unknown',
            fullDate: flare.beginTime
        }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
        .slice(-20); // Last 20 events for clarity

    const getClassColor = (classType: string) => {
        if (!classType) return '#94a3b8';
        const letter = classType.charAt(0).toUpperCase();
        if (letter === 'X') return '#ef4444';
        if (letter === 'M') return '#f97316';
        if (letter === 'C') return '#eab308';
        return '#94a3b8';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                    <p className="text-white font-orbitron font-bold text-lg mb-1">
                        Class {data.classType}
                    </p>
                    <p className="text-slate-400 text-xs font-inter">Region: {data.region}</p>
                    <p className="text-slate-400 text-xs font-inter">{data.date} at {data.time}</p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="w-full h-48 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-slate-500 font-inter">No solar flare data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-orbitron text-sm uppercase tracking-wider mb-4">
                Solar Flare Activity (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="flareGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                            if (value >= 10000) return 'X';
                            if (value >= 1000) return 'M';
                            if (value >= 100) return 'C';
                            return 'B';
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference lines for class thresholds */}
                    <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.3} />
                    <ReferenceLine y={1000} stroke="#f97316" strokeDasharray="5 5" strokeOpacity={0.3} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#flareGradient)"
                        dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
