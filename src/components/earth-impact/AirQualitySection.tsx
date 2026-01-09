'use client';

import React from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { CloudFog, Info, AlertTriangle, Wind, Factory } from 'lucide-react';

export const AirQualitySection = () => {
    return (
        <section className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm group">
            <div className="absolute inset-0 bg-purple-900/5 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Visual Area */}
                <div className="lg:col-span-2 relative h-[550px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                    <ComparisonSlider
                        leftImage="/assets/earth-impact/air-clean.png"
                        rightImage="/assets/earth-impact/air-no2.png"
                        // Apply a custom style to the right image to make the NO2 pop more if needed, 
                        // but the asset itself is likely colored.
                        rightLabel="NO₂ Concentration"
                        leftLabel="Visual Reference"
                    />

                    <div className="absolute top-6 left-6 z-20">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-purple-400 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            SENTINEL-5P TROPOMI
                        </div>
                    </div>
                </div>

                {/* Data Panel */}
                <div className="p-8 flex flex-col justify-between h-full bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <CloudFog className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl font-orbitron font-bold text-white">Air Quality</h2>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Tracking invisible pollutants like Nitrogen Dioxide (NO₂) reveals the true environmental cost of industrialization and traffic.
                        </p>

                        <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5 mb-6 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full"></div>

                            <div className="flex items-start justify-between mb-2 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Concentration</span>
                                    <span className="text-3xl font-orbitron font-bold text-white">145 <span className="text-sm font-sans font-normal text-gray-400">μg/m³</span></span>
                                </div>
                                <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                            </div>

                            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="w-[85%] h-full bg-gradient-to-r from-purple-500 to-red-500 rounded-full" />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-medium uppercase tracking-wider">
                                <span className="text-emerald-500">Safe</span>
                                <span className="text-red-500">Hazardous</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Sources Detected</h4>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Factory className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-gray-300">Industrial Zone B</span>
                                        <span className="text-xs font-bold text-purple-400">62%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full">
                                        <div className="w-[62%] h-full bg-purple-500/50 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Wind className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-gray-300">Traffic Corridor</span>
                                        <span className="text-xs font-bold text-purple-400">38%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full">
                                        <div className="w-[38%] h-full bg-purple-500/50 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            <span>Updates hourly via Copernicus</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">LIVE</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
