'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Star, Zap, Eye, Calendar, Clock, X, Info, MapPin } from 'lucide-react';

// --- DATA TYPES ---
interface AstroEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  detailedInfo: string; // Added for modal context
  time: string;
  type: 'LUNAR' | 'SOLAR' | 'COMET' | 'GENERAL'; // To determine visual style
}

// --- FAKE DATA ---
const DATA = {
  lunar: [
    { id: 1, type: 'LUNAR', date: "Jan 12", time: "18:45", title: "Waxing Crescent", description: "15% Illuminated. Visible in the west shortly after sunset.", detailedInfo: "The Moon is currently 15% illuminated, offering a spectacular view of the terminator line where shadows are longest. This is the optimal time for observing crater depth and mountain ranges like the Montes Apenninus." },
    { id: 2, type: 'LUNAR', date: "Jan 13", time: "19:30", title: "Lunar Conjunction with Saturn", description: "The crescent Moon passes just 3° south of Saturn.", detailedInfo: "A beautiful celestial pairing visible to the naked eye. The ringed planet Saturn will appear as a bright, yellowish 'star' just below the silvery crescent Moon. Binoculars will reveal Saturn's oval shape." },
    { id: 3, type: 'LUNAR', date: "Jan 14", time: "20:15", title: "First Quarter Approach", description: "Moon reaches 45% illumination.", detailedInfo: "As the Moon approaches First Quarter, it rises around noon and sets around midnight. It is perfectly positioned for evening observation." },
    { id: 4, type: 'LUNAR', date: "Jan 15", time: "21:00", title: "Moon at Perigee", description: "Closest point to Earth (363,000 km).", detailedInfo: "The Moon's orbit is elliptical. Tonight it reaches Perigee, its closest point to Earth, making it appear approximately 14% larger and 30% brighter than when it is at Apogee." },
    { id: 5, type: 'LUNAR', date: "Jan 16", time: "17:20", title: "Golden Handle", description: "Sunlight illuminates the Jura Mountains.", detailedInfo: "A famous clair-obscur effect where the sun rises on the Jura Mountains while the Bay of Rainbows (Sinus Iridum) remains in shadow, creating a 'handle' of light extending into the lunar night." },
    { id: 6, type: 'LUNAR', date: "Jan 17", time: "22:45", title: "Waxing Gibbous", description: "78% Illuminated. Bright night.", detailedInfo: "The Moon is now dominating the night sky. The bright light may wash out fainter stars, but the lunar surface itself shows intricate ray systems from younger craters like Tycho and Copernicus." },
    { id: 7, type: 'LUNAR', date: "Jan 18", time: "23:30", title: "Pleiades Occultation", description: "Moon passes in front of the Seven Sisters.", detailedInfo: "In a rare alignment, the dark limb of the Moon will cover stars in the Pleiades cluster (M45). This event is best viewed with a telescope or strong binoculars." }
  ],
  solar: [
    { id: 8, type: 'SOLAR', date: "Jan 12", time: "23:00", title: "Jupiter Red Spot Transit", description: "Great Red Spot central meridian transit.", detailedInfo: "Jupiter's iconic storm, the Great Red Spot, is facing Earth directly. It has been shrinking for decades but remains large enough to swallow Earth whole." },
    { id: 9, type: 'SOLAR', date: "Jan 13", time: "05:15", title: "Mercury Elongation", description: "Furthest distance from Sun. Best visibility.", detailedInfo: "Mercury is notoriously hard to see because it stays close to the Sun. Today it reaches Greatest Western Elongation, making it visible low in the eastern sky just before sunrise." },
    { id: 10, type: 'SOLAR', date: "Jan 14", time: "02:30", title: "Io Shadow Transit", description: "Io casts a shadow on Jupiter.", detailedInfo: "Watch as the volcanic moon Io passes between Jupiter and the Sun, projecting a sharp, ink-black shadow onto the Jovian cloud tops. A small telescope is required." },
    { id: 11, type: 'SOLAR', date: "Jan 15", time: "18:00", title: "Venus Peak Brightness", description: "Magnitude -4.5. Dazzling evening star.", detailedInfo: "Venus is currently the brightest object in the night sky after the Moon. Its thick cloud cover reflects 75% of sunlight, creating a brilliant white beacon in the west." },
    { id: 12, type: 'SOLAR', date: "Jan 16", time: "00:45", title: "Saturn Ring Tilt", description: "Rings tilted at 12°.", detailedInfo: "Saturn's rings are opening up from our perspective, revealing the dark Cassini Division gap between the A and B rings. A 4-inch telescope will show this detail clearly." },
    { id: 13, type: 'SOLAR', date: "Jan 17", time: "04:00", title: "Mars Approach", description: "Mars brightening rapidly.", detailedInfo: "Earth is catching up to Mars in orbit. The Red Planet is growing larger in telescopes daily, revealing major surface features like Syrtis Major and the polar ice caps." },
    { id: 14, type: 'SOLAR', date: "Jan 18", time: "21:30", title: "Uranus Conjunction", description: "Easy to find with binoculars.", detailedInfo: "The ice giant Uranus appears as a tiny turquoise disc. Tonight it is located very close to a bright reference star, making it easy to distinguish from the background starfield." }
  ],
  comets: [
    { id: 15, type: 'COMET', date: "Jan 12", time: "03:00", title: "Comet C/2026 E1", description: "Mag 6.5. Visible in Orion.", detailedInfo: "This newly discovered comet is passing through the constellation Orion. It shows a distinct green coma due to diatomic carbon and a short, faint dust tail." },
    { id: 16, type: 'COMET', date: "Jan 13", time: "N/A", title: "Vesta Opposition", description: "Brightest asteroid visible to naked eye.", detailedInfo: "4 Vesta is the second-largest object in the asteroid belt. At opposition, it reflects enough sunlight to be faintly visible without telescopes in very dark skies." },
    { id: 17, type: 'COMET', date: "Jan 14", time: "22:00", title: "Flyby 2026 AB", description: "Safe lunar-distance flyby.", detailedInfo: "A school-bus-sized asteroid is passing safely between the Earth and Moon. While no threat, it provides an excellent target for radar astronomy." },
    { id: 18, type: 'COMET', date: "Jan 15", time: "04:30", title: "Comet Outburst", description: "12P/Pons-Brooks may brighten.", detailedInfo: "This cryovolcanic 'Devil Comet' is known for sudden outbursts where it ejects ice and gas, increasing its brightness by magnitude 2 or 3 overnight." },
    { id: 19, type: 'COMET', date: "Jan 16", time: "01:00", title: "Asteroid Occultation", description: "Star blocked by asteroid Hygiea.", detailedInfo: "For a narrow path on Earth, the asteroid 10 Hygiea will pass directly in front of a star, causing it to 'blink out' for several seconds. Used to measure asteroid shape." },
    { id: 20, type: 'COMET', date: "Jan 17", time: "02:15", title: "Fireball Watch", description: "Minor debris stream entry.", detailedInfo: "Earth is passing through an old, sparse dust trail. Automated cameras may detect an increase in bright bolides (fireballs) penetrating deep into the atmosphere." },
    { id: 21, type: 'COMET', date: "Jan 18", time: "N/A", title: "Ceres in Leo", description: "Dwarf planet observable.", detailedInfo: "Ceres, the only dwarf planet in the inner solar system, is currently moving through the 'Sickle' of Leo. It appears as a magnitude 8 star-like object." }
  ],
  general: [
    { id: 22, type: 'GENERAL', date: "Jan 12", time: "19:00", title: "ISS Flyover", description: "Mag -3.9. Duration: 6 mins.", detailedInfo: "The International Space Station will make a bright pass overhead. It will rise in the NW and fade into Earth's shadow in the SE. Brighter than any star." },
    { id: 23, type: 'GENERAL', date: "Jan 13", time: "20:30", title: "Zodiacal Light", description: "False dusk visible in west.", detailedInfo: "Look for a pyramid-shaped glow extending up from the western horizon. This is sunlight reflecting off billions of dust particles scattered between the planets." },
    { id: 24, type: 'GENERAL', date: "Jan 14", time: "22:00", title: "Winter Hexagon", description: "Bright star asterism.", detailedInfo: "A massive pattern formed by Sirius, Procyon, Pollux, Capella, Aldebaran, and Rigel. It dominates the southern sky and contains the Milky Way band running through it." },
    { id: 25, type: 'GENERAL', date: "Jan 15", time: "00:00", title: "Algol Minimum", description: "Demon Star dims.", detailedInfo: "Algol is an eclipsing binary star. Tonight, the dimmer star passes in front of the brighter one, causing the system's total light to drop noticeably for a few hours." },
    { id: 26, type: 'GENERAL', date: "Jan 16", time: "18:45", title: "Starlink Train", description: "Satellite formation visible.", detailedInfo: "A recently launched batch of 60 satellites is still clustered together, appearing as a 'string of pearls' moving rapidly across the sky before spreading out." },
    { id: 27, type: 'GENERAL', date: "Jan 17", time: "21:00", title: "Aurora Watch", description: "Kp-5 Storm predicted.", detailedInfo: "A coronal hole stream is hitting Earth's magnetic field. Observers at high latitudes (and possibly mid-latitudes) should look north for green and red glows." },
    { id: 28, type: 'GENERAL', date: "Jan 18", time: "23:00", title: "Galactic Center", description: "Milky Way core visibility.", detailedInfo: "The dense, star-rich core of our galaxy is positioned well for photography. Requires dark skies away from city light pollution to see the dust lanes." }
  ]
};

