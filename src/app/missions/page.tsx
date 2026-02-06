// ==========================================
// MISSIONS PAGE
// Route: /missions
// Shows: Space mission timeline and history
// ==========================================
'use client';

import React from 'react';
import Link from 'next/link';
import ParallaxBackground from '@/components/missions/ParallaxBackground';
import MissionTimeline from '@/components/missions/MissionTimeline';

export default function MissionsPage() {
    return (
        <main className="relative min-h-screen bg-black overflow-x-hidden w-full">

            {/* --- FIXED RETURN BUTTON --- */}
            <Link
                href="/?menu=open"
                className="fixed top-6 left-6 z-50 text-cyan-400/80 hover:text-cyan-300 inline-flex items-center gap-2 transition-colors text-sm uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 backdrop-blur-md bg-black/20"
            >
                &larr;
            </Link>

            <ParallaxBackground />
            <MissionTimeline />
        </main>
    );
}