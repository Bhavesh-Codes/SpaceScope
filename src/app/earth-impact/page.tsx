import React from 'react';
import Link from 'next/link';
import { CropHealthSection } from '@/components/earth-impact/CropHealthSection';
import { UrbanHeatSection } from '@/components/earth-impact/UrbanHeatSection';
import { DisasterSection } from '@/components/earth-impact/DisasterSection';
import { ClimateSection } from '@/components/earth-impact/ClimateSection';
import { AirQualitySection } from '@/components/earth-impact/AirQualitySection';

export default function EarthImpactPage() {
    return (
        <main className="min-h-screen bg-black text-white p-6 relative overflow-hidden font-sans">
            
            {/* 1. FIXED RETURN BUTTON */}
            <Link 
                href="/?menu=open" 
                className="fixed top-6 left-6 z-50 text-cyan-400/80 hover:text-cyan-300 inline-flex items-center gap-2 transition-colors text-sm uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 backdrop-blur-md bg-black/20"
            >
                &larr; 
            </Link>

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black -z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none" />

            <header className="mb-16 z-10 relative max-w-4xl mx-auto text-center pt-10">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-cyan-100 to-blue-500 font-orbitron tracking-tight mb-6 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    Earth Impact
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    Satellites do more than just observe the stars—they are our silent guardians, constantly monitoring the heartbeat of our planet.
                </p>
                <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm border-t border-white/10 pt-4">
                    Explore the invisible data layers that help us solve critical challenges, from food security to disaster response.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-24 max-w-6xl mx-auto pb-20">

                {/* Story Section 1: Agriculture */}
                <div className="relative">
                    <div className="absolute -left-20 top-0 text-[10rem] font-bold text-white/[0.02] -z-10 hidden xl:block">01</div>
                    <div className="mb-8 pl-4 border-l-2 border-emerald-500">
                        <h2 className="text-3xl font-bold text-white mb-2">Feeding the Future</h2>
                        <p className="text-gray-400 max-w-xl">
                            Farmers use infrared data to see crop stress weeks before it's visible to the human eye.
                            This allows for precise irrigation and fertilizer use, saving resources and boosting yields.
                        </p>
                    </div>
                    <CropHealthSection />
                </div>

                {/* Story Section 2: Urban Planning */}
                <div className="relative">
                    <div className="absolute -right-20 top-0 text-[10rem] font-bold text-white/[0.02] -z-10 hidden xl:block text-right">02</div>
                    <div className="mb-8 pl-4 border-l-2 border-red-500">
                        <h2 className="text-3xl font-bold text-white mb-2">Cooling Our Cities</h2>
                        <p className="text-gray-400 max-w-xl">
                            Concrete absorbs heat, creating "Urban Heat Islands" that endanger public health.
                            Thermal sensors identify these hotspots, helping planners plant trees and install cool roofs where they are needed most.
                        </p>
                    </div>
                    <UrbanHeatSection />
                </div>

                {/* Story Section 3: Disaster Response */}
                <div className="relative">
                    <div className="absolute -left-20 top-0 text-[10rem] font-bold text-white/[0.02] -z-10 hidden xl:block">03</div>
                    <div className="mb-8 pl-4 border-l-2 border-blue-500">
                        <h2 className="text-3xl font-bold text-white mb-2">Seeing Through the Storm</h2>
                        <p className="text-gray-400 max-w-xl">
                            During floods, clouds often block the view for typical cameras.
                            Synthetic Aperture Radar (SAR) pierces through clouds and rain to map floodwaters day or night, guiding rescue teams to safe routes.
                        </p>
                    </div>
                    <DisasterSection />
                </div>

                {/* Story Section 4: Climate Monitoring */}
                <div className="relative">
                    <div className="absolute -right-20 top-0 text-[10rem] font-bold text-white/[0.02] -z-10 hidden xl:block text-right">04</div>
                    <div className="mb-8 pl-4 border-l-2 border-cyan-500">
                        <h2 className="text-3xl font-bold text-white mb-2">The Pulse of the Planet</h2>
                        <p className="text-gray-400 max-w-xl">
                            From the retreating ice sheets to the invisible particles in our air, satellites provide the only global, unbiased record of our changing climate.
                        </p>
                    </div>
                    <ClimateSection />
                </div>

                {/* Story Section 5: Air Quality */}
                <div className="relative">
                    <div className="absolute -left-20 top-0 text-[10rem] font-bold text-white/[0.02] -z-10 hidden xl:block">05</div>
                    <div className="mb-8 pl-4 border-l-2 border-purple-500">
                        <h2 className="text-3xl font-bold text-white mb-2">Breathing Easy?</h2>
                        <p className="text-gray-400 max-w-xl">
                            Air pollution is often invisible. Satellites map NO₂ and particulate matter levels across cities, helping us identify major pollution sources and improve public health.
                        </p>
                    </div>
                    <AirQualitySection />
                </div>

            </div>
        </main>
    );
}