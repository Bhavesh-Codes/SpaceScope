'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, Zap, BookOpen, AlertTriangle, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Initialize Supabase Client for auth checks
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FRAME_COUNT = 192;

export default function SpaceScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Optimization: Store images in Ref to avoid React re-renders on every frame access
    const imagesRef = useRef<HTMLImageElement[]>([]);

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
    const opacityText1 = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const opacityText2 = useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0, 1, 0]);
    const opacityText3 = useTransform(scrollYProgress, [0.40, 0.50, 0.60], [0, 1, 0]);
    const opacityText4 = useTransform(scrollYProgress, [0.65, 0.75, 0.85], [0, 1, 0]);

    // HUD: Appear at very end
    const opacityHUD = useTransform(scrollYProgress, [0.95, 0.99], [0, 1]);
    const pointerEventsHUD = useTransform(scrollYProgress, (v) => v > 0.98 ? 'auto' : 'none');

    useEffect(() => {
        // Only run this logic once the loading screen is gone
        if (!isLoading) {
            // Check if URL has ?menu=open
            const params = new URLSearchParams(window.location.search);
            if (params.get('menu') === 'open') {
                // Scroll instantly to the bottom where the HUD is
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'instant'
                });
            }
        }
    }, [isLoading]);

    // Preload Images with Debugging
    useEffect(() => {
        let isMounted = true;
        const loadedImages: HTMLImageElement[] = [];
        // Initialize array with explicit size to preserve order
        for (let i = 0; i < FRAME_COUNT; i++) loadedImages.push(null as any);

        let loadCounter = 0;
        let failCounter = 0;

        const onImageLoadOrError = () => {
            if (!isMounted) return;
            loadCounter++;

            // Update state on every frame for smoother feedback
            setLoadedCount(loadCounter);

            if (loadCounter >= FRAME_COUNT) {
                if (failCounter > 0) {
                    console.warn(`⚠️ Finished loading with ${failCounter} failed images.`);
                } else {
                    console.log('✅ All space frames loaded successfully!');
                }
                setIsLoading(false);
            }
        };

        console.log('🚀 Starting space sequence load...');

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            const frameStr = (i + 1).toString().padStart(4, '0');

            // NOTE: The leading slash is required for Next.js public folder
            // URL will look like: https://your-site.com/sequence1/0001.webp
            img.src = `/sequence1/${frameStr}.webp`;

            img.onload = () => {
                if (!isMounted) return;
                loadedImages[i] = img; // Ensure correct index
                onImageLoadOrError();
            };

            img.onerror = (e) => {
                if (!isMounted) return;
                failCounter++;
                // DEBUG: This will print the exact path that failed to the console
                console.error(`❌ Failed to load frame ${i + 1}:`, img.src);
                onImageLoadOrError();
            };
        }
        imagesRef.current = loadedImages;

        return () => {
            isMounted = false;
        };
    }, []);

    // Optimized Render Function
    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        if (!ctx) return;

        // Calculate frame index safely
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(index)));
        const img = imagesRef.current[frameIndex];

        if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';

            // Object-fit: cover logic
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = img.width;
            const imgHeight = img.height;

            const hRatio = canvasWidth / imgWidth;
            const vRatio = canvasHeight / imgHeight;
            const ratio = Math.max(hRatio, vRatio);

            const centerShift_x = (canvasWidth - imgWidth * ratio) / 2;
            const centerShift_y = (canvasHeight - imgHeight * ratio) / 2;

            // Performance: Only draw if necessary, and use fast draw
            ctx.drawImage(img,
                0, 0, imgWidth, imgHeight,
                centerShift_x, centerShift_y, imgWidth * ratio, imgHeight * ratio
            );
        }
    };

    // Handle Resize Explicitly
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                // Re-render current frame after resize
                renderFrame(currentIndex.get());
            }
        };

        // Set initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Subscribe to scroll changes to render frames
    useMotionValueEvent(currentIndex, "change", (latest) => {
        if (!isLoading) {
            requestAnimationFrame(() => renderFrame(latest));
        }
    });

    // Prevent scrolling while loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; }
    }, [isLoading]);

    return (
        <div ref={containerRef} className="relative h-[500vh] w-full bg-black">

            {/* Canvas Sticky Layer */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="block w-full h-full" />

                {/* Text Layers */}
                {/* 0% Start */}
                <motion.div style={{ opacity: opacityText1 }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-opacity duration-300">
                    <div className="text-center px-4 mb-20">
                        <h1 className="text-6xl md:text-9xl font-bold font-orbitron uppercase tracking-tighter text-white mb-4" style={{ textShadow: '4px 4px 0px #005A9C' }}>
                            SpaceScope
                        </h1>
                        <p className="text-xl md:text-3xl text-cyan-100/90 font-orbitron tracking-widest mt-4 uppercase" style={{ textShadow: '2px 2px 0px #005A9C' }}>
                            Explore the Universe
                        </p>
                    </div>

                    {/* Scroll Indicator (Arrow) */}
                    <div className="absolute bottom-12 flex flex-col items-center z-20">
                        <div className="flex flex-col items-center gap-2 animate-bounce">
                            <span className="text-[10px] font-orbitron uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                                SCROLL
                            </span>
                            <ChevronDown className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        </div>
                    </div>
                </motion.div>

                {/* 25% Zoom */}
                <motion.div style={{ opacity: opacityText2 }} className="absolute inset-0 flex items-center justify-start pl-10 md:pl-32 pointer-events-none z-10">
                    <div className="max-w-xl text-left">
                        <h2 className="text-4xl md:text-7xl font-bold font-orbitron mb-4 text-white uppercase tracking-tighter" style={{ textShadow: '3px 3px 0px #005A9C' }}>Beyond the<br />Event Horizon</h2>
                        <p className="text-xl md:text-3xl text-white font-orbitron font-bold tracking-wide" style={{ textShadow: '2px 2px 0px #005A9C' }}>Journey through the celestial void where stars are born.</p>
                    </div>
                </motion.div>

                {/* 50% Zoom */}
                <motion.div style={{ opacity: opacityText3 }} className="absolute inset-0 flex items-center justify-end pr-10 md:pr-32 pointer-events-none z-10">
                    <div className="text-right max-w-xl">
                        <h2 className="text-4xl md:text-7xl font-bold font-orbitron mb-4 text-white uppercase tracking-tighter" style={{ textShadow: '3px 3px 0px #005A9C' }}>Data from<br />the Stars</h2>
                        <p className="text-xl md:text-3xl text-white font-orbitron font-bold tracking-wide" style={{ textShadow: '2px 2px 0px #005A9C' }}>Streaming millions of data points from deep space satellites.</p>
                    </div>
                </motion.div>

                {/* 75% Zoom */}
                <motion.div style={{ opacity: opacityText4 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center">
                        <h2 className="text-5xl md:text-8xl font-bold font-orbitron mb-6 text-white uppercase tracking-tighter" style={{ textShadow: '3px 3px 0px #005A9C' }}>Solving Problems<br />on Earth</h2>
                        <p className="text-2xl md:text-4xl text-white font-orbitron font-bold px-6 py-2 inline-block tracking-wide" style={{ textShadow: '2px 2px 0px #005A9C' }}>Using orbital perspective to heal our planet.</p>
                    </div>
                </motion.div>

                {/* HUD (>98%) */}
                <motion.div
                    style={{ opacity: opacityHUD, pointerEvents: pointerEventsHUD }}
                    className="absolute inset-0 flex items-center justify-center z-50"
                >
                    <div className="w-full">
                        <BauhausMenu />
                    </div>
                </motion.div>
            </div>

            {/* Loading Screen Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-cyan-500"
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

function BauhausMenu() {
    // Top Row: Missions, Earth Impact (Wide)
    const uniformShape = "rounded-tl-[2rem] rounded-br-[2rem]";
    const topRowItems = [
        {
            id: 1,
            label: "Missions",
            sub: "Past, Present & Future Missions",
            icon: Globe,
            bg: "bg-black/80 border-2 border-white/40",
            text: "text-white",
            shape: uniformShape,
        },
        {
            id: 2,
            label: "Earth Impact",
            sub: "Satellite-Based Climate Data",
            icon: AlertTriangle,
            bg: "bg-black/80 border-2 border-white/40",
            text: "text-white",
            shape: uniformShape,
        },
    ];

    // Bottom Row: Celestial, Weather, Learning (Standard)
    const bottomRowItems = [
        {
            id: 3,
            label: "Celestial Events",
            sub: "Eclipses, Comets & Showers",
            icon: Rocket,
            bg: "bg-black/80 border-2 border-white/40",
            text: "text-white",
            shape: uniformShape,
        },
        {
            id: 4,
            label: "Cosmic Weather",
            sub: "Solar Flares & Aurora Alerts",
            icon: Zap,
            bg: "bg-black/80 border-2 border-white/40",
            text: "text-white",
            shape: uniformShape,
        },
        {
            id: 5,
            label: "Learning Zone",
            sub: "Encyclopedia & Quizzes",
            icon: BookOpen,
            bg: "bg-black/80 border-2 border-white/40",
            text: "text-white",
            shape: uniformShape,
        },
    ];

    const MenuCard = ({ item, isWide = false }: { item: any, isWide?: boolean }) => (
        <button
            onClick={async () => {
                // Special handling for Learning Zone - check auth state
                if (item.label === 'Learning Zone') {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        // Not logged in - go to login
                        window.location.href = '/login';
                    } else {
                        // Logged in - get role and redirect to appropriate dashboard
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single();

                        if (profile?.role === 'admin') {
                            window.location.href = '/dashboard/admin';
                        } else {
                            window.location.href = '/dashboard/student';
                        }
                    }
                    return;
                }

                const map: Record<string, string> = {
                    'Missions': '/missions',
                    'Earth Impact': '/earth-impact',
                    'Cosmic Weather': '/cosmic-weather',
                    'Celestial Events': '/celestial-events'
                };
                if (map[item.label]) window.location.href = map[item.label];
            }}
            className={`group relative flex flex-row items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_0px_20px_rgba(255,255,255,0.2)] hover:border-white/60 ${item.bg} ${item.text} px-6 py-6 ${isWide ? 'h-[180px]' : 'h-[160px]'} rounded-3xl`}
        >
            {/* Number: Defined space to prevent overlap */}
            <div className="text-6xl font-black opacity-40 font-orbitron mr-6 w-16 text-center shrink-0">
                {item.id}
            </div>

            {/* Geometric Icon Container */}
            <div className={`flex items-center justify-center bg-white/10 ${item.shape} shrink-0 mr-6 ${isWide ? 'w-24 h-24' : 'w-20 h-20'}`}>
                <item.icon className={`${isWide ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>

            {/* Typography: Pushed right */}
            <div className="text-right z-10 flex-grow ml-auto">
                <h3 className={`${isWide ? 'text-3xl' : 'text-xl'} font-black uppercase leading-none mb-2 tracking-tighter`}>
                    {item.label}
                </h3>
                <span className="text-[12px] font-bold uppercase tracking-widest opacity-80 border-t-2 border-current pt-1 inline-block">
                    {item.sub}
                </span>
            </div>
        </button>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 flex flex-col items-center justify-center font-sans">
            {/* Header: Relative position to sit naturally above cards */}
            <div className="w-full text-center mb-8 mt-2">
                <h2 className="text-6xl md:text-9xl font-bold font-orbitron text-white uppercase tracking-tighter mb-4" style={{ textShadow: '4px 4px 0px #005A9C' }}>
                    COSMIC EXPLORATION
                </h2>
                <div className="inline-block bg-white text-black px-6 py-1 text-base md:text-xl font-bold uppercase tracking-widest transform -rotate-1 font-orbitron shadow-[4px_4px_0px_#005A9C]">
                    Select your path through the stars
                </div>
            </div>

            {/* Grid Container */}
            <div className="w-full flex flex-col gap-6">

                {/* Top Row: 2 Wide Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {topRowItems.map((item) => <MenuCard key={item.id} item={item} isWide={true} />)}
                </div>

                {/* Bottom Row: 3 Standard Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {bottomRowItems.map((item) => <MenuCard key={item.id} item={item} isWide={false} />)}
                </div>

            </div>
        </div>
    )
}
