import React, { useEffect, useRef } from 'react';
import { CelestialEvent, EVENT_COLORS, EVENT_ICONS } from '@/data/celestialEvents';
import { motion } from 'framer-motion';
import { X, Info, Globe, Clock, BookOpen } from 'lucide-react';
import { gsap } from 'gsap';

interface EventDetailsProps {
    event: CelestialEvent;
    onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Parallax effect on scroll inside the modal logic 
        // Since this is a modal, we might just do entry animations or subtle mouse move parallax
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                y: 100,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out"
            });

            // Simple hover parallax for the image container
            if (imageRef.current) {
                imageRef.current.addEventListener('mousemove', (e) => {
                    const { width, height, left, top } = imageRef.current!.getBoundingClientRect();
                    const x = (e.clientX - left) / width - 0.5;
                    const y = (e.clientY - top) / height - 0.5;

                    gsap.to(imageRef.current, {
                        rotationY: x * 10,
                        rotationX: -y * 10,
                        duration: 0.5
                    });
                });

                imageRef.current.addEventListener('mouseleave', () => {
                    gsap.to(imageRef.current, {
                        rotationY: 0,
                        rotationX: 0,
                        duration: 0.5
                    });
                });
            }

        });
        return () => ctx.revert();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
        >
            <div className="w-full max-w-6xl h-[90vh] bg-slate-950/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Side: Visuals & Parallax Container */}
                <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden bg-black flex items-center justify-center p-8">
                    <div
                        ref={imageRef}
                        className="relative w-full aspect-square max-w-md rounded-full shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center perspective-1000"
                        style={{ background: `radial-gradient(circle at 30% 30%, ${EVENT_COLORS[event.type]}, transparent)` }}
                    >
                        <div className="absolute inset-4 rounded-full bg-black/80 backdrop-blur-sm" />
                        <span className="text-9xl relative z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                            {EVENT_ICONS[event.type]}
                        </span>
                    </div>

                    {/* Decorative background grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar p-8 md:p-12 bg-slate-900/50">
                    <div ref={contentRef}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono mb-6 text-cyan-400">
                            {event.id.toUpperCase()}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="flex items-center gap-2 text-slate-300 text-sm bg-black/40 px-4 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                {event.date} • {event.time}
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm bg-black/40 px-4 py-2 rounded-lg">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                {event.visibilityRegion}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                                    <Info className="w-5 h-5 text-purple-400" /> Event Overview
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-lg">
                                    {event.description}
                                </p>
                            </section>

                            <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                                    <BookOpen className="w-5 h-5 text-yellow-400" /> The Science
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {event.scientificExplanation}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">Visibility Analysis</h3>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${event.visibilityRadius > 100 ? 100 : (event.visibilityRadius / 180) * 100}%`,
                                            backgroundColor: EVENT_COLORS[event.type]
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-right">
                                    Visibility Index: {event.visibilityRadius} / 180
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
