'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mission } from '@/data/missions';
import Image from 'next/image';

interface MissionDetailModalProps {
    mission: Mission | null;
    onClose: () => void;
}

export default function MissionDetailModal({ mission, onClose }: MissionDetailModalProps) {
    if (!mission) return null;

    return (
        <AnimatePresence>
            {mission && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto"
                >
                    {/* Background Ambient */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full ${mission.color.replace('text-', 'bg-')} opacity-10 blur-[150px]`} />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500 opacity-5 blur-[150px]" />
                    </div>

                    <div className="min-h-full flex items-start justify-center p-4 py-8">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-7xl bg-slate-950/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col"
                        >
                            {/* 1. TOP NAV / HEADER - Now sticky */}
                            <div className="sticky top-0 w-full p-6 flex justify-end items-start z-50 bg-gradient-to-b from-slate-950/90 to-transparent">
                                <button
                                    onClick={onClose}
                                    className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/60 border border-white/10 hover:border-red-500/50 hover:bg-red-950/30 transition-all duration-300 backdrop-blur-md"
                                >
                                    <span className="text-sm font-orbitron tracking-widest text-slate-300 group-hover:text-white uppercase">Close</span>
                                    <span className="text-red-400 group-hover:rotate-90 transition-transform duration-300 text-lg">✕</span>
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col pb-12 px-6 md:px-16">

                                {/* 2. HERO SECTION */}
                                <div className="relative mb-16">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${mission.status === 'Success' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'}`}>
                                            {mission.status}
                                        </span>
                                        <span className="text-slate-500 font-orbitron tracking-widest text-sm uppercase">
                                            {mission.agency} / <span className="text-slate-300">{mission.year.split('–')[0]}</span>
                                        </span>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-white mb-6 uppercase tracking-tight shadow-cyan-500/20 drop-shadow-2xl break-words max-w-full">
                                        {mission.name}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-slate-300 font-light font-inter max-w-3xl leading-relaxed">
                                        {mission.description}
                                    </p>
                                </div>

                                {/* 3. STATS ROW */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                                    <StatCard label="Launch Date" value={mission.launchDate || 'N/A'} />
                                    <StatCard label="Rocket" value={mission.rocket || 'Unknown'} />
                                    <StatCard label="Orbit / Path" value={mission.target} />
                                    <StatCard label="Launch Site" value={mission.launchSite || 'Unknown'} />
                                </div>

                                {/* 4. CONTENT SPLIT */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                                    {/* Left: Mission Briefing */}
                                    <div className="lg:col-span-7">
                                        <h3 className="text-3xl font-orbitron font-bold text-white mb-8 border-l-4 border-cyan-500 pl-4">
                                            Mission Briefing
                                        </h3>
                                        <div className="prose prose-lg prose-invert text-slate-300 font-inter leading-8">
                                            <p>{mission.detailedDescription}</p>
                                        </div>

                                        {/* Image in content */}
                                        <div className="mt-12 relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 group">
                                            <Image
                                                src={mission.image}
                                                alt={mission.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-4 left-4">
                                                <p className="text-xs uppercase tracking-widest text-white/70">Mission Imagery</p>
                                            </div>
                                        </div>

                                        {/* Secondary Stats */}
                                        {mission.stats.length > 3 && (
                                            <div className="mt-12 grid grid-cols-2 gap-4">
                                                {mission.stats.filter(s => !s.label.includes('Launch') && !s.label.includes('Date')).map((stat, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                                        <p className="text-lg text-white font-orbitron">{stat.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Timeline */}
                                    <div className="lg:col-span-5">
                                        <h3 className="text-2xl font-orbitron font-bold text-white mb-8 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                            Mission Timeline
                                        </h3>

                                        <div className="relative border-l border-white/10 ml-3 space-y-12">
                                            {mission.timeline ? mission.timeline.map((event, idx) => (
                                                <div key={idx} className="relative pl-8 group">
                                                    {/* Dot */}
                                                    <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-cyan-400 group-hover:bg-cyan-950 transition-colors z-10" />

                                                    <span className="text-cyan-400 font-bold font-orbitron text-sm mb-1 block">
                                                        {event.year}
                                                    </span>
                                                    <h4 className="text-lg text-white font-bold mb-2 group-hover:text-cyan-200 transition-colors">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            )) : (
                                                <p className="pl-8 text-slate-500 italic">Timeline data unavailable.</p>
                                            )}
                                        </div>

                                        {/* Target Destination Card */}
                                        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 to-slate-900/50 border border-cyan-500/20 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-cyan-400 text-xs uppercase tracking-widest mb-2">Target Destination</p>
                                                <h4 className="text-4xl font-orbitron font-bold text-white mb-2">{mission.target}</h4>
                                                <p className="text-slate-400 text-sm">Primary celestial body or orbital region.</p>
                                            </div>
                                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl text-cyan-500 font-orbitron font-bold">
                                                ⌖
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function StatCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 group-hover:text-cyan-400 transition-colors">{label}</p>
            <p className="text-xl md:text-xl text-white font-orbitron font-medium break-words leading-tight" title={value}>{value}</p>
        </div>
    );
}