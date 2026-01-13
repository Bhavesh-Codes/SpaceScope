'use client';

import React from 'react';
import { MISSIONS } from '@/data/missions';
import MissionBento from './MissionBento';
import KineticHeader from './KineticHeader';

export default function MissionTimeline() {
    // Sorting Logic:
    // Legends: Pre-2000 (Sputnik, Apollo, Voyager, etc.)
    // Frontiers: 2000-2024 (ISS, Mars Rovers, Chandryaan, JWST)
    // Horizons: 2025+ (Future)

    const getYear = (y: string) => parseInt(y) || 0;

    const pastMissions = MISSIONS.filter(m => getYear(m.year) < 1995);
    const presentMissions = MISSIONS.filter(m => getYear(m.year) >= 1995 && getYear(m.year) <= 2024);
    const futureMissions = MISSIONS.filter(m => getYear(m.year) > 2024);

    return (
        <div className="relative z-10 w-full pb-32">

            <div className="fixed top-6 left-6 z-50">
    
        
    
</div>

            {/* Intro Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-4">
                <KineticHeader text="Cosmic Archive" subtext="The History of Exploration" />
                <div className="animate-bounce mt-10">
                    <p className="text-cyan-400 font-orbitron text-sm uppercase tracking-widest">Scroll to Explore</p>
                    <div className="w-[1px] h-16 bg-cyan-500 mx-auto mt-2" />
                </div>
            </section>

            {/* Past Era */}
            <section className="container mx-auto px-4">
                <KineticHeader text="Legends" subtext="Pioneering Steps" align="left" color="text-slate-300" />
                {pastMissions.map((mission, index) => (
                    <MissionBento key={mission.id} mission={mission} index={index} />
                ))}
            </section>

            {/* Present Era */}
            <section className="container mx-auto px-4 mt-24">
                <KineticHeader text="Frontiers" subtext="Current Operations" align="right" color="text-cyan-200" />
                {presentMissions.map((mission, index) => (
                    <MissionBento key={mission.id} mission={mission} index={index + pastMissions.length} />
                ))}
            </section>

            {/* Future Era */}
            <section className="container mx-auto px-4 mt-24">
                <KineticHeader text="Horizons" subtext="The Next Giant Leap" align="center" color="text-purple-300" />
                {futureMissions.map((mission, index) => (
                    <MissionBento key={mission.id} mission={mission} index={index + pastMissions.length + presentMissions.length} />
                ))}
            </section>

            {/* Footer / Back Navigation */}
            

        </div>
    );
}
