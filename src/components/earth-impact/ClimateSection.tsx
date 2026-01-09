'use client';

import React, { useState } from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { motion } from 'framer-motion';
import { Snowflake, Waves, Info, ArrowUpRight } from 'lucide-react';

export const ClimateSection = () => {
    const [activeTab, setActiveTab] = useState<'glacier' | 'seaLevel'>('glacier');

    const tabs = {
        glacier: {
            id: 'glacier',
            label: 'Glacier Retreat',
            icon: Snowflake,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            accent: 'border-cyan-500/30',
            description: 'Tracking the rapid decline of global ice sheets. Satellite imagery from 1980 to present reveals a dramatic loss of glacial mass, a key indicator of climate velocity.',
            leftLabel: '1980 (Historical)',
            rightLabel: '2025 (Present)',
            leftImage: '/assets/earth-impact/glacier-1980.png',
            rightImage: '/assets/earth-impact/glacier-2025.png',
            stat: '-1.2m / year',
            statLabel: 'Average Ice Loss'
        },
        seaLevel: {
            id: 'seaLevel',
            label: 'Sea-Level Rise',
            icon: Waves,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            accent: 'border-blue-500/30',
            description: 'Simulating the impact of rising oceans on coastal communities. Data-driven projections help visualize potential inundation zones under 2°C warming scenarios.',
            leftLabel: 'Current Coastline',
            rightLabel: 'Projected Risk (+1m)',
            leftImage: '/assets/earth-impact/coastal-now.png',
            rightImage: '/assets/earth-impact/coastal-risk.png',
            stat: '+3.4mm / year',
            statLabel: 'Global Mean Rise'
        }
    };

    const currentTab = tabs[activeTab];

    return (
        <section className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm">

            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row border-b border-white/10">
                <div className="p-8 flex-1">
                    <h2 className="text-3xl font-orbitron font-bold text-white mb-2 flex items-center gap-3">
                        Climate & Environment
                        <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse delay-75" />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse delay-150" />
                        </div>
                    </h2>
                    <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                        Satellites provide an unbiased, global record of our changing planet, from shrinking cryospheres to rising tides.
                    </p>
                </div>

                <div className="flex md:border-l border-white/10">
                    {Object.values(tabs).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none flex flex-col items-center justify-center p-6 min-w-[140px] transition-all duration-300 relative ${activeTab === tab.id
                                ? 'bg-white/5 text-white'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 mb-2 ${activeTab === tab.id ? tab.color : 'opacity-50'}`} />
                            <span className="text-xs font-medium tracking-wider uppercase">{tab.label}</span>

                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="climateTab"
                                    className={`absolute inset-x-0 bottom-0 h-1 ${tab.color.replace('text-', 'bg-')}`}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Visualization */}
                <div className="lg:col-span-2 relative h-[550px] bg-black/50 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                    {/* 
                         Seamless switching: We keep both sliders mounted and transition their opacity.
                         This prevents the brief "white flash" or empty state when unmounting one and mounting the other,
                         as the images remain preloaded in the DOM.
                     */}
                    {Object.values(tabs).map((tab) => (
                        <div
                            key={tab.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${activeTab === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            <ComparisonSlider
                                leftImage={tab.leftImage}
                                rightImage={tab.rightImage}
                                leftLabel={tab.leftLabel}
                                rightLabel={tab.rightLabel}
                            />
                        </div>
                    ))}

                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs text-white/70">
                        <Info className="w-3 h-3" />
                        <span>Analysis based on Landsat & Sentinel Data</span>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="p-8 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 ${currentTab.bg} ${currentTab.color} border ${currentTab.accent}`}>
                            <currentTab.icon className="w-3 h-3" />
                            {currentTab.label} Status
                        </div>

                        <h3 className="text-2xl text-white font-bold mb-4">
                            {activeTab === 'glacier' ? 'The Big Melt' : 'Rising Tides'}
                        </h3>

                        <p className="text-gray-400 leading-relaxed mb-8">
                            {currentTab.description}
                        </p>

                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{currentTab.statLabel}</span>
                                <ArrowUpRight className={`w-4 h-4 ${activeTab === 'glacier' ? 'text-red-400 rotate-180' : 'text-orange-400'}`} />
                            </div>
                            <div className="text-3xl font-orbitron font-bold text-white">
                                {currentTab.stat}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            VIEW FULL REPORT <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
