'use client';

// 1. All imports at the top
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ChevronUp, ChevronDown, Calendar, X, Globe, Sparkles, Moon } from 'lucide-react';

import { CelestialEvent, CELESTIAL_EVENTS, getEventsByRegion } from '@/data/celestialEvents';
import { fetchAllLiveCelestialEvents } from '@/services/celestialApi';
import Timeline from './Timeline';
import EventDetails from './EventDetails';

// 2. Define dynamic components outside the function
const WorldMap = dynamic(() => import('./WorldMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 animate-pulse" />
});

const AuroraGlobe = dynamic(() => import('./AuroraGlobe'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Loading 3D Aurora Globe...</p>
            </div>
        </div>
    )
});

const EclipseGlobe = dynamic(() => import('./EclipseGlobe'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Loading Eclipse Globe...</p>
            </div>
        </div>
    )
});

export default function CelestialLayout() {

    const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);

    // Year selection state
    const [selectedYear, setSelectedYear] = useState(2026);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(true);

    // Tab state: 'events', 'aurora', or 'eclipses'
    const [activeTab, setActiveTab] = useState<'events' | 'aurora' | 'eclipses'>('events');

    // Live data state
    const [liveEvents, setLiveEvents] = useState<CelestialEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Hydration fix: Track if component is mounted
    const [isMounted, setIsMounted] = useState(false);

    // Fetch live data from NASA APIs
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const events = await fetchAllLiveCelestialEvents();
                // Add year to live events (current year)
                const eventsWithYear = events.map(e => ({
                    ...e,
                    year: e.year || new Date().getFullYear()
                }));
                setLiveEvents(eventsWithYear);
            } catch (error) {
                console.error('Error fetching live celestial events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hydration fix: Set mounted flag after first render
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Combine static and live events
    const allEvents = useMemo(() => {
        return [...CELESTIAL_EVENTS, ...liveEvents];
    }, [liveEvents]);

    // Filter events by selected country (when country is selected, show ONLY those events)
    const filteredEvents = useMemo(() => {
        if (!userLocation) return allEvents;
        return allEvents.filter(e =>
            e.visibilityRegion.toLowerCase().includes(userLocation.name.toLowerCase()) ||
            e.visibilityRegion === 'Global'
        );
    }, [allEvents, userLocation]);

    const handleEventSelect = (event: CelestialEvent) => {
        setSelectedEvent(event);
        setShowDetails(true);
    };

    const handleLocationSelect = (location: { lat: number, lng: number, name: string }) => {
        setUserLocation(location);
    };

    const clearCountryFilter = () => {
        setUserLocation(null);
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden flex flex-col text-white font-inter relative">

            {/* Navigation & Header */}
            <header className="absolute top-0 left-0 w-full z-40 p-6 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <Link
                        href="/?menu=open"
                        className="px-4 py-2 border border-white/20 bg-black/40 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        &larr;
                    </Link>
                </div>

                <div className="text-right">
                    <h1 className="text-3xl font-orbitron font-bold leading-none">CELESTIAL<br />{activeTab === 'events' ? 'EVENTS' : activeTab === 'aurora' ? 'AURORA' : 'ECLIPSES'}</h1>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        {activeTab === 'events'
                            ? (isMounted ? (userLocation ? `FILTERED: ${userLocation.name.toUpperCase()}` : "SELECT REGION") : "SELECT REGION")
                            : activeTab === 'aurora' ? "REAL-TIME AURORA" : "ECLIPSE TRACKER"
                        }
                    </p>
                </div>
            </header>

            {/* Country Filter Badge */}
            <AnimatePresence>
                {isMounted && userLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                    >
                        <button
                            onClick={clearCountryFilter}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-900/80 backdrop-blur-md border border-cyan-500/30 rounded-full hover:bg-cyan-800/80 transition-colors group"
                        >
                            <span className="text-cyan-300 text-sm font-bold">📍 {userLocation.name}</span>
                            <X className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Navigation */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <div className="flex gap-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'events'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Globe className="w-4 h-4" />
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('aurora')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'aurora'
                            ? 'bg-gradient-to-r from-green-500 to-purple-500 text-white shadow-lg shadow-green-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Aurora
                    </button>
                    <button
                        onClick={() => setActiveTab('eclipses')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'eclipses'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Moon className="w-4 h-4" />
                        Eclipses
                    </button>
                </div>
            </div>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'events' ? (
                        // Events Tab - World Map
                        isMounted ? (
                            <motion.div
                                key="events"
                                className="flex-1 relative w-full"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    height: drawerOpen ? 'calc(100vh - 260px)' : 'calc(100vh - 50px)'
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            >
                                <WorldMap
                                    selectedEvent={selectedEvent}
                                    userLocation={userLocation}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </motion.div>
                        ) : (
                            <div className="flex-1 relative w-full bg-slate-950 animate-pulse" />
                        )
                    ) : activeTab === 'aurora' ? (
                        // Aurora Tab - 3D Globe
                        <motion.div
                            key="aurora"
                            className="flex-1 relative w-full h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AuroraGlobe />
                        </motion.div>
                    ) : (
                        // Eclipses Tab - Eclipse Globe
                        <motion.div
                            key="eclipses"
                            className="flex-1 relative w-full h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <EclipseGlobe />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Retractable Timeline Drawer - Only show for Events tab */}
                {activeTab === 'events' && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-slate-950/98 to-transparent"
                        animate={{
                            height: drawerOpen ? 260 : 50
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Drawer Handle */}
                        <div className="relative">
                            <button
                                onClick={() => setDrawerOpen(!drawerOpen)}
                                className="absolute left-1/2 -translate-x-1/2 -top-3 px-5 py-1.5 bg-slate-900 border border-white/20 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-colors group z-30"
                            >
                                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                                    Events
                                </span>
                                {drawerOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                                ) : (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                                )}
                            </button>
                        </div>

                        {/* Timeline Content */}
                        <AnimatePresence>
                            {drawerOpen && isMounted && (
                                <motion.div
                                    className="h-full pt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Timeline
                                        events={filteredEvents}
                                        loading={loading}
                                        onSelectEvent={handleEventSelect}
                                        selectedEventId={selectedEvent?.id}
                                        selectedCountry={userLocation?.name}
                                        selectedYear={selectedYear}
                                        onYearChange={setSelectedYear}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

            </div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {isMounted && showDetails && selectedEvent && (
                    <EventDetails
                        event={selectedEvent!}
                        onClose={() => setShowDetails(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}