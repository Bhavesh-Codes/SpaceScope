'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Calendar, ChevronLeft, ChevronRight, Loader2, MapPin, Clock, Eye } from 'lucide-react';
import {
    EclipseEvent,
    getUpcomingEclipses,
    formatEclipseDate,
    getEclipseCountdown,
    daysUntilEclipse
} from '@/services/eclipseApi';
import { getEclipseTypeColor, getEclipseTypeDescription, isSolarEclipse } from '@/data/eclipseData';

// Reuse Earth textures from Aurora
const EARTH_TEXTURES = {
    day: '/assets/earth-celes/8k_earth_daymap.jpg',
    night: '/assets/earth-celes/8k_earth_nightmap.jpg',
    normal: '/assets/earth-celes/8k_earth_normal_map.jpg',
    specular: '/assets/earth-celes/8k_earth_specular_map.jpg',
    clouds: '/assets/earth-celes/8k_earth_clouds.jpg',
};

// Convert lat/lng to 3D sphere coordinates
function latLngToVector3(lat: number, lng: number, radius: number = 1.02): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Eclipse Path Visualization (Lines) - Clickable
function EclipsePath({ path, type, isSelected, onClick }: {
    path: [number, number][];
    type: string;
    isSelected: boolean;
    onClick?: () => void;
}) {
    // Convert path to 3D points
    const points = useMemo(() => {
        if (!path || path.length < 2) return [];
        return path.map(([lat, lng]) => latLngToVector3(lat, lng, 1.02));
    }, [path]);

    const color = type === 'Total' ? '#ff4444' : type === 'Annular' ? '#ffaa00' : '#4488ff';
    const [hovered, setHovered] = useState(false);

    // Early return after hooks
    if (points.length < 2) return null;

    return (
        <group>
            {/* Invisible clickable tube for easier selection */}
            <mesh
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <tubeGeometry args={[
                    new THREE.CatmullRomCurve3(points),
                    20, // tubular segments
                    0.03, // radius for clickable area
                    8,   // radial segments
                    false
                ]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Main path line */}
            <Line
                points={points}
                color={color}
                lineWidth={isSelected ? 4 : hovered ? 3 : 2}
                transparent
                opacity={isSelected ? 1 : hovered ? 0.8 : 0.6}
            />

            {/* Colorful path markers */}
            {points.map((point, i) => (
                <mesh
                    key={i}
                    position={point}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                >
                    <sphereGeometry args={[isSelected ? 0.015 : hovered ? 0.012 : 0.01, 8, 8]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={isSelected ? 0.9 : hovered ? 0.7 : 0.5}
                    />
                </mesh>
            ))}

            {/* Glow effect for selected path */}
            {isSelected && (
                <Line
                    points={points}
                    color={color}
                    lineWidth={8}
                    transparent
                    opacity={0.2}
                />
            )}
        </group>
    );
}

// Eclipse Shadow Cone (animated)
function EclipseShadow({ eclipse, isActive }: { eclipse: EclipseEvent | null; isActive: boolean }) {
    const shadowRef = useRef<THREE.Mesh>(null);
    const [shadowPosition, setShadowPosition] = useState<THREE.Vector3 | null>(null);

    useEffect(() => {
        if (eclipse && eclipse.path && eclipse.path.length > 0) {
            // Use middle of path as shadow position
            const midIndex = Math.floor(eclipse.path.length / 2);
            const [lat, lng] = eclipse.path[midIndex];
            setShadowPosition(latLngToVector3(lat, lng, 1.001));
        } else {
            setShadowPosition(null);
        }
    }, [eclipse]);

    useFrame((state) => {
        if (shadowRef.current && isActive) {
            // Subtle pulsing effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
            shadowRef.current.scale.setScalar(scale);
        }
    });

    if (!shadowPosition || !isActive || !eclipse) return null;

    const isTotalOrAnnular = eclipse.type === 'Total' || eclipse.type === 'Annular';
    const shadowColor = eclipse.type === 'Total' ? '#000022' : '#332200';
    const shadowSize = isTotalOrAnnular ? 0.15 : 0.08;

    return (
        <group position={shadowPosition}>
            {/* Umbra (dark center) */}
            <mesh ref={shadowRef}>
                <circleGeometry args={[shadowSize * 0.3, 32]} />
                <meshBasicMaterial
                    color={shadowColor}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Penumbra (lighter outer ring) */}
            <mesh>
                <ringGeometry args={[shadowSize * 0.3, shadowSize, 32]} />
                <meshBasicMaterial
                    color={shadowColor}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

// High-resolution Earth component
function EclipseEarth({
    selectedEclipse,
    showAllPaths,
    onSelectEclipse
}: {
    selectedEclipse: EclipseEvent | null;
    showAllPaths: boolean;
    onSelectEclipse?: (eclipse: EclipseEvent) => void;
}) {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    // Load all 8K textures
    const [dayMap, nightMap, normalMap, specularMap, cloudsMap] = useTexture([
        EARTH_TEXTURES.day,
        EARTH_TEXTURES.night,
        EARTH_TEXTURES.normal,
        EARTH_TEXTURES.specular,
        EARTH_TEXTURES.clouds,
    ]);

    // Configure textures
    useMemo(() => {
        [dayMap, nightMap, normalMap, specularMap, cloudsMap].forEach(tex => {
            tex.anisotropy = 16;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
        });
    }, [dayMap, nightMap, normalMap, specularMap, cloudsMap]);

    const earthGeometry = useMemo(() => new THREE.SphereGeometry(1, 256, 256), []);

    // Day/night shader
    const earthMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: dayMap },
                nightTexture: { value: nightMap },
                normalTexture: { value: normalMap },
                sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform vec3 sunDirection;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
                    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                    
                    float sunDot = dot(vNormal, sunDirection);
                    float dayNightMix = smoothstep(-0.15, 0.25, sunDot);
                    
                    vec3 dayLit = dayColor * (0.15 + max(0.0, sunDot));
                    vec3 nightLit = nightColor * 1.5;
                    
                    gl_FragColor = vec4(mix(nightLit, dayLit, dayNightMix), 1.0);
                }
            `,
        });
    }, [dayMap, nightMap, normalMap]);

    const cloudMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
            alphaMap: cloudsMap,
        });
    }, [cloudsMap]);

    // Rotation disabled by user request
    /* useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0003;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.0005;
        }
    }); */

    // Get all eclipses for path rendering
    const upcomingEclipses = useMemo(() => getUpcomingEclipses(10), []);

    return (
        <group>
            {/* Main Earth */}
            <mesh ref={earthRef} geometry={earthGeometry}>
                <primitive object={earthMaterial} attach="material" />
            </mesh>

            {/* Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[1.008, 128, 128]} />
                <primitive object={cloudMaterial} attach="material" />
            </mesh>

            {/* Atmosphere glow removed */}

            {/* Eclipse paths */}
            {showAllPaths && upcomingEclipses
                .filter(e => e.path && e.path.length > 0)
                .map(eclipse => (
                    <EclipsePath
                        key={eclipse.id}
                        path={eclipse.path}
                        type={eclipse.type}
                        isSelected={selectedEclipse?.id === eclipse.id}
                        onClick={() => onSelectEclipse?.(eclipse)}
                    />
                ))
            }

            {/* Selected eclipse path (if not showing all) */}
            {!showAllPaths && selectedEclipse && selectedEclipse.path && (
                <EclipsePath
                    path={selectedEclipse.path}
                    type={selectedEclipse.type}
                    isSelected={true}
                />
            )}

            {/* Eclipse shadow for selected eclipse */}
            {/* Eclipse shadow removed */}
        </group>
    );
}

// Camera controller with focus on selected eclipse
function CameraController({ targetPosition }: { targetPosition?: THREE.Vector3 }) {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        camera.position.set(0, 0.5, 2.5);
    }, [camera]);

    // Smoothly move camera to focus on eclipse region
    useEffect(() => {
        if (targetPosition && controlsRef.current) {
            // Calculate camera position to view the target
            const distance = 2.2;
            const newCameraPos = targetPosition.clone().normalize().multiplyScalar(distance);

            // Animate camera
            const startPos = camera.position.clone();
            const startTime = Date.now();
            const duration = 1000;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                const easeT = 1 - Math.pow(1 - t, 3); // Ease out cubic

                camera.position.lerpVectors(startPos, newCameraPos, easeT);
                camera.lookAt(0, 0, 0);

                if (t < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();

            // Update controls target
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
            }
        }
    }, [targetPosition, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={1.3}
            maxDistance={5}
            autoRotate={false}
            autoRotateSpeed={0}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
        />
    );
}

// Eclipse Info Panel
function EclipseInfoPanel({
    eclipse,
    loading
}: {
    eclipse: EclipseEvent | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span className="text-sm">Loading eclipse data...</span>
                </div>
            </div>
        );
    }

    if (!eclipse) return null;

    const typeColor = getEclipseTypeColor(eclipse.type);
    const countdown = getEclipseCountdown(eclipse);
    const days = daysUntilEclipse(eclipse);
    const isPast = days < 0;
    const isSolar = isSolarEclipse(eclipse);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white max-w-sm"
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}40` }}
                >
                    {isSolar ? (
                        <Sun className="w-5 h-5" style={{ color: typeColor }} />
                    ) : (
                        <Moon className="w-5 h-5" style={{ color: typeColor }} />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{eclipse.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
                        >
                            {eclipse.type}
                        </span>
                        <span className="text-xs text-slate-400">
                            {isSolar ? 'Solar' : 'Lunar'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{formatEclipseDate(eclipse.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Peak: {eclipse.peakTime}</span>
                    {eclipse.maxDuration !== 'N/A' && (
                        <span className="text-slate-500">• {eclipse.maxDuration}</span>
                    )}
                </div>

                {eclipse.visibleFrom.length > 0 && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="text-slate-300">
                            {eclipse.visibleFrom.slice(0, 4).join(', ')}
                            {eclipse.visibleFrom.length > 4 && ` +${eclipse.visibleFrom.length - 4} more`}
                        </span>
                    </div>
                )}

                {/* Countdown */}
                <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                            {isPast ? 'Occurred' : 'Countdown'}
                        </span>
                        <span
                            className={`font-bold text-lg ${isPast ? 'text-slate-500' : ''}`}
                            style={{ color: isPast ? undefined : typeColor }}
                        >
                            {countdown}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {eclipse.description}
            </p>
        </motion.div>
    );
}

// Eclipse Selector
function EclipseSelector({
    eclipses,
    selectedIndex,
    onSelect
}: {
    eclipses: EclipseEvent[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white"
        >
            <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold">Upcoming Eclipses</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
                    disabled={selectedIndex === 0}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 flex-1 text-center">
                    {selectedIndex + 1} / {eclipses.length}
                </span>
                <button
                    onClick={() => onSelect(Math.min(eclipses.length - 1, selectedIndex + 1))}
                    disabled={selectedIndex === eclipses.length - 1}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Eclipse list */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                {eclipses.slice(0, 8).map((eclipse, index) => {
                    const typeColor = getEclipseTypeColor(eclipse.type);
                    const isSelected = index === selectedIndex;
                    const isSolar = isSolarEclipse(eclipse);

                    return (
                        <button
                            key={eclipse.id}
                            onClick={() => onSelect(index)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isSelected
                                ? 'bg-white/15 border border-white/20'
                                : 'hover:bg-white/5'
                                }`}
                        >
                            <div
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: `${typeColor}20` }}
                            >
                                {isSolar ? (
                                    <Sun className="w-3 h-3" style={{ color: typeColor }} />
                                ) : (
                                    <Moon className="w-3 h-3" style={{ color: typeColor }} />
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-xs font-medium truncate">{eclipse.type}</div>
                                <div className="text-[10px] text-slate-500">
                                    {new Date(eclipse.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

// Legend
function EclipseLegend() {
    const types = [
        { type: 'Total', color: '#ff6b6b', desc: 'Complete coverage' },
        { type: 'Annular', color: '#ffd93d', desc: 'Ring of fire' },
        { type: 'Partial', color: '#6bcbff', desc: 'Partial coverage' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-24 right-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-white"
        >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eclipse Types</span>
            <div className="space-y-1.5 mt-2">
                {types.map(({ type, color, desc }) => (
                    <div key={type} className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-slate-300">{type}</span>
                        <span className="text-[10px] text-slate-500">- {desc}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold">Loading Eclipse Globe...</p>
                <p className="text-slate-400 text-sm mt-2">Preparing visualization</p>
            </div>
        </div>
    );
}

// Main export component
export default function EclipseGlobe() {
    const [eclipses, setEclipses] = useState<EclipseEvent[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAllPaths, setShowAllPaths] = useState(true);

    useEffect(() => {
        const loadEclipses = async () => {
            setLoading(true);
            try {
                const upcoming = getUpcomingEclipses(10);
                setEclipses(upcoming);
            } catch (error) {
                console.error('Error loading eclipses:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEclipses();
    }, []);

    const selectedEclipse = eclipses[selectedIndex] || null;

    // Calculate target position for camera focus from eclipse path
    const targetPosition = useMemo(() => {
        if (selectedEclipse?.path && selectedEclipse.path.length > 0) {
            const midIndex = Math.floor(selectedEclipse.path.length / 2);
            const [lat, lng] = selectedEclipse.path[midIndex];
            return latLngToVector3(lat, lng, 1);
        }
        return undefined;
    }, [selectedEclipse]);

    // Handle eclipse selection from clicking on paths
    const handleSelectEclipse = (eclipse: EclipseEvent) => {
        const index = eclipses.findIndex(e => e.id === eclipse.id);
        if (index !== -1) {
            setSelectedIndex(index);
        }
    };

    return (
        <div className="w-full h-full relative bg-black">
            <Suspense fallback={<LoadingFallback />}>
                <Canvas
                    camera={{ position: [0, 0.5, 2.5], fov: 45 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]}
                >
                    <ambientLight intensity={0.1} />
                    <directionalLight position={[5, 3, 5]} intensity={1.5} />

                    <Stars
                        radius={150}
                        depth={80}
                        count={6000}
                        factor={5}
                        saturation={0}
                        fade
                        speed={0.2}
                    />

                    <EclipseEarth
                        selectedEclipse={selectedEclipse}
                        showAllPaths={showAllPaths}
                        onSelectEclipse={handleSelectEclipse}
                    />
                    <CameraController targetPosition={targetPosition} />
                </Canvas>
            </Suspense>

            {/* UI Overlays */}
            <AnimatePresence>
                <EclipseInfoPanel eclipse={selectedEclipse} loading={loading} />
                {eclipses.length > 0 && (
                    <EclipseSelector
                        eclipses={eclipses}
                        selectedIndex={selectedIndex}
                        onSelect={setSelectedIndex}
                    />
                )}
                <EclipseLegend />
            </AnimatePresence>

            {/* Title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-orbitron font-bold text-white tracking-widest"
                >
                    ECLIPSE TRACKER
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-slate-400 mt-1"
                >
                    Solar & Lunar Eclipse Visibility Paths
                </motion.p>
            </div>

            {/* Toggle for showing all paths */}
            <button
                onClick={() => setShowAllPaths(!showAllPaths)}
                className="absolute top-24 left-6 px-3 py-1.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-colors"
            >
                {showAllPaths ? '🗺️ All Paths' : '📍 Selected Only'}
            </button>
        </div>
    );
}
