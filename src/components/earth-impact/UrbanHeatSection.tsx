'use client';

import React, { useState } from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Wind, TreeDeciduous, Building2, ArrowDownRight } from 'lucide-react';

export const UrbanHeatSection = () => {
    const [simulating, setSimulating] = useState(false);

    return (
        <section className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm group">
            <div className="absolute inset-0 bg-red-900/5 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Visual Area */}
                <div className="lg:col-span-2 relative h-[550px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                    <ComparisonSlider
                        leftImage="/assets/earth-impact/city-rgb.png"
                        rightImage="/assets/earth-impact/city-thermal.png"
                        leftLabel="Standard View"
                        rightLabel="Thermal Heatmap"
                    />

                    {/* Dynamic Labels */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full max-w-md"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="relative w-full h-full">
                            {/* Concrete Hotspot */}
                            <div className="absolute -top-20 right-10 flex flex-col items-center">
                                <div className="bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-lg mb-2">
                                    + 42°C
                                </div>
                                <div className="w-0.5 h-10 bg-red-500/50"></div>
                            </div>
                            {/* Park Coolspot */}
                            <div className="absolute top-20 left-10 flex flex-col items-center">
                                <div className="w-0.5 h-10 bg-emerald-500/50"></div>
                                <div className="bg-emerald-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-lg mt-2">
                                    + 28°C
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Data Panel */}
                <div className="p-8 flex flex-col justify-between h-full bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                <Thermometer className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl font-orbitron font-bold text-white">Heat Island</h2>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Urban surfaces absorb and re-emit sun heat more than natural landscapes. Satellites map these thermal anomalies to guide urban greening.
                        </p>

                        {/* Live Stat */}
                        <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Surface Temp</span>
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${simulating ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {simulating ? 'COOLING' : 'CRITICAL'}
                                </span>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-orbitron font-bold text-white">
                                    {simulating ? '34.2' : '38.5'}°C
                                </span>
                                <span className={`text-sm mb-1.5 font-bold ${simulating ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {simulating ? '- 4.3°C' : '+ 6.5°C'}
                                </span>
                            </div>
                        </div>

                        {/* Impact List */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 uppercase">Concrete Coverage</div>
                                    <div className="text-sm font-bold text-white">78% Zones</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <Wind className="w-5 h-5 text-blue-400" />
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 uppercase">Airflow Blockage</div>
                                    <div className="text-sm font-bold text-white">High</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <button
                        onClick={() => setSimulating(!simulating)}
                        className={`group w-full py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 mt-6 ${simulating
                                ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400'
                                : 'bg-white/5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                            }`}
                    >
                        {simulating ? (
                            <>
                                <TreeDeciduous className="w-4 h-4" />
                                GREEN ROOFS ACTIVE
                            </>
                        ) : (
                            <>
                                <ArrowDownRight className="w-4 h-4" />
                                SIMULATE GREENING
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {simulating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 text-center text-xs text-emerald-400/70">
                                    Projected energy savings: <strong>14.5%</strong>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
