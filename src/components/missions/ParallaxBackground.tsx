'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxBackground() {
    const { scrollYProgress } = useScroll();

    // Opacity transforms for background transitions
    // 0-33%: Earth -> Moon
    // 33-66%: Moon -> Mars
    // 66-100%: Mars -> Deep Space (or stays Mars)

    const opacityEarth = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const opacityMoon = useTransform(scrollYProgress, [0.15, 0.35, 0.65], [0, 1, 0]);
    const opacityMars = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
            {/* Deep Space Base Layer */}
            <div className="absolute inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center opacity-20 blur-xl scale-125" />

            {/* Earth Layer */}
            <motion.div
                style={{ opacity: opacityEarth }}
                className="absolute inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center"
            />

            {/* Moon Layer */}
            <motion.div
                style={{ opacity: opacityMoon }}
                className="absolute inset-0 bg-[url('/backgrounds/bg_moon.png')] bg-cover bg-center"
            />

            {/* Mars Layer */}
            <motion.div
                style={{ opacity: opacityMars }}
                className="absolute inset-0 bg-[url('/backgrounds/bg_mars.png')] bg-cover bg-center"
            />

            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>
    );
}
