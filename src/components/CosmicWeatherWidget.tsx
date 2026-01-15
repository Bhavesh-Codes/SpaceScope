'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wind, Zap, Radio, Flame, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSolarFlares, fetchCMEEvents, fetchGeomagneticStorms, SolarFlare, CMEEvent, GeomagneticStorm, kpToGScale } from '@/services/nasaApi';
import SolarFlareChart from '@/components/charts/SolarFlareChart';
import CMEChart from '@/components/charts/CMEChart';
import GeomagneticStormChart from '@/components/charts/GeomagneticStormChart';

export default function CosmicWeatherWidget({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('alerts');

  // Live data state
  const [solarFlares, setSolarFlares] = useState<SolarFlare[]>([]);
  const [cmeEvents, setCmeEvents] = useState<CMEEvent[]>([]);
  const [geomagneticStorms, setGeomagneticStorms] = useState<GeomagneticStorm[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live data from NASA API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [flares, cmes, storms] = await Promise.all([
          fetchSolarFlares(),
          fetchCMEEvents(),
          fetchGeomagneticStorms()
        ]);
        setSolarFlares(flares);
        setCmeEvents(cmes);
        setGeomagneticStorms(storms);
      } catch (error) {
        console.error('Error fetching cosmic weather data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    { id: 'cme', label: 'CME', icon: Wind }
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase tracking-wider transition-all ${activeTab === tab.id
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
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase border transition-all ${activeTab === tab.id
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
                      {loading ? 'Loading live data...' : 'Active solar phenomena detected. Live data from NASA Space Weather Database.'}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : geomagneticStorms.length} Storms
                      </div>
                      <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : solarFlares.length} Flares
                      </div>
                      <div className="px-4 py-2 bg-slate-500/20 border border-slate-500/50 rounded-lg text-slate-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : cmeEvents.length} CMEs
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Significant Events Preview */}
                  {geomagneticStorms.slice(0, 3).map((storm, index) => {
                    const maxKp = storm.allKpIndex?.[0]?.kpIndex || 5;
                    const level = kpToGScale(maxKp);
                    return (
                      <DataCard
                        key={`storm-preview-${storm.gstID || index}`}
                        title={`Storm ${level}`}
                        subtext="Geomagnetic Event"
                        value={`Kp Index: ${maxKp}. ${maxKp >= 7 ? 'Severe aurora activity, potential power grid impacts.' : maxKp >= 5 ? 'Moderate aurora activity, minor satellite impacts.' : 'Minor geomagnetic activity.'}`}
                        accentColor={getSeverityColor(level)}
                        footer={
                          <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>START: {storm.startTime?.split('T')[1]?.slice(0, 5) || 'N/A'}Z</span>
                            <span className={getSeverityColor(level)}>{level}</span>
                          </div>
                        }
                      />
                    );
                  })}
                </>
              )}

              {/* SPECIFIC TABS */}
              {activeTab === 'gst' && (
                <>
                  {/* Chart Section */}
                  <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
                    {loading ? (
                      <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                      </div>
                    ) : (
                      <GeomagneticStormChart data={geomagneticStorms} />
                    )}
                  </motion.div>

                  {/* Data Cards */}
                  {geomagneticStorms.slice(0, 9).map((storm, index) => {
                    const maxKp = storm.allKpIndex?.[0]?.kpIndex || 5;
                    const level = kpToGScale(maxKp);
                    return (
                      <DataCard
                        key={storm.gstID || index}
                        title={`Level ${level}`}
                        subtext="Geomagnetic Storm"
                        value={`Max Kp Index: ${maxKp}. ${storm.linkedEvents?.length ? `Linked to ${storm.linkedEvents.length} solar event(s).` : 'Isolated geomagnetic disturbance.'}`}
                        accentColor={getSeverityColor(level)}
                        footer={<p className="text-xs font-mono text-slate-500">{storm.startTime?.replace('T', ' ')?.slice(0, 16)} UTC</p>}
                      />
                    );
                  })}
                </>
              )}

              {activeTab === 'flares' && (
                <>
                  {/* Chart Section */}
                  <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
                    {loading ? (
                      <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                      </div>
                    ) : (
                      <SolarFlareChart data={solarFlares} />
                    )}
                  </motion.div>

                  {/* Data Cards */}
                  {solarFlares.slice(0, 9).map((flare, index) => (
                    <DataCard
                      key={flare.flrID || index}
                      title={`Class ${flare.classType}`}
                      subtext={flare.activeRegionNum ? `Sunspot AR ${flare.activeRegionNum}` : 'Source Region'}
                      value={`Solar flare event peaking at ${flare.peakTime?.split('T')[1]?.slice(0, 5) || 'N/A'} UTC. Potential radio blackouts on sunlit side of Earth.`}
                      accentColor={getSeverityColor(flare.classType)}
                      footer={<p className="text-xs font-mono text-slate-500">{flare.beginTime?.split('T')[0]} UTC</p>}
                    />
                  ))}
                </>
              )}

              {activeTab === 'cme' && (
                <>
                  {/* Chart Section */}
                  <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
                    {loading ? (
                      <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      </div>
                    ) : (
                      <CMEChart data={cmeEvents} />
                    )}
                  </motion.div>

                  {/* Data Cards */}
                  {cmeEvents.slice(0, 9).map((cme, index) => {
                    const speed = cme.cmeAnalyses?.[0]?.speed;
                    const type = cme.cmeAnalyses?.[0]?.type || 'CME';
                    return (
                      <DataCard
                        key={cme.activityID || index}
                        title={type}
                        subtext="Coronal Mass Ejection"
                        value={`${speed ? `Ejection velocity: ${speed} km/s.` : ''} ${cme.note?.slice(0, 100) || 'CME detected.'}`}
                        accentColor="text-slate-300"
                        footer={<p className="text-xs font-mono text-slate-500">Detected: {cme.startTime?.split('T')[0]}</p>}
                      />
                    );
                  })}
                </>
              )}



            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}