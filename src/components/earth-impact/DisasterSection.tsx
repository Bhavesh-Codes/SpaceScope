'use client';

import React from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { AlertTriangle, CloudRain, ShieldAlert } from 'lucide-react';

export const DisasterSection = () => {
    return (
        <section className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm group">
            <div className="absolute inset-0 bg-blue-900/5 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Visualization Area */}
                <div className="lg:col-span-2 relative h-[550px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                    <ComparisonSlider
                        leftImage="/assets/earth-impact/flood-before.png"
                        rightImage="/assets/earth-impact/flood-after.png"
                        leftLabel="Before Event"
                        rightLabel="During Flood"
                    />
                </div>

                {/* Data Panel */}
                <div className="p-8 flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <ShieldAlert className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl font-orbitron font-bold text-white">Disaster Response</h2>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Comparing satellite imagery before and during flood events allows authorities to instantly pinpoint submerged roads and plan evacuation routes.
                        </p>

                        <div className="space-y-3">
                            <div className="w-full p-4 rounded-xl border bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center gap-4">
                                <div className="p-2 rounded-full bg-blue-500 text-white">
                                    <CloudRain className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Flood Impact Analysis</div>
                                    <div className="text-[10px] opacity-70">Direct Visual Comparison</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Crucial Insight</span>
                        </div>
                        <p className="text-xs text-orange-200/80 leading-relaxed">
                            Immediate change detection helps prioritize resources to the most severely affected areas.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
