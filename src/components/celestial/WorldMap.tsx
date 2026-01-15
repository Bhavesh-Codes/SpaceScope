import React, { memo, useState, useEffect, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion, AnimatePresence } from 'framer-motion';
import { CelestialEvent, EVENT_COLORS } from '@/data/celestialEvents';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Geographic constants
const EQUATOR_LAT = 0;
const TROPIC_CANCER_LAT = 23.5;
const TROPIC_CAPRICORN_LAT = -23.5;

// Zoom and pan limits
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

interface WorldMapProps {
    selectedEvent: CelestialEvent | null;
    userLocation: { lat: number, lng: number, name: string } | null;
    onLocationSelect: (location: { lat: number, lng: number, name: string }) => void;
    onEventClick?: (event: CelestialEvent) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ selectedEvent, userLocation, onLocationSelect, onEventClick }) => {
    const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

    // If an event is selected, center the map on it
    useEffect(() => {
        if (selectedEvent) {
            const [lat, lng] = selectedEvent.coordinates;
            if (lat !== 0 || lng !== 0) {
                setPosition({ coordinates: [lng, lat], zoom: 2 });
            } else {
                setPosition({ coordinates: [0, 20], zoom: 1 });
            }
        }
    }, [selectedEvent]);

    // Handle zoom/pan with constraints
    const handleMoveEnd = useCallback((newPosition: { coordinates: [number, number], zoom: number }) => {
        let [lng, lat] = newPosition.coordinates;
        let zoom = newPosition.zoom;

        // Clamp zoom
        zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

        // Constrain panning based on zoom level
        const maxLat = 85 / zoom;
        const maxLng = 180 / zoom;

        lat = Math.max(-maxLat, Math.min(maxLat, lat));
        lng = Math.max(-maxLng, Math.min(maxLng, lng));

        setPosition({ coordinates: [lng, lat], zoom });
    }, []);

    // Generate latitude line coordinates
    const generateLatitudeLine = (latitude: number) => {
        const points: [number, number][] = [];
        for (let lng = -180; lng <= 180; lng += 10) {
            points.push([lng, latitude]);
        }
        return points;
    };

    const equatorLine = generateLatitudeLine(EQUATOR_LAT);
    const tropicCancerLine = generateLatitudeLine(TROPIC_CANCER_LAT);
    const tropicCapricornLine = generateLatitudeLine(TROPIC_CAPRICORN_LAT);

    // Zoom controls
    const handleZoomIn = () => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.min(MAX_ZOOM, prev.zoom * 1.5)
        }));
    };

    const handleZoomOut = () => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.max(MIN_ZOOM, prev.zoom / 1.5)
        }));
    };

    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 140
                }}
                className="w-full h-full"
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                >
                    {/* Base World Map */}
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const isSelected = userLocation?.name === geo.properties.name;
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={isSelected ? "#0891b2" : "#1e293b"}
                                        stroke="#334155"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none", transition: "all 250ms" },
                                            hover: { fill: "#334155", outline: "none", cursor: "pointer" },
                                            pressed: { fill: "#0e7490", outline: "none" },
                                        }}
                                        onClick={() => {
                                            onLocationSelect({
                                                lat: 0,
                                                lng: 0,
                                                name: geo.properties.name
                                            });
                                        }}
                                    />
                                )
                            })
                        }
                    </Geographies>

                    {/* Geographic Lines - Equator */}
                    <Line
                        coordinates={equatorLine}
                        stroke="#f97316"
                        strokeWidth={1.5 / position.zoom}
                        strokeDasharray="5,3"
                        strokeOpacity={0.8}
                    />

                    {/* Tropic of Cancer (23.5°N) */}
                    <Line
                        coordinates={tropicCancerLine}
                        stroke="#eab308"
                        strokeWidth={1 / position.zoom}
                        strokeDasharray="3,3"
                        strokeOpacity={0.6}
                    />

                    {/* Tropic of Capricorn (23.5°S) */}
                    <Line
                        coordinates={tropicCapricornLine}
                        stroke="#eab308"
                        strokeWidth={1 / position.zoom}
                        strokeDasharray="3,3"
                        strokeOpacity={0.6}
                    />

                    {/* User Location Marker */}
                    {userLocation && userLocation.lat !== 0 && (
                        <Marker coordinates={[userLocation.lng, userLocation.lat]}>
                            <circle r={4 / position.zoom} fill="#22d3ee" stroke="#fff" strokeWidth={2 / position.zoom} />
                        </Marker>
                    )}

                    {/* Event marker removed as requested */}

                </ZoomableGroup>
            </ComposableMap>

            {/* Geographic Lines Legend - positioned above timeline */}
            <div className="absolute bottom-72 left-4 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 text-[10px] font-mono space-y-1 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-orange-500" style={{ borderStyle: 'dashed' }} />
                    <span className="text-orange-400">Equator (0°)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed' }} />
                    <span className="text-yellow-400">Tropics (±23.5°)</span>
                </div>
            </div>

            {/* Zoom Controls with indicator - positioned above timeline */}
            <div className="absolute bottom-72 right-4 flex flex-col items-center gap-2 z-10">
                <button
                    onClick={handleZoomIn}
                    disabled={position.zoom >= MAX_ZOOM}
                    className="p-2 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ZoomIn className="w-4 h-4 text-white" />
                </button>
                {/* Zoom amount indicator */}
                <div className="bg-black/70 backdrop-blur-sm text-slate-300 text-[10px] px-2 py-1 rounded-lg border border-white/20 font-mono">
                    {position.zoom.toFixed(1)}x
                </div>
                <button
                    onClick={handleZoomOut}
                    disabled={position.zoom <= MIN_ZOOM}
                    className="p-2 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ZoomOut className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
};

export default memo(WorldMap);
