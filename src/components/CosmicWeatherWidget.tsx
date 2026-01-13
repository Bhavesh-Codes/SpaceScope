'use client';

import React, { useState } from 'react';
import { AlertTriangle, Wind, Zap, Radio, Flame, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CosmicWeatherWidget({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('alerts');

  // --- Fake Data (7 Examples Each) ---
  const fakeData = {
    geomagneticStorms: [
      { id: 1, level: 'G4', startTime: '2026-01-11T08:30:00Z', endTime: '2026-01-11T14:45:00Z', effects: 'Severe: Aurora visible at lower latitudes, power grid stress.' },
      { id: 2, level: 'G2', startTime: '2026-01-10T16:20:00Z', endTime: '2026-01-11T02:30:00Z', effects: 'Moderate: Minor aurora, some satellite operations affected.' },
      { id: 3, level: 'G3', startTime: '2026-01-09T12:00:00Z', endTime: '2026-01-10T05:15:00Z', effects: 'Strong: Aurora visible across northern regions, radio signal disruptions.' },
      { id: 4, level: 'G5', startTime: '2026-01-08T04:15:00Z', endTime: '2026-01-08T22:30:00Z', effects: 'Extreme: Widespread aurora, major power outages, radio blackouts.' },
      { id: 5, level: 'G1', startTime: '2026-01-07T18:45:00Z', endTime: '2026-01-08T01:20:00Z', effects: 'Minor: Weak aurora, minor satellite operations affected.' },
      { id: 6, level: 'G2', startTime: '2026-01-06T11:30:00Z', endTime: '2026-01-06T19:45:00Z', effects: 'Moderate: Visible aurora in high latitudes, minor GPS errors.' },
      { id: 7, level: 'G3', startTime: '2026-01-05T09:00:00Z', endTime: '2026-01-05T18:30:00Z', effects: 'Strong: Aurora across northern hemisphere, radio degradation.' },
    ],
    solarFlares: [
      { id: 1, classType: 'X2.4', region: 'AR 3533', eventTime: '2026-01-11T06:15:00Z', peakTime: '2026-01-11T06:45:00Z', endTime: '2026-01-11T07:30:00Z' },
      { id: 2, classType: 'M8.1', region: 'AR 3531', eventTime: '2026-01-10T18:20:00Z', peakTime: '2026-01-10T18:50:00Z', endTime: '2026-01-10T19:40:00Z' },
      { id: 3, classType: 'M3.5', region: 'AR 3528', eventTime: '2026-01-09T14:10:00Z', peakTime: '2026-01-09T14:35:00Z', endTime: '2026-01-09T15:20:00Z' },
      { id: 4, classType: 'X1.2', region: 'AR 3535', eventTime: '2026-01-08T22:40:00Z', peakTime: '2026-01-08T23:05:00Z', endTime: '2026-01-09T00:15:00Z' },
      { id: 5, classType: 'M5.7', region: 'AR 3530', eventTime: '2026-01-07T16:25:00Z', peakTime: '2026-01-07T16:50:00Z', endTime: '2026-01-07T17:40:00Z' },
      { id: 6, classType: 'C9.2', region: 'AR 3527', eventTime: '2026-01-06T10:15:00Z', peakTime: '2026-01-06T10:40:00Z', endTime: '2026-01-06T11:30:00Z' },
      { id: 7, classType: 'M2.1', region: 'AR 3532', eventTime: '2026-01-05T08:50:00Z', peakTime: '2026-01-05T09:15:00Z', endTime: '2026-01-05T10:05:00Z' },
    ],
    cmeEvents: [
      { id: 1, type: 'Halo CME', startTime: '2026-01-11T09:00:00Z', speed: 2150, direction: 'Earth-directed' },
      { id: 2, type: 'Partial Halo CME', startTime: '2026-01-10T19:30:00Z', speed: 1840, direction: 'Northwest' },
      { id: 3, type: 'Full Halo CME', startTime: '2026-01-09T15:45:00Z', speed: 2320, direction: 'Earth-directed' },
      { id: 4, type: 'Partial CME', startTime: '2026-01-08T11:20:00Z', speed: 1650, direction: 'Southwest' },
      { id: 5, type: 'Halo CME', startTime: '2026-01-07T07:45:00Z', speed: 2400, direction: 'Earth-directed' },
      { id: 6, type: 'Narrow CME', startTime: '2026-01-06T14:10:00Z', speed: 1200, direction: 'North' },
      { id: 7, type: 'Full Halo CME', startTime: '2026-01-05T19:55:00Z', speed: 2050, direction: 'Earth-directed' },
    ],
    radiationEvents: [
      { id: 1, type: 'Solar Energetic Particle', eventTime: '2026-01-11T07:20:00Z', duration: '8-10 hours', severity: 'High', impact: 'Radiation levels elevated for spacecraft' },
      { id: 2, type: 'Solar Energetic Particle', eventTime: '2026-01-10T20:15:00Z', duration: '6-8 hours', severity: 'Moderate', impact: 'Moderate radiation environment' },
      { id: 3, type: 'Proton Event', eventTime: '2026-01-09T16:30:00Z', duration: '12+ hours', severity: 'High', impact: 'Strong radiation storm detected' },
      { id: 4, type: 'Solar Energetic Particle', eventTime: '2026-01-08T12:45:00Z', duration: '10-12 hours', severity: 'Moderate', impact: 'Minor radiation effects on satellites' },
      { id: 5, type: 'Proton Event', eventTime: '2026-01-07T09:10:00Z', duration: '14+ hours', severity: 'High', impact: 'Extreme radiation storm with major impacts' },
      { id: 6, type: 'Solar Energetic Particle', eventTime: '2026-01-06T15:40:00Z', duration: '7-9 hours', severity: 'Low', impact: 'Minor radiation levels' },
      { id: 7, type: 'Proton Event', eventTime: '2026-01-05T11:25:00Z', duration: '13+ hours', severity: 'High', impact: 'Strong radiation affecting communications' },
    ]
  };

  // Replaced cyan returns with neutral colors (white/slate)
  const getSeverityColor = (severity: string) => {
    const level = severity?.toLowerCase() || '';
    if (level.includes('g5') || level.includes('x') || level === 'severe' || level === 'high') return 'text-red-500';
    if (level.includes('g3') || level.includes('m') || level === 'strong') return 'text-orange-400';
    return 'text-slate-200'; // Was cyan-400
  };

  const tabs = [
    { id: 'alerts', label: 'Dashboard', icon: AlertTriangle },
    { id: 'gst', label: 'Geomagnetic', icon: Zap },
    { id: 'flares', label: 'Solar Flares', icon: Flame },
    { id: 'cme', label: 'CME', icon: Wind },
    { id: 'radiation', label: 'Radiation', icon: AlertCircle }
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Reusable Card Component
  const DataCard = ({ title, value, subtext, accentColor = "text-white", footer }: any) => (
    <motion.div 
      variants={itemVariants}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 transition-colors hover:bg-slate-800/50"
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor.replace('text-', '')}`} />
      
      {/* Header */}
      <div className="mb-4">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-inter mb-1">{subtext}</p>
        <h4 className={`text-2xl font-orbitron font-bold ${accentColor} truncate`}>{title}</h4>
      </div>

      {/* Body */}
      <div className="font-inter text-slate-300 text-sm leading-relaxed mb-4">
        {value}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-white/10 pt-4 mt-auto">
          {footer}
        </div>
      )}

      {/* Tech Deco (Spinning Circle) */}
      <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
          <circle cx="20" cy="20" r="4" fill="white" />
        </svg>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center opacity-30 blur-2xl scale-110 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />

      {/* Header Section */}
      <header className="relative z-10 px-6 pt-6 pb-4 border-b border-white/10 bg-black/20 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-white tracking-wider">COSMIC WEATHER</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {/* Changed text-cyan-400 to text-slate-400 */}
                <p className="text-slate-400 text-xs font-inter tracking-[0.2em] uppercase">System Online</p>
              </div>
            </div>
          </div>
          
          {/* Tab Nav - Removed Blue Styles */}
          <div className="hidden md:flex bg-slate-900/50 rounded-full p-1 border border-white/10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' // White active state
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

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-4 bg-black/40 border-b border-white/10 z-10 shrink-0">
        {tabs.map(tab => (
           <button
           key={tab.id}
           onClick={() => setActiveTab(tab.id)}
           className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase border transition-all ${
             activeTab === tab.id
               ? 'bg-white text-black border-white' // White active state
               : 'bg-transparent border-white/10 text-slate-500'
           }`}
         >
           {tab.label}
         </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto custom-scrollbar">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
              
              {/* DASHBOARD TAB */}
              {activeTab === 'alerts' && (
                <>
                  {/* Hero Summary Block */}
                  <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-red-900/40 to-slate-900/50 rounded-3xl border border-red-500/20 p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <AlertTriangle className="w-64 h-64 text-red-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">Critical Status Report</h2>
                    <p className="text-slate-300 font-inter max-w-2xl text-lg">
                      Active solar phenomena detected. Multiple class-M flares and geomagnetic instability reported in the last 24 hours. Systems may experience interference.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 font-orbitron text-sm">
                            {fakeData.geomagneticStorms.length} Storms
                        </div>
                        <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-300 font-orbitron text-sm">
                            {fakeData.solarFlares.length} Flares
                        </div>
                        {/* Changed from Cyan to Slate */}
                        <div className="px-4 py-2 bg-slate-500/20 border border-slate-500/50 rounded-lg text-slate-300 font-orbitron text-sm">
                            {fakeData.cmeEvents.length} CMEs
                        </div>
                    </div>
                  </motion.div>

                  {/* Recent Significant Events Preview */}
                  {fakeData.geomagneticStorms.slice(0, 3).map((storm) => (
                    <DataCard 
                        key={`storm-preview-${storm.id}`}
                        title={`Storm ${storm.level}`}
                        subtext="Geomagnetic Event"
                        value={storm.effects}
                        accentColor={getSeverityColor(storm.level)}
                        footer={
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>START: {storm.startTime.split('T')[1].slice(0,5)}Z</span>
                                <span className={getSeverityColor(storm.level)}>{storm.level}</span>
                            </div>
                        }
                    />
                  ))}
                </>
              )}

              {/* SPECIFIC TABS */}
              {activeTab === 'gst' && fakeData.geomagneticStorms.map(storm => (
                <DataCard 
                    key={storm.id}
                    title={`Level ${storm.level}`}
                    subtext="Geomagnetic Storm"
                    value={storm.effects}
                    accentColor={getSeverityColor(storm.level)}
                    footer={<p className="text-xs font-mono text-slate-500">{storm.startTime.replace('T', ' ')} UTC</p>}
                />
              ))}

              {activeTab === 'flares' && fakeData.solarFlares.map(flare => (
                <DataCard 
                    key={flare.id}
                    title={`Class ${flare.classType}`}
                    subtext={`Sunspot ${flare.region}`}
                    value={`Solar flare event peaking at ${flare.peakTime.split('T')[1]}. Potential radio blackouts on sunlit side of Earth.`}
                    accentColor={getSeverityColor(flare.classType)}
                    footer={<p className="text-xs font-mono text-slate-500">Duration: 45m approx</p>}
                />
              ))}

              {activeTab === 'cme' && fakeData.cmeEvents.map(cme => (
                 <DataCard 
                    key={cme.id}
                    title={cme.type}
                    subtext="Coronal Mass Ejection"
                    value={`Ejection velocity: ${cme.speed} km/s. Trajectory analysis: ${cme.direction}.`}
                    // Changed accentColor from text-cyan-300 to text-slate-300
                    accentColor="text-slate-300"
                    footer={<p className="text-xs font-mono text-slate-500">Detected: {cme.startTime.split('T')[0]}</p>}
                />
              ))}
              
              {activeTab === 'radiation' && fakeData.radiationEvents.map(evt => (
                 <DataCard 
                    key={evt.id}
                    title={evt.severity}
                    subtext={evt.type}
                    value={evt.impact}
                    accentColor={getSeverityColor(evt.severity)}
                    footer={<p className="text-xs font-mono text-slate-500">Duration: {evt.duration}</p>}
                />
              ))}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}