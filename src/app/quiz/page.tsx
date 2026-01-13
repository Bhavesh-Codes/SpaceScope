// src/app/quiz/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CosmicQuiz from '@/components/CosmicQuiz';

export default function QuizPage() {
    const router = useRouter();

    // Handler to ensure the internal component can also trigger the menu
    const handleBack = () => {
        router.push('/?menu=open');
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            
            {/* --- FIXED RETURN BUTTON (Exact Shape & Color) --- */}
            <Link 
                href="/?menu=open" 
                className="fixed top-6 left-6 z-50 text-cyan-400/80 hover:text-cyan-300 inline-flex items-center gap-2 transition-colors text-sm uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 backdrop-blur-md bg-black/20"
            >
                &larr; 
            </Link>

            {/* Quiz Component */}
            {/* Note: Since we added the button above, you might want to hide 
                the internal back button inside CosmicQuiz to avoid duplicates. 
                But for now, both will work. */}
            <CosmicQuiz onBack={handleBack} />
        </main>
    );
}