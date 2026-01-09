'use client';

import React from 'react';
import ParallaxBackground from '@/components/missions/ParallaxBackground';
import MissionTimeline from '@/components/missions/MissionTimeline';

export default function MissionsPage() {
    return (
        <main className="relative min-h-screen bg-black overflow-x-hidden w-full">
            <ParallaxBackground />
            <MissionTimeline />
        </main>
    );
}
