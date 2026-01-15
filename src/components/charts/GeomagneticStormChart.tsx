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
import { GeomagneticStorm, kpToGScale } from '@/services/nasaApi';

interface Props {
    data: GeomagneticStorm[];
}

export default function GeomagneticStormChart({ data }: Props) {
    // Transform data for the chart - extract Kp indices
    const chartData = data
        .flatMap(storm => {
            const kpReadings = storm.allKpIndex || [];
            return kpReadings.map(kp => ({
                date: new Date(kp.observedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: new Date(kp.observedTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                kpIndex: kp.kpIndex,
                gScale: kpToGScale(kp.kpIndex),
                source: kp.source,
                fullDate: kp.observedTime
            }));
        })
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
        .slice(-30); // Last 30 readings

    const getKpColor = (kp: number) => {
        if (kp >= 8) return '#ef4444';
        if (kp >= 6) return '#f97316';
        if (kp >= 5) return '#eab308';
        return '#22c55e';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                    <p className="text-white font-orbitron font-bold text-lg mb-1">
                        Kp {data.kpIndex} ({data.gScale})
                    </p>
                    <p className="text-slate-400 text-xs font-inter">Source: {data.source}</p>
                    <p className="text-slate-400 text-xs font-inter">{data.date} at {data.time}</p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="w-full h-48 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-slate-500 font-inter">No geomagnetic storm data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
            <h3 className="text-white font-orbitron text-sm uppercase tracking-wider mb-4">
                Geomagnetic Activity - Kp Index (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
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
                        domain={[0, 9]}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickFormatter={(value) => `Kp${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference lines for G-scale thresholds */}
                    <ReferenceLine y={9} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'G5', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={7} stroke="#f97316" strokeDasharray="5 5" strokeOpacity={0.3} label={{ value: 'G3', fill: '#f97316', fontSize: 10 }} />
                    <ReferenceLine y={5} stroke="#eab308" strokeDasharray="5 5" strokeOpacity={0.3} label={{ value: 'G1', fill: '#eab308', fontSize: 10 }} />
                    <Area
                        type="monotone"
                        dataKey="kpIndex"
                        stroke="#eab308"
                        strokeWidth={2}
                        fill="url(#kpGradient)"
                        dot={{ fill: '#eab308', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#eab308', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
