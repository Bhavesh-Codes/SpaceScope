'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wind, Zap, Flame, AlertCircle, Menu, X, ChevronRight, Activity, Thermometer, Radio, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSolarFlares, fetchCMEEvents, fetchGeomagneticStorms, SolarFlare, CMEEvent, GeomagneticStorm, kpToGScale } from '@/services/nasaApi';
import SolarFlareChart from '@/components/charts/SolarFlareChart';
import CMEChart from '@/components/charts/CMEChart';
import GeomagneticStormChart from '@/components/charts/GeomagneticStormChart';
import SunBackground from '@/components/charts/SunBackground';

export default function CosmicWeatherWidget({ onBack }: { onBack: () => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [visibleItems, setVisibleItems] = useState(6);

  // Reset pagination when switching sections
  useEffect(() => {
    setVisibleItems(6);
  }, [activeSection]);

  const handleShowMore = () => {
    setVisibleItems((prev) => prev + 6);
  };

  // Live data state
  const [solarFlares, setSolarFlares] = useState<SolarFlare[]>([]);
  const [cmeEvents, setCmeEvents] = useState<CMEEvent[]>([]);
  const [geomagneticStorms, setGeomagneticStorms] = useState<GeomagneticStorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live data from NASA API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
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
        setError('Failed to establish connection with deep space sensors.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSeverityColor = (severity: string) => {
    const level = severity?.toLowerCase() || '';
    if (level.includes('g5') || level.includes('x') || level === 'severe' || level === 'high') return 'text-red-500';
    if (level.includes('g3') || level.includes('m') || level === 'strong') return 'text-orange-400';
    return 'text-white';
  };

  const sections = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'geomagnetic', label: 'Geomagnetic Storms', icon: Zap },
    { id: 'flares', label: 'Solar Flares', icon: Flame },
    { id: 'cme', label: 'Coronal Mass Ejections', icon: Wind }
  ];

  const DataCard = ({ title, value, subtext, accentColor = "text-white", footer }: any) => (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-5 transition-all hover:bg-slate-800/50 hover:border-white/20">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor.replace('text-', '')}`} />
      <div className="mb-3">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-inter mb-1 opacity-70">{subtext}</p>
        <h4 className={`text-lg font-orbitron font-bold ${accentColor} truncate`}>{title}</h4>
      </div>
      <div className="font-inter text-slate-300 text-sm leading-relaxed mb-3">
        {value}
      </div>
      {footer && (
        <div className="border-t border-white/5 pt-3 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );

  // New CME Card with Hover interaction (Overlap version)
  const CMECard = ({ cme }: { cme: CMEEvent }) => {
    const speed = cme.cmeAnalyses?.[0]?.speed;
    const type = cme.cmeAnalyses?.[0]?.type || 'CME';
    const note = cme.note || 'No additional details.';

    return (
      // Wrapper keeps the grid cell size fixed
      <div className="relative h-[160px] w-full z-0 hover:z-50 group">

        {/* Absolute card expands over other content */}
        <div className="absolute top-0 left-0 w-full min-h-[160px] bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 flex flex-col transition-all duration-300 group-hover:bg-slate-950 group-hover:border-blue-400/50 group-hover:shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden">

          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transition-all group-hover:w-1.5" />

          <div className="mb-2 pl-2">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-inter mb-1 opacity-70">ID: {cme.activityID}</p>
            <h4 className="text-lg font-orbitron font-bold text-blue-400 truncate">{type} Event</h4>
          </div>

          {/* Short Info (Always Visible) */}
          <div className="font-inter text-slate-300 text-sm mb-2 pl-2">
            <span className="text-white font-bold">{speed ? `${speed} km/s` : 'Calculating...'}</span>
            <span className="text-slate-500 mx-2">•</span>
            <span>{cme.startTime?.split('T')[0]}</span>
          </div>

          {/* Detailed Info (Visible on Hover/Expand) */}
          <div className="mt-2 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 transform translate-y-2 group-hover:translate-y-0 h-0 group-hover:h-auto">
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              <span className="text-blue-300 font-bold block mb-1">ANALYSIS NOTE:</span>
              {note}
            </p>
            {cme.cmeAnalyses?.[0]?.halfAngle && (
              <div className="mt-2 text-xs text-slate-500 font-mono">
                Half Angle: {cme.cmeAnalyses[0].halfAngle}°
              </div>
            )}
          </div>

          {/* Hover Hint */}
          <div className="mt-auto pt-2 group-hover:opacity-0 transition-opacity absolute bottom-4 right-4 pointer-events-none">
            <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest border border-slate-800 px-2 py-1 rounded bg-black/20">
              Hover for details
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-sans">

      {/* 1. Fullscreen Interactive 3D Sun Background */}
      <SunBackground solarFlares={solarFlares} />

      {/* 2. Top Bar (Minimal) - Back button area */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto">
          {/* Back button placeholder */}
        </div>
      </div>

      {/* 3. Top Right Menu Button */}
      {!isDrawerOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDrawerOpen(true)}
          className="absolute top-6 right-6 z-20 w-14 h-14 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center backdrop-blur-md transition-all group shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>
      )}

      {/* 4. Landing Page Info Overlay (Bottom Left) */}
      <AnimatePresence>
        {!isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-10 left-8 z-20 pointer-events-none select-none max-w-md"
          >
            <div className="pointer-events-auto bg-black/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
              <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest mb-1">
                  COSMIC<span className="text-cyan-400">.</span>WEATHER
                </h1>
                <p className="text-slate-400 text-xs font-inter uppercase tracking-[0.2em]">
                  Real-time Solar Intelligence
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Live Feed</span>
                  </div>
                  <div className="text-lg font-orbitron font-bold text-white leading-none">
                    {loading ? '-' : solarFlares.length}
                    <span className="text-[10px] text-slate-500 ml-1 font-normal">FLARES</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Geomagnetic</span>
                  </div>
                  <div className="text-lg font-orbitron font-bold text-white leading-none">
                    {loading ? '-' : geomagneticStorms.length}
                    <span className="text-[10px] text-slate-500 ml-1 font-normal">STORMS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>INTERACTIVE 3D MODEL • DRAG TO ROTATE • SCROLL TO ZOOM</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Slide-out Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute top-0 right-0 h-full bg-black/80 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col shadow-2xl transition-all duration-500 ease-in-out ${isExpanded ? 'w-full' : 'w-full md:w-[550px]'}`}
            >

              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div>
                  <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider">COSMIC DATA</h2>
                  <p className="text-cyan-400 text-xs tracking-[0.2em] font-bold mt-1">REAL-TIME ANALYTICS</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors hidden md:block"
                    title={isExpanded ? "Collapse View" : "Expand View"}
                  >
                    {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (Horizontal Scroll inside drawer header area could work, or vertical list) */}
              <div className="flex overflow-x-auto p-4 gap-2 border-b border-white/5 scrollbar-hide shrink-0">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase whitespace-nowrap transition-all ${activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <section.icon className="w-3 h-3" />
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-orbitron tracking-widest">RECEIVING TELEMETRY...</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {!loading && !error && (
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >

                    {/* DASHBOARD VIEW */}
                    {activeSection === 'dashboard' && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-3xl border border-indigo-500/20 p-6 relative overflow-hidden">
                          <h3 className="text-xl font-orbitron font-bold text-white mb-2">System Status</h3>
                          <p className="text-indigo-200/80 text-sm leading-relaxed mb-6">
                            Monitoring solar cycle activity. Current conditions indicate {solarFlares.length > 5 ? 'high' : 'moderate'} solar activity levels.
                          </p>

                          <div className={`grid gap-3 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
                            <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{solarFlares.length}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Flares</div>
                            </div>
                            <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                              <Wind className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{cmeEvents.length}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-wider">CMEs</div>
                            </div>
                            <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                              <Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{geomagneticStorms.length}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Storms</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-orbitron text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Recent Alerts</h4>

                          {/* Combine recent items logic roughly */}
                          <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {geomagneticStorms.slice(0, isExpanded ? 6 : 2).map((storm, i) => {
                              const kp = storm.allKpIndex?.[0]?.kpIndex || 0;
                              return (
                                <div key={`storm-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                  <div className="p-2 rounded-full bg-purple-500/20 text-purple-400"><Zap className="w-4 h-4" /></div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-bold text-sm">Geomagnetic Storm</h5>
                                    <p className="text-purple-200/60 text-xs">Kp Index: {kp}</p>
                                  </div>
                                  <div className="text-xs font-mono text-slate-500">{storm.startTime?.split('T')[0]}</div>
                                </div>
                              );
                            })}

                            {solarFlares.slice(0, isExpanded ? 6 : 3).map((flare, i) => (
                              <div key={`flare-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                <div className="p-2 rounded-full bg-orange-500/20 text-orange-400"><Flame className="w-4 h-4" /></div>
                                <div className="flex-1">
                                  <h5 className="text-white font-bold text-sm">Solar Flare {flare.classType}</h5>
                                  <p className="text-orange-200/60 text-xs">Active Region {flare.activeRegionNum || 'N/A'}</p>
                                </div>
                                <div className="text-xs font-mono text-slate-500">{flare.beginTime?.split('T')[0]}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GEOMAGNETIC VIEW */}
                    {activeSection === 'geomagnetic' && (
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/10">
                          <GeomagneticStormChart data={geomagneticStorms} />
                        </div>
                        <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {geomagneticStorms.slice(0, visibleItems).map((storm, idx) => {
                            const maxKp = storm.allKpIndex?.[0]?.kpIndex || 5;
                            const level = kpToGScale(maxKp);
                            return (
                              <DataCard
                                key={idx}
                                title={`Storm Level ${level}`}
                                subtext={`ID: ${storm.gstID}`}
                                value={`Max Kp Index: ${maxKp}. Duration from ${storm.startTime?.split('T')[1]?.slice(0, 5)}Z`}
                                accentColor={getSeverityColor(level)}
                                footer={<div className="text-xs text-slate-500 font-mono">Detected: {storm.startTime}</div>}
                              />
                            )
                          })}
                        </div>
                        {geomagneticStorms.length > visibleItems && (
                          <button onClick={handleShowMore} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest font-orbitron">
                            Show More Events
                          </button>
                        )}
                      </div>
                    )}

                    {/* FLARES VIEW */}
                    {activeSection === 'flares' && (
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/10">
                          <SolarFlareChart data={solarFlares} />
                        </div>
                        <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {solarFlares.slice(0, visibleItems).map((flare, idx) => (
                            <DataCard
                              key={idx}
                              title={`Flare Class ${flare.classType}`}
                              subtext={flare.activeRegionNum ? `Region ${flare.activeRegionNum}` : 'Unknown Region'}
                              value={`Peak intensity reached at ${flare.peakTime?.split('T')[1]?.slice(0, 5)}Z. Duration: ${Math.round((new Date(flare.endTime).getTime() - new Date(flare.beginTime).getTime()) / 60000)} mins.`}
                              accentColor={getSeverityColor(flare.classType)}
                              footer={<div className="text-xs text-slate-500 font-mono">Peak: {flare.peakTime}</div>}
                            />
                          ))}
                        </div>
                        {solarFlares.length > visibleItems && (
                          <button onClick={handleShowMore} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest font-orbitron">
                            Show More Events
                          </button>
                        )}
                      </div>
                    )}

                    {/* CME VIEW */}
                    {activeSection === 'cme' && (
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/10">
                          <CMEChart data={cmeEvents} />
                        </div>
                        <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {cmeEvents.slice(0, visibleItems).map((cme, idx) => (
                            <CMECard key={idx} cme={cme} />
                          ))}
                        </div>
                        {cmeEvents.length > visibleItems && (
                          <button onClick={handleShowMore} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest font-orbitron">
                            Show More Events
                          </button>
                        )}
                      </div>
                    )}

                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}