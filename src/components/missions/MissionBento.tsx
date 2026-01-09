'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mission } from '@/data/missions';
import Image from 'next/image';

export default function MissionBento({ mission, index }: { mission: Mission, index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-7xl mx-auto mb-32 p-4`}
        >
            {/* Large Image Block */}
            <div className={`md:col-span-8 relative h-[500px] rounded-3xl overflow-hidden group border-2 border-white/10 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                <Image
                    src={mission.image}
                    alt={mission.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6">
                    <h3 className={`text-4xl font-orbitron font-bold text-white mb-2 shadow-black drop-shadow-lg`}>{mission.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/20`}>
                        {mission.status}
                    </span>
                </div>
            </div>

            {/* Info Blocks Side */}
            <div className={`md:col-span-4 grid grid-rows-3 gap-4 h-[500px] ${isEven ? 'md:order-2' : 'md:order-1'}`}>

                {/* Year & Agency Block */}
                <div className="row-span-1 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col justify-center hover:bg-slate-800/50 transition-colors">
                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Mission Year</p>
                    <h4 className={`text-5xl font-orbitron font-bold ${mission.color}`}>{mission.year}</h4>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-white font-bold">{mission.agency}</span>
                        <div className={`w-2 h-2 rounded-full ${mission.status === 'Success' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    </div>
                </div>

                {/* Description Block */}
                <div className="row-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${mission.color.replace('text-', 'bg-')}`} />
                    <h5 className="text-xl font-orbitron text-white mb-4">Mission Profile</h5>
                    <p className="text-slate-300 font-inter leading-relaxed">{mission.description}</p>
                    <p className="text-slate-400 font-inter text-sm mt-4 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {mission.details}
                    </p>

                    {/* Tech Deco */}
                    <div className="absolute bottom-4 right-4 opacity-20">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
                            <circle cx="20" cy="20" r="8" fill="white" />
                        </svg>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
