// src/app/cosmic-weather/page.tsx
'use client';

import React from 'react';
import CosmicWeatherWidget from '@/components/CosmicWeatherWidget';
import Link from 'next/link';

export default function CosmicWeatherPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            
            {/* 1. THE FIXED BUTTON */}
            <Link 
                href="/?menu=open" 
                className="fixed top-6 left-6 z-50 text-cyan-400/80 hover:text-cyan-300 inline-flex items-center gap-2 transition-colors text-sm uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 backdrop-blur-md bg-black/20"
            >
                &larr; 
            </Link>

            {/* 2. Your Widget (You can ignore the internal onBack if you use the button above) */}
            <CosmicWeatherWidget onBack={() => {}} />
            
        </main>
    );
}   