const TABS = [
  { id: 'lunar', label: 'Lunar Events', icon: Moon },
  { id: 'solar', label: 'Solar System', icon: Sun },
  { id: 'comets', label: 'Comets & Asteroids', icon: Zap },
  { id: 'general', label: 'Celestial Events', icon: Star },
];

export default function CelestialEvents({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'lunar' | 'solar' | 'comets' | 'general'>('lunar');
  const [selectedEvent, setSelectedEvent] = useState<AstroEvent | null>(null);

  // Helper to generate a visual placeholder based on type
  // In a real app, you would replace these divs with <Image src="..." />
  const renderEventVisual = (type: string) => {
    switch (type) {
        case 'LUNAR':
            return (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center relative overflow-hidden">
                    <div className="w-32 h-32 rounded-full bg-slate-200 shadow-[0_0_50px_rgba(255,255,255,0.2)] relative">
                        <div className="absolute w-full h-full rounded-full bg-black/40 translate-x-8" />
                    </div>
                    <div className="absolute inset-0 bg-[url('/backgrounds/bg_moon.png')] bg-cover opacity-10 mix-blend-overlay" />
                </div>
            );
        case 'SOLAR':
            return (
                <div className="w-full h-full bg-gradient-to-br from-orange-900/50 via-black to-black flex items-center justify-center relative overflow-hidden">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 blur-md opacity-20 absolute" />
                    <div className="w-24 h-24 rounded-full bg-orange-400 shadow-[0_0_60px_orange]" />
                </div>
            );
        case 'COMET':
            return (
                <div className="w-full h-full bg-gradient-to-br from-cyan-900/50 via-black to-black flex items-center justify-center relative overflow-hidden">
                     <div className="w-2 h-24 bg-gradient-to-b from-transparent to-cyan-400 rotate-45 absolute opacity-80 blur-sm translate-x-[-20px] translate-y-[-20px]" />
                     <div className="w-16 h-16 bg-white/10 rounded-full blur-xl absolute" />
                     <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]" />
                </div>
            );
        default:
            return (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-black to-black flex items-center justify-center">
                    <Star className="w-24 h-24 text-white/10" />
                </div>
            );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden font-inter text-slate-200 flex flex-col">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center opacity-20 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="relative z-10 px-6 pt-6 pb-4 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest">SKY CALENDAR</h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">7-Day Forecast • {new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex bg-slate-900/50 rounded-full p-1 border border-white/10">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold font-orbitron uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-4 bg-black/40 border-b border-white/10 z-10 shrink-0 custom-scrollbar">
        {TABS.map(tab => (
           <button
           key={tab.id}
           onClick={() => setActiveTab(tab.id as any)}
           className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase border transition-all ${
             activeTab === tab.id
               ? 'bg-white text-black border-white'
               : 'bg-transparent border-white/10 text-slate-500'
           }`}
         >
           <tab.icon className="w-3 h-3" />
           {tab.label}
         </button>
        ))}
      </div>

      {/* --- CONTENT SCROLL AREA --- */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full w-full max-w-5xl mx-auto p-4 md:p-8 overflow-y-auto custom-scrollbar">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 pb-20"
            >
              {/* Category Header */}
              <motion.div variants={itemVariants} className="mb-4">
                 <h2 className="text-3xl font-orbitron font-bold text-white mb-2">{TABS.find(t => t.id === activeTab)?.label}</h2>
                 <p className="text-slate-400 text-sm">Upcoming significant astronomical events for the week.</p>
              </motion.div>

              {/* Event Cards */}
              {DATA[activeTab].map((event) => (
                <motion.div
                    key={event.id}
                    variants={itemVariants}
                    layoutId={`card-${event.id}`}
                    onClick={() => setSelectedEvent(event as any)}
                    className="group relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-slate-800/60 transition-all hover:border-white/20 cursor-pointer"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        
                        {/* Date Box */}
                        <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:gap-1 bg-white/5 rounded-xl px-4 py-3 border border-white/5 min-w-[80px] text-center group-hover:bg-white/10 transition-colors">
                            <Calendar className="w-4 h-4 text-slate-400 md:mb-1" />
                            <span className="font-orbitron font-bold text-white text-lg md:text-xl">{event.date.split(' ')[1]}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{event.date.split(' ')[0]}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-orbitron font-bold text-white group-hover:text-cyan-200 transition-colors">
                                    {event.title}
                                </h3>
                                {event.time !== 'N/A' && (
                                    <span className="text-xs font-mono text-slate-400 bg-black/30 px-2 py-1 rounded flex items-center gap-1 border border-white/5">
                                        <Clock className="w-3 h-3" /> {event.time} UTC
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                                {event.description}
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                View Analysis &rarr;
                            </span>
                        </div>

                        {/* Action / Icon */}
                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-white/5 bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10 transition-all">
                             <Eye className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- EVENT MODAL --- */}
      <AnimatePresence>
        {selectedEvent && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={() => setSelectedEvent(null)}
            >
                <motion.div
                    layoutId={`card-${selectedEvent.id}`}
                    className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setSelectedEvent(null)}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Image Area (Top Half) */}
                    <div className="h-64 w-full relative">
                        {renderEventVisual(selectedEvent.type)}
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-900 to-transparent">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                    {selectedEvent.type} EVENT
                                </span>
                                {selectedEvent.time !== 'N/A' && (
                                    <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {selectedEvent.time} UTC
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-orbitron font-bold text-white">{selectedEvent.title}</h2>
                        </div>
                    </div>

                    {/* Content Area (Bottom Half) */}
                    <div className="p-8 bg-slate-900">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-900">
                                <Info className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Mission Briefing</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {selectedEvent.detailedInfo}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg border border-white/10">
                                <MapPin className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Observation Vector</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {selectedEvent.type === 'LUNAR' && "Visible worldwide. Best viewed with naked eye or binoculars."}
                                    {selectedEvent.type === 'SOLAR' && "Requires clear horizons. Telescope recommended for surface detail."}
                                    {selectedEvent.type === 'COMET' && "Dark skies essential. Look towards the target constellation."}
                                    {selectedEvent.type === 'GENERAL' && "Check local star charts for precise azimuth/elevation."}
                                </p>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}