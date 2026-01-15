import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CelestialEvent, EVENT_ICONS, EVENT_COLORS, getEventYears } from '@/data/celestialEvents';
import { Calendar, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineProps {
    events: CelestialEvent[];
    onSelectEvent: (event: CelestialEvent) => void;
    selectedEventId?: string;
    loading?: boolean;
    selectedCountry?: string | null;
    selectedYear: number;
    onYearChange: (year: number) => void;
}

// Year range for the dropdown
const START_YEAR = 1850;
const END_YEAR = 2030;
const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function Timeline({
    events,
    onSelectEvent,
    selectedEventId,
    loading,
    selectedCountry,
    selectedYear,
    onYearChange
}: TimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter events by year
    const filteredEvents = useMemo(() => {
        return events.filter(e => e.year === selectedYear);
    }, [events, selectedYear]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!scrollContainerRef.current) return;

        const scrollAmount = 300;
        if (e.key === 'ArrowLeft') {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, []);

    // Attach keyboard listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Scroll buttons
    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    return (
        <div className="w-full h-full flex flex-col pb-4 relative z-20">
            {/* Header with Year Selector */}
            <div className="flex items-center justify-between px-6 md:px-12 mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-orbitron font-bold text-white tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        TIMELINE
                    </h2>

                    {/* Year Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => onYearChange(parseInt(e.target.value))}
                            className="appearance-none bg-slate-900/80 border border-white/20 rounded-xl px-4 py-2 pr-10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-slate-800/80 transition-colors"
                        >
                            {years.map(year => (
                                <option key={year} value={year} className="bg-slate-900">
                                    {year}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Event count */}
                <div className="flex items-center gap-3">
                    {selectedCountry && (
                        <span className="text-xs text-cyan-400 font-mono bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/30">
                            📍 {selectedCountry}
                        </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                        {filteredEvents.length} events in {selectedYear}
                    </span>
                </div>
            </div>

            {/* Native Scroll Timeline - supports trackpad & arrow keys */}
            <div className="flex-1 relative px-6 md:px-12">
                {loading ? (
                    <div className="flex items-center justify-center h-full gap-3">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span className="text-slate-400 font-mono text-sm">Loading events...</span>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="text-4xl">🌌</span>
                        <span className="text-slate-400 font-mono text-sm">No events recorded for {selectedYear}</span>
                        <span className="text-slate-500 text-xs">Try selecting a different year</span>
                    </div>
                ) : (
                    <>
                        {/* Scroll buttons for mouse users */}
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>

                        {/* Scrollable container - native scroll with trackpad/mouse wheel */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-5 h-full items-start py-2 overflow-x-auto scroll-smooth scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    onClick={() => onSelectEvent(event)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative flex-shrink-0 w-72 h-52 rounded-2xl p-5 flex flex-col justify-between 
                                        cursor-pointer transition-all duration-200 group
                                        border backdrop-blur-md
                                        ${selectedEventId === event.id
                                            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(34,211,238,0.15)]'
                                            : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {/* Top */}
                                    <div className="flex justify-between items-start">
                                        <span className="text-3xl filter drop-shadow-md">{EVENT_ICONS[event.type]}</span>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-black"
                                            style={{ backgroundColor: EVENT_COLORS[event.type] }}
                                        >
                                            {event.type.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                                        <div className="text-[10px] text-slate-400 font-mono">{event.date}</div>
                                        <h3 className="text-base font-bold text-white leading-tight group-hover:text-cyan-200 transition-colors line-clamp-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>

                                    {/* Bottom progress bar */}
                                    <div className="w-full h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300 group-hover:w-full"
                                            style={{
                                                backgroundColor: EVENT_COLORS[event.type],
                                                width: selectedEventId === event.id ? '100%' : '25%'
                                            }}
                                        />
                                    </div>

                                    {/* Background glow */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-xl"
                                        style={{ backgroundColor: EVENT_COLORS[event.type] }}
                                    />
                                </motion.div>
                            ))}

                            {/* End spacer */}
                            <div className="w-8 flex-shrink-0" />
                        </div>
                    </>
                )}
            </div>

            {/* Scroll hint */}
            {filteredEvents.length > 3 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">
                    ← Use trackpad or arrow keys →
                </div>
            )}
        </div>
    );
}
