'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MISSIONS, Mission } from '@/data/missions';
import MissionBento from './MissionBento';
import KineticHeader from './KineticHeader';
import MissionDetailModal from './MissionDetailModal';
import { motion } from 'framer-motion';

export default function MissionTimeline() {
    const [activeCategory, setActiveCategory] = useState<'All' | 'Past' | 'Current' | 'Future'>('All');
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    // Filter Logic
    const filteredMissions = useMemo(() => {
        if (activeCategory === 'All') return MISSIONS;
        return MISSIONS.filter(m => m.category === activeCategory);
    }, [activeCategory]);

    const categories: ('All' | 'Past' | 'Current' | 'Future')[] = ['All', 'Past', 'Current', 'Future'];

    // Handle History for Modal
    useEffect(() => {
        if (selectedMission) {
            // Push a new history entry when modal opens
            window.history.pushState({ modalOpen: true }, '', `#${selectedMission.id}`);
        }
    }, [selectedMission]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // If back button is pressed and we were in a modal (state indicates that or just checking if we have a mission selected)
            if (selectedMission) {
                setSelectedMission(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedMission]);

    const handleCloseModal = () => {
        // Just close the modal state directly. 
        // We avoid history.back() here because if the history state wasn't pushed correctly (or timing issues), 
        // back() might take the user to the previous page (Menu), which is frustrating.
        // Browser "Back" button will still work via the popstate listener.
        setSelectedMission(null);
    };

    return (
        <div className="relative z-10 w-full pb-32">

            {/* Filter Bar (Top Right) */}
            <div className="fixed top-6 right-6 z-50 flex p-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`relative px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 z-10 ${activeCategory === cat
                            ? 'text-black'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {activeCategory === cat && (
                            <motion.div
                                layoutId="activePill"
                                className="absolute inset-0 bg-cyan-400 rounded-full -z-10 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {cat}
                    </button>
                ))}
            </div>



            {/* Missions Grid */}
            <section className="container mx-auto px-4 min-h-screen">
                <div className="mb-16">
                    <KineticHeader
                        text={activeCategory === 'All' ? 'Space Time' : activeCategory === 'Past' ? 'Legends' : activeCategory === 'Current' ? 'Frontiers' : 'Horizons'}
                        align="center"
                        color={activeCategory === 'Past' ? 'text-slate-300' : activeCategory === 'Current' ? 'text-cyan-200' : activeCategory === 'Future' ? 'text-purple-300' : 'text-white'}
                    />
                </div>

                <div className="flex flex-col gap-8">
                    {filteredMissions.length > 0 ? (
                        filteredMissions.map((mission, index) => (
                            <MissionBento
                                key={mission.id}
                                mission={mission}
                                index={index}
                                onClick={setSelectedMission}
                            />
                        ))
                    ) : (
                        <div className="text-center text-slate-500 py-20 font-orbitron uppercase tracking-widest">
                            No missions found for this category.
                        </div>
                    )}
                </div>
            </section>

            {/* Detail Modal */}
            <MissionDetailModal
                mission={selectedMission}
                onClose={handleCloseModal}
            />

        </div>
    );
}