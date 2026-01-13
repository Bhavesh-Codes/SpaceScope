// src/app/celestial-events/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CelestialEvents from '@/components/CelestialEvents';

export default function CelestialEventsPage() {
    const router = useRouter();

    // Handler for the internal back button inside the component
    const handleBack = () => {
        router.push('/?menu=open');
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            
            {/* 1. FIXED 'RETURN TO ORBIT' BUTTON */}
            {/* Added: fixed positioning, z-index, backdrop blur, and the ?menu=open query */}
            <Link 
                href="/?menu=open" 
                className="fixed top-6 left-6 z-50 text-cyan-400/80 hover:text-cyan-300 inline-flex items-center gap-2 transition-colors text-sm uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 backdrop-blur-md bg-black/20"
            >
                &larr; 
            </Link>

            {/* 2. MAIN COMPONENT */}
            {/* Updated onBack to also trigger the 'Menu Open' logic if clicked */}
            <CelestialEvents onBack={handleBack} />
        </main>
    );
}