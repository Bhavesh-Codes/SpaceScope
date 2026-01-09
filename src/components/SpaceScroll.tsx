'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, Zap, BookOpen, AlertTriangle } from 'lucide-react';

const FRAME_COUNT = 240;

export default function SpaceScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Scroll progress for the entire 500vh container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Current frame index mapped from 0 to FRAME_COUNT - 1
    const currentIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // Text Opacity Transforms
    // 0% -> Fade Out early
    const opacityText1 = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

    // 25% -> Fade In then Out
    const opacityText2 = useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0, 1, 0]);

    // 50% -> Fade In then Out
    const opacityText3 = useTransform(scrollYProgress, [0.40, 0.50, 0.60], [0, 1, 0]);

    // 75% -> Fade In then Out
    const opacityText4 = useTransform(scrollYProgress, [0.65, 0.75, 0.85], [0, 1, 0]);

    // HUD: Appear at very end
    const opacityHUD = useTransform(scrollYProgress, [0.95, 0.99], [0, 1]);
    const pointerEventsHUD = useTransform(scrollYProgress, (v) => v > 0.98 ? 'auto' : 'none');

    // Preload Images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadCounter = 0;

        const onImageLoadOrError = () => {
            loadCounter++;
            setLoadedCount(prev => prev + 1); // Use functional update for safety
            if (loadCounter >= FRAME_COUNT) {
                setIsLoading(false);
            }
        };

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            // Pad index with zeros: 001, 002, ... 300
            const frameStr = (i + 1).toString().padStart(3, '0');
            img.src = `/sequence/ezgif-frame-${frameStr}.jpg`;

            img.onload = onImageLoadOrError;
            img.onerror = onImageLoadOrError;

            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Draw to Canvas
    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure resizing to full screen
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(index)));
        const img = images[frameIndex];

        // Clear canvas always
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Black background default

        if (img && img.complete && img.naturalWidth > 0) {
            // Object-fit: cover logic
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);

            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.drawImage(img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
        } else {
            // Fallback rendering if image missing (for debugging/development)
            ctx.fillStyle = '#0b0d17';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#1e293b';
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`Frame ${frameIndex + 1} / ${FRAME_COUNT}`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`(Place images in public/sequence/frame_XXX.jpg)`, canvas.width / 2, canvas.height / 2 + 30);
        }
    };

    // Subscribe to scroll changes to render frames
    useMotionValueEvent(currentIndex, "change", (latest) => {
        if (!isLoading) {
            requestAnimationFrame(() => renderFrame(latest));
        }
    });

    // Initial render when loading finishes or window resizes
    useEffect(() => {
        const handleResize = () => {
            if (!isLoading) renderFrame(currentIndex.get());
        };

        window.addEventListener('resize', handleResize);
        if (!isLoading) renderFrame(currentIndex.get());

        return () => window.removeEventListener('resize', handleResize);
    }, [isLoading, currentIndex]); // Add dependencies

    // Prevent scrolling while loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; // or ''
        }
        return () => { document.body.style.overflow = 'auto'; }
    }, [isLoading]);

    return (
        <div ref={containerRef} className="relative h-[500vh] w-full bg-space-black">

            {/* Canvas Sticky Layer */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="block w-full h-full" />

                {/* Text Layers */}
                {/* 0% Start */}
                <motion.div style={{ opacity: opacityText1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300">
                    <div className="text-center px-4">
                        <h1 className="text-6xl md:text-9xl font-bold font-orbitron tracking-tighter text-cyan-50 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                            SpaceScope
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-400 font-inter font-light tracking-[0.6em] mt-6 ml-2 uppercase">
                            Explore the Universe
                        </p>
                    </div>
                </motion.div>

                {/* 25% Zoom */}
                <motion.div style={{ opacity: opacityText2 }} className="absolute inset-0 flex items-center justify-start pl-10 md:pl-32 pointer-events-none z-10">
                    <div className="max-w-xl text-left">
                        <h2 className="text-4xl md:text-7xl font-bold font-orbitron mb-4 text-cyan-50">Beyond the<br />Event Horizon</h2>
                        <p className="text-xl md:text-2xl text-cyan-200/80 font-inter font-light">Journey through the celestial void where stars are born.</p>
                    </div>
                </motion.div>

                {/* 50% Zoom */}
                <motion.div style={{ opacity: opacityText3 }} className="absolute inset-0 flex items-center justify-end pr-10 md:pr-32 pointer-events-none z-10">
                    <div className="text-right max-w-xl">
                        <h2 className="text-4xl md:text-7xl font-bold font-orbitron mb-4 text-cyan-50">Data from<br />the Stars</h2>
                        <p className="text-xl md:text-2xl text-cyan-200/80 font-inter font-light">Streaming millions of data points from deep space satellites.</p>
                    </div>
                </motion.div>

                {/* 75% Zoom */}
                <motion.div style={{ opacity: opacityText4 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center">
                        <h2 className="text-5xl md:text-8xl font-bold font-orbitron mb-6 text-cyan-50">Solving Problems<br />on Earth</h2>
                        <p className="text-2xl text-slate-300 font-inter font-light">Using orbital perspective to heal our planet.</p>
                    </div>
                </motion.div>

                {/* HUD (>98%) */}
                <motion.div
                    style={{ opacity: opacityHUD, pointerEvents: pointerEventsHUD }}
                    className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md"
                >
                    <OrbitalHUD />
                </motion.div>
            </div>

            {/* Loading Screen Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-[100] bg-space-black flex flex-col items-center justify-center text-cyan-500"
                    >
                        <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-8 relative">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(loadedCount / FRAME_COUNT) * 100}%` }}
                            />
                        </div>
                        <h3 className="text-xl font-orbitron tracking-widest animate-pulse">
                            SYSTEM INITIALIZING... {Math.round((loadedCount / FRAME_COUNT) * 100)}%
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function OrbitalHUD() {
    const buttons = [
        { label: "Celestial Events", icon: Rocket, color: "text-purple-400", border: "border-purple-500/30", hoverBorder: "group-hover:border-purple-400" },
        { label: "Cosmic Weather", icon: Zap, color: "text-yellow-400", border: "border-yellow-500/30", hoverBorder: "group-hover:border-yellow-400" },
        { label: "Missions", icon: Globe, color: "text-blue-400", border: "border-blue-500/30", hoverBorder: "group-hover:border-blue-400" },
        { label: "Learning Zone", icon: BookOpen, color: "text-green-400", border: "border-green-500/30", hoverBorder: "group-hover:border-green-400" },
        { label: "Earth Impact", icon: AlertTriangle, color: "text-red-400", border: "border-red-500/30", hoverBorder: "group-hover:border-red-400" },
    ];

    return (
        <div className="flex flex-col items-center gap-12 max-w-5xl mx-auto px-4">
            <h2 className="text-4xl font-orbitron text-cyan-50 tracking-widest uppercase border-b border-cyan-900 pb-4">Orbital Command</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        className={`group relative flex flex-col items-center justify-center h-48 w-full md:w-40 lg:w-40 rounded-2xl border ${btn.border} bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:bg-slate-800 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] ${btn.hoverBorder}`}
                    >
                        <btn.icon className={`w-10 h-10 mb-4 ${btn.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                        <span className="font-orbitron font-bold text-xs md:text-sm text-slate-400 group-hover:text-white uppercase tracking-wider text-center px-2">{btn.label}</span>

                        {/* Interactive glow effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 bg-gradient-to-b from-white/10 to-transparent transition-opacity duration-300" />
                    </button>
                ))}
            </div>
        </div>
    )
}
