'use client';

import React, { useState } from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Droplets, Activity, Sun, ScanLine } from 'lucide-react';

export const CropHealthSection = () => {
    const [activeLayer, setActiveLayer] = useState<'infrared' | 'ndvi'>('ndvi');

    const layers = {
        infrared: {
            image: '/assets/earth-impact/crop-ir.png',
            label: 'Infrared (NIR)',
            description: 'Reflects cell structure density. Bright red indicates vigorous growth invisible to human eyes.'
        },
        ndvi: {
            image: '/assets/earth-impact/crop-ndvi.png',
            label: 'NDVI Index',
            description: 'Normalized Difference Vegetation Index. Quantifies plant greenness and biomass.'
        }
    };

    return (
        <section className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm group">
            <div className="absolute inset-0 bg-emerald-900/5 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Visual */}
                <div className="lg:col-span-2 relative h-[550px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                    <ComparisonSlider
                        leftImage="/assets/earth-impact/crop-true.png"
                        rightImage={layers[activeLayer].image}
                        leftLabel="True Color (RGB)"
                        rightLabel={layers[activeLayer].label}
                    />

                    {/* Simulated Pulse Overlay for Problem Zones (Always active for NDVI) */}
                    <AnimatePresence>
                        {activeLayer === 'ndvi' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
                            >
                                {/* Simulated Data Points */}
                                <div className="absolute top-[30%] left-[40%]">
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                </div>
                                <div className="absolute bottom-[40%] right-[30%]">
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Data Panel */}
                <div className="p-8 flex flex-col justify-between h-full bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Sprout className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl font-orbitron font-bold text-white">Harvest Intelligence</h2>
                        </div>

                        {/* Control Module - Moved here */}
                        <div className="mb-8">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ScanLine className="w-3 h-3" /> Sensor Configuration
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setActiveLayer('infrared')}
                                    className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeLayer === 'infrared'
                                            ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    Infrared
                                </button>
                                <button
                                    onClick={() => setActiveLayer('ndvi')}
                                    className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeLayer === 'ndvi'
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    NDVI Index
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-4">
                                {/* Moisture Metric */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <Droplets className="w-3 h-3 text-blue-400" /> Soil Moisture
                                        </span>
                                        <span className="text-white font-mono">32%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <div className="text-[10px] text-red-400 mt-1 font-medium">CRITICAL DEFICIT IN SECTOR 4</div>
                                </div>

                                {/* Chlorophyll Metric */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <Sun className="w-3 h-3 text-yellow-400" /> Chlorophyll Content
                                        </span>
                                        <span className="text-white font-mono">High</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 0.4 }}
                                            className="h-full bg-yellow-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spectral Signature */}
                        <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Spectral Anomaly</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed mb-3">
                                Multispectral sensors detected a <span className="text-white font-bold">15% drop in Near-Infrared reflectance</span> in the southern field block.
                            </p>
                            <div className="h-16 w-full bg-black/40 rounded flex items-end gap-1 p-2 pb-0">
                                {/* Simulated Histogram */}
                                {[40, 60, 35, 70, 50, 80, 45, 30, 60, 90, 55, 40].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                        className={`flex-1 rounded-t-sm ${i > 7 ? 'bg-red-500/80' : 'bg-emerald-500/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
