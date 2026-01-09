'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface ComparisonSliderProps {
    leftImage: string;
    rightImage: string;
    leftLabel?: string;
    rightLabel?: string;
    className?: string;
    leftImageClassName?: string;
    rightImageClassName?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
    leftImage,
    rightImage,
    leftLabel = 'Before',
    rightLabel = 'After',
    className = '',
    leftImageClassName = '',
    rightImageClassName = '',
}) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            className={`relative w-full h-full overflow-hidden select-none group cursor-col-resize ${className}`}
            ref={containerRef}
            onMouseDown={handleMouseDown}
        >
            {/* Right Image (Background) */}
            <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center ${rightImageClassName}`}
                style={{ backgroundImage: `url(${rightImage})` }}
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider text-white pointer-events-none">
                {rightLabel}
            </div>

            {/* Left Image (Foreground - Clipped) */}
            <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)] ${leftImageClassName}`}
                style={{
                    backgroundImage: `url(${leftImage})`,
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
            />
            <div
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider text-white pointer-events-none"
                style={{ opacity: sliderPosition > 10 ? 1 : 0, transition: 'opacity 0.2s' }}
            >
                {leftLabel}
            </div>


            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_2px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center hover:scale-110 transition-transform"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 absolute"><path d="m9 18 6-6-6-6" /></svg>
                </div>
            </div>
        </div>
    );
};
