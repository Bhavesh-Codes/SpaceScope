'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wind, Zap, Radio, Flame, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSolarFlares, fetchCMEEvents, fetchGeomagneticStorms, SolarFlare, CMEEvent, GeomagneticStorm, kpToGScale } from '@/services/nasaApi';
import SolarFlareChart from '@/components/charts/SolarFlareChart';
import CMEChart from '@/components/charts/CMEChart';
import GeomagneticStormChart from '@/components/charts/GeomagneticStormChart';
import Sun3DViewer from '@/components/charts/Sun3DViewer';

// ... (previous imports)

export default function CosmicWeatherWidget({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('alerts');

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
      console.log('Fetching cosmic weather data...');
      try {
        const [flares, cmes, storms] = await Promise.all([
          fetchSolarFlares(),
          fetchCMEEvents(),
          fetchGeomagneticStorms()
        ]);

        console.log('Data received:', {
          flares: flares.length,
          cmes: cmes.length,
          storms: storms.length
        });

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

  const tabs = [
    { id: 'alerts', label: 'Dashboard', icon: AlertTriangle },
    { id: 'gst', label: 'Geomagnetic', icon: Zap },
    { id: 'flares', label: 'Solar Flares', icon: Flame },
    { id: 'cme', label: 'CME', icon: Wind }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const DataCard = ({ title, value, subtext, accentColor = "text-white", footer }: any) => (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 transition-colors hover:bg-slate-800/50 block w-full">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor.replace('text-', '')}`} />
      <div className="mb-4">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-inter mb-1">{subtext}</p>
        <h4 className={`text-2xl font-orbitron font-bold ${accentColor} truncate`}>{title}</h4>
      </div>
      <div className="font-inter text-slate-300 text-sm leading-relaxed mb-4">
        {value}
      </div>
      {footer && (
        <div className="border-t border-white/10 pt-4 mt-auto">
          {footer}
        </div>
      )}
      <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
          <circle cx="20" cy="20" r="4" fill="white" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center opacity-30 blur-2xl scale-110 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />

      {/* Header Section */}
      <header className="relative z-10 px-6 pt-6 pb-4 border-b border-white/10 bg-black/20 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-white tracking-wider">COSMIC WEATHER</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                <p className="text-slate-400 text-xs font-inter tracking-[0.2em] uppercase">
                  {loading ? 'INITIALIZING SENSORS...' : error ? 'SENSOR ERROR' : 'SYSTEM ONLINE'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-900/50 rounded-full p-1 border border-white/10 overflow-x-auto max-w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-orbitron uppercase transition-all ${activeTab === tab.id
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto custom-scrollbar">

          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-orbitron text-white mb-2">Connection Information</h3>
              <p className="text-slate-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">

              {/* DASHBOARD TAB */}
              {activeTab === 'alerts' && (
                <>
                  <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-red-900/40 to-slate-900/50 rounded-3xl border border-red-500/20 p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                      <AlertTriangle className="w-64 h-64 text-red-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">Critical Status Report</h2>
                    <p className="text-slate-300 font-inter max-w-2xl text-lg">
                      {loading ? 'Loading live data...' : 'Active solar phenomena detected. Live data from NASA Space Weather Database.'}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : geomagneticStorms.length} Storms
                      </div>
                      <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : solarFlares.length} Flares
                      </div>
                      <div className="px-4 py-2 bg-slate-500/20 border border-slate-500/50 rounded-lg text-slate-300 font-orbitron text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : cmeEvents.length} CMEs
                      </div>
                    </div>
                  </div>

                  {!loading && geomagneticStorms.length === 0 && solarFlares.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 p-8 border border-white/10 rounded-3xl bg-black/40 text-center">
                      <p className="text-slate-400 font-orbitron">No active alerts at this time. Space weather is calm.</p>
                    </div>
                  )}

                  {geomagneticStorms.slice(0, 3).map((storm, index) => {
                    const maxKp = storm.allKpIndex?.[0]?.kpIndex || 5;
                    const level = kpToGScale(maxKp);
                    return (
                      <DataCard
                        key={`storm-preview-${storm.gstID || index}`}
                        title={`Storm ${level}`}
                        subtext="Geomagnetic Event"
                        value={`Kp Index: ${maxKp}. ${maxKp >= 7 ? 'Severe aurora activity.' : maxKp >= 5 ? 'Moderate aurora activity.' : 'Minor activity.'}`}
                        accentColor={getSeverityColor(level)}
                        footer={
                          <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>{storm.startTime?.split('T')[1]?.slice(0, 5) || 'N/A'}Z</span>
                            <span className={getSeverityColor(level)}>{level}</span>
                          </div>
                        }
                      />
                    );
                  })}
                </>
              )}

              {/* GEOMAGNETIC TAB */}
              {activeTab === 'gst' && (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    {loading ? (
                      <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                      </div>
                    ) : (
                      <GeomagneticStormChart data={geomagneticStorms} />
                    )}
                  </div>
                  {geomagneticStorms.slice(0, 9).map((storm, index) => {
                    const maxKp = storm.allKpIndex?.[0]?.kpIndex || 5;
                    const level = kpToGScale(maxKp);
                    return (
                      <DataCard
                        key={storm.gstID || index}
                        title={`Level ${level}`}
                        subtext="Geomagnetic Storm"
                        value={`Max Kp Index: ${maxKp}.`}
                        accentColor={getSeverityColor(level)}
                        footer={<p className="text-xs font-mono text-slate-500">{storm.startTime?.replace('T', ' ')?.slice(0, 16)} UTC</p>}
                      />
                    );
                  })}
                </>
              )}

              {/* FLARES TAB */}
              {activeTab === 'flares' && (
                <div className="md:col-span-2 lg:col-span-3">
                  <Sun3DViewer solarFlares={solarFlares} loading={loading} />
                </div>
              )}

              {/* CME TAB */}
              {activeTab === 'cme' && (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    {loading ? (
                      <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      </div>
                    ) : (
                      <CMEChart data={cmeEvents} />
                    )}
                  </div>
                  {cmeEvents.slice(0, 9).map((cme, index) => {
                    const speed = cme.cmeAnalyses?.[0]?.speed;
                    const type = cme.cmeAnalyses?.[0]?.type || 'CME';
                    return (
                      <DataCard
                        key={cme.activityID || index}
                        title={type}
                        subtext="Coronal Mass Ejection"
                        value={`${speed ? `Velocity: ${speed} km/s.` : ''}`}
                        accentColor="text-slate-300"
                        footer={<p className="text-xs font-mono text-slate-500">{cme.startTime?.split('T')[0]}</p>}
                      />
                    );
                  })}
                </>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}