'use client';

import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame, Loader2, Activity, Zap } from 'lucide-react';
import { SolarFlare, flareClassToValue } from '@/services/nasaApi';
import SolarFlareChart from './SolarFlareChart';

const SUN_TEXTURE = '/assets/earth-celes/8k_sun.jpg';

// Aurora-style Solar Flare Loops - many small arcs erupting from the surface
function SolarFlareLoops({ intensity = 0.5 }: { intensity: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const flareCount = 60; // Large quantity of small flares

    const flares = useMemo(() => {
        const flareData = [];
        for (let i = 0; i < flareCount; i++) {
            // Random position on sun surface
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Flare properties - small in size
            const arcHeight = 0.05 + Math.random() * 0.15; // Small arcs
            const arcWidth = 0.02 + Math.random() * 0.08;
            const speed = 0.5 + Math.random() * 1.5;
            const phase = Math.random() * Math.PI * 2;

            // Color variation: yellow -> orange -> red
            const colorT = Math.random();
            let color;
            if (colorT < 0.4) {
                color = new THREE.Color('#ffcc00'); // Yellow
            } else if (colorT < 0.7) {
                color = new THREE.Color('#ff8800'); // Orange
            } else {
                color = new THREE.Color('#ff4400'); // Red-orange
            }

            flareData.push({
                theta,
                phi,
                arcHeight,
                arcWidth,
                speed,
                phase,
                color,
            });
        }
        return flareData;
    }, []);

    return (
        <group ref={groupRef}>
            {flares.map((flare, index) => (
                <SolarFlareArc key={index} {...flare} intensity={intensity} />
            ))}
        </group>
    );
}

// Individual solar flare arc - aurora-like ribbon
function SolarFlareArc({
    theta,
    phi,
    arcHeight,
    arcWidth,
    speed,
    phase,
    color,
    intensity,
}: {
    theta: number;
    phi: number;
    arcHeight: number;
    arcWidth: number;
    speed: number;
    phase: number;
    color: THREE.Color;
    intensity: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Position on sphere surface
    const basePosition = useMemo(() => {
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }, [theta, phi]);

    // Create arc geometry
    const geometry = useMemo(() => {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, arcHeight, 0),
            new THREE.Vector3(arcWidth, 0, 0)
        );
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
        return tubeGeometry;
    }, [arcHeight, arcWidth]);

    // Aurora-like shader material
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: intensity },
                color: { value: color },
                phase: { value: phase },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                uniform float phase;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Animated wave along the arc
                    vec3 pos = position;
                    float wave = sin(uv.x * 20.0 + time * 3.0 + phase) * 0.002;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color;
                uniform float phase;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    // Fade at ends of arc
                    float fadeFactor = sin(vUv.x * 3.14159);
                    fadeFactor = pow(fadeFactor, 0.5);
                    
                    // Pulsing glow
                    float pulse = 0.7 + 0.3 * sin(time * 4.0 + phase);
                    
                    // Shimmer effect
                    float shimmer = 0.8 + 0.2 * sin(vUv.x * 30.0 + time * 5.0);
                    
                    vec3 finalColor = color * 1.5;
                    float alpha = fadeFactor * intensity * pulse * shimmer * 0.8;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, [color, intensity, phase]);

    // Orient arc to surface normal and animate
    useFrame((state) => {
        if (meshRef.current && materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
            materialRef.current.uniforms.intensity.value = intensity;
        }
    });

    // Calculate rotation to align with surface
    const rotation = useMemo(() => {
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, basePosition.clone().normalize());
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        // Add random rotation around the normal
        euler.z += Math.random() * Math.PI * 2;
        return euler;
    }, [basePosition]);

    return (
        <mesh
            ref={meshRef}
            position={basePosition.clone().multiplyScalar(1.0)}
            rotation={rotation}
            geometry={geometry}
        >
            <primitive object={shaderMaterial} ref={materialRef} attach="material" />
        </mesh>
    );
}

// Solar flare particles - many small particles streaming outward
function SolarFlareParticles({ intensity = 0.5 }: { intensity: number }) {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 8000; // Large quantity

    const [positions, velocities, colors, lifetimes] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const lifetimes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Start from random point on sun surface
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.0;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Outward velocity - small and varied
            const speed = 0.003 + Math.random() * 0.008;
            velocities[i * 3] = positions[i * 3] * speed;
            velocities[i * 3 + 1] = positions[i * 3 + 1] * speed;
            velocities[i * 3 + 2] = positions[i * 3 + 2] * speed;

            // Color gradient: bright yellow -> orange -> deep red
            const t = Math.random();
            if (t < 0.3) {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.4; // Bright yellow
            } else if (t < 0.6) {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.1; // Orange
            } else if (t < 0.85) {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.05; // Red-orange
            } else {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2; // Yellow-white
            }

            lifetimes[i] = Math.random();
        }

        return [positions, velocities, colors, lifetimes];
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < count; i++) {
                // Move outward
                pos[i * 3] += velocities[i * 3] * intensity;
                pos[i * 3 + 1] += velocities[i * 3 + 1] * intensity;
                pos[i * 3 + 2] += velocities[i * 3 + 2] * intensity;

                // Check if too far, reset to surface
                const dist = Math.sqrt(
                    pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2
                );
                if (dist > 1.5 + Math.random() * 0.5) {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    pos[i * 3] = Math.sin(phi) * Math.cos(theta);
                    pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
                    pos[i * 3 + 2] = Math.cos(phi);
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
            particlesRef.current.rotation.y += 0.0003;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.008}
                vertexColors
                transparent
                opacity={0.7 * intensity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
}

// Main Sun mesh with 8K texture - HIGH POLY
function Sun({ flareIntensity = 0.5 }: { flareIntensity: number }) {
    const sunRef = useRef<THREE.Mesh>(null);
    const sunTexture = useTexture(SUN_TEXTURE);

    useMemo(() => {
        sunTexture.anisotropy = 16;
        sunTexture.minFilter = THREE.LinearMipmapLinearFilter;
        sunTexture.magFilter = THREE.LinearFilter;
    }, [sunTexture]);

    // High-poly sphere geometry (256 segments for ultra-smooth)
    const sunGeometry = useMemo(() => {
        return new THREE.SphereGeometry(1, 256, 256);
    }, []);

    const sunMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                sunTexture: { value: sunTexture },
                time: { value: 0 },
                flareIntensity: { value: flareIntensity },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    
                    // Very subtle surface distortion for realism
                    vec3 pos = position;
                    float distortion = sin(pos.x * 15.0 + time * 0.5) * cos(pos.y * 15.0 + time * 0.3) * 0.003;
                    distortion += sin(pos.z * 12.0 - time * 0.4) * 0.002;
                    pos += normal * distortion;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D sunTexture;
                uniform float time;
                uniform float flareIntensity;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Animated UV for surface convection motion
                    vec2 animatedUv = vUv;
                    animatedUv.x += sin(time * 0.03 + vUv.y * 4.0) * 0.008;
                    animatedUv.y += cos(time * 0.02 + vUv.x * 4.0) * 0.005;
                    
                    vec3 color = texture2D(sunTexture, animatedUv).rgb;
                    
                    // Enhance brightness and contrast
                    color = pow(color, vec3(0.9)); // Slight gamma correction
                    color *= 1.4;
                    
                    // Subtle pulsating glow
                    float pulse = 0.97 + 0.03 * sin(time * 2.0);
                    color *= pulse;
                    
                    // Boost based on flare intensity
                    float boost = 1.0 + flareIntensity * 0.2;
                    color *= boost;
                    
                    // Subtle fresnel edge glow (very mild, not red)
                    vec3 viewDir = normalize(-vPosition);
                    float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 3.0);
                    color += vec3(1.0, 0.7, 0.3) * fresnel * 0.15;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
        });
    }, [sunTexture, flareIntensity]);

    useFrame((state) => {
        if (sunRef.current) {
            sunRef.current.rotation.y += 0.0008;
            (sunRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
            (sunRef.current.material as THREE.ShaderMaterial).uniforms.flareIntensity.value = flareIntensity;
        }
    });

    return (
        <group>
            {/* Main Sun sphere - HIGH POLY 256x256 segments */}
            <mesh ref={sunRef} geometry={sunGeometry}>
                <primitive object={sunMaterial} attach="material" />
            </mesh>

            {/* Aurora-style solar flare loops */}
            <SolarFlareLoops intensity={flareIntensity} />

            {/* Many small flare particles */}
            <SolarFlareParticles intensity={flareIntensity} />
        </group>
    );
}

// Camera controller
function CameraController() {
    const { camera } = useThree();

    React.useEffect(() => {
        camera.position.set(0, 0, 3);
    }, [camera]);

    return (
        <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={6}
            autoRotate
            autoRotateSpeed={0.3}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
        />
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-400 mx-auto mb-3" />
                <p className="text-white text-sm font-semibold">Loading 8K Sun Model...</p>
            </div>
        </div>
    );
}

// Data Card Component
const DataCard = ({ title, value, subtext, accentColor = "text-white", footer }: {
    title: string;
    value: React.ReactNode;
    subtext: string;
    accentColor?: string;
    footer?: React.ReactNode;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 transition-colors hover:bg-slate-800/50"
    >
        <div className={`absolute top-0 left-0 w-1 h-full ${accentColor.replace('text-', 'bg-')}`} />

        <div className="mb-3">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-inter mb-1">{subtext}</p>
            <h4 className={`text-xl font-orbitron font-bold ${accentColor} truncate`}>{title}</h4>
        </div>

        <div className="font-inter text-slate-300 text-sm leading-relaxed mb-3">
            {value}
        </div>

        {footer && (
            <div className="border-t border-white/10 pt-3 mt-auto">
                {footer}
            </div>
        )}
    </motion.div>
);

interface Sun3DViewerProps {
    solarFlares: SolarFlare[];
    loading: boolean;
}

export default function Sun3DViewer({ solarFlares, loading }: Sun3DViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCount, setShowCount] = useState(6);

    // Calculate flare intensity based on recent activity
    const flareIntensity = useMemo(() => {
        if (solarFlares.length === 0) return 0.4;
        const recentFlares = solarFlares.slice(0, 5);
        const avgValue = recentFlares.reduce((sum, f) => sum + flareClassToValue(f.classType), 0) / recentFlares.length;
        // Normalize to 0.4-1.0 range
        return Math.min(1, Math.max(0.4, avgValue / 8000));
    }, [solarFlares]);

    const getSeverityColor = (classType: string) => {
        if (!classType) return 'text-slate-200';
        const letter = classType.charAt(0).toUpperCase();
        if (letter === 'X') return 'text-red-500';
        if (letter === 'M') return 'text-orange-400';
        if (letter === 'C') return 'text-yellow-400';
        return 'text-slate-200';
    };

    // Stats summary
    const stats = useMemo(() => {
        const xClass = solarFlares.filter(f => f.classType?.startsWith('X')).length;
        const mClass = solarFlares.filter(f => f.classType?.startsWith('M')).length;
        const cClass = solarFlares.filter(f => f.classType?.startsWith('C') || f.classType?.startsWith('B')).length;
        return { xClass, mClass, cClass, total: solarFlares.length };
    }, [solarFlares]);

    const handleShowMore = () => {
        setShowCount(prev => Math.min(prev + 6, solarFlares.length));
    };

    const handleShowLess = () => {
        setShowCount(6);
    };

    return (
        <div className="w-full space-y-4">
            {/* 3D Sun Viewer */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full aspect-square max-h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-black"
            >
                <Suspense fallback={<LoadingFallback />}>
                    <Canvas
                        camera={{ position: [0, 0, 3], fov: 45 }}
                        gl={{
                            antialias: true,
                            alpha: true,
                            powerPreference: 'high-performance',
                        }}
                        dpr={[1, 2]}
                    >
                        <ambientLight intensity={0.1} />
                        <pointLight position={[0, 0, 0]} intensity={2} color="#ff8800" />

                        <Stars
                            radius={100}
                            depth={50}
                            count={3000}
                            factor={4}
                            saturation={0}
                            fade
                            speed={0.2}
                        />

                        <Sun flareIntensity={flareIntensity} />
                        <CameraController />
                    </Canvas>
                </Suspense>

                {/* Overlay Stats */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-orbitron text-sm font-bold">SOLAR ACTIVITY</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <div className="text-center">
                            <p className="text-red-500 font-bold text-lg">{stats.xClass}</p>
                            <p className="text-slate-400">X-Class</p>
                        </div>
                        <div className="text-center">
                            <p className="text-orange-400 font-bold text-lg">{stats.mClass}</p>
                            <p className="text-slate-400">M-Class</p>
                        </div>
                        <div className="text-center">
                            <p className="text-yellow-400 font-bold text-lg">{stats.cClass}</p>
                            <p className="text-slate-400">C/B-Class</p>
                        </div>
                    </div>
                </div>

                {/* Activity Indicator */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                    <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 ${flareIntensity > 0.7 ? 'text-red-400' : flareIntensity > 0.5 ? 'text-orange-400' : 'text-green-400'}`} />
                        <span className="text-white text-xs font-semibold">
                            {flareIntensity > 0.7 ? 'HIGH' : flareIntensity > 0.5 ? 'MODERATE' : 'LOW'} ACTIVITY
                        </span>
                    </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                    <p className="text-white font-orbitron text-lg font-bold tracking-wider">8K SUN MODEL</p>
                    <p className="text-slate-400 text-xs">Real-time solar flare visualization</p>
                </div>
            </motion.div>

            {/* Expandable Data Section */}
            <motion.div
                className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
                {/* Toggle Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-orbitron font-bold tracking-wide">
                            SOLAR FLARE DATA & ANALYTICS
                        </span>
                        <span className="text-slate-400 text-sm font-inter">
                            ({solarFlares.length} events in last 30 days)
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    </motion.div>
                </button>

                {/* Expandable Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 pt-0 space-y-6">
                                {/* Chart */}
                                <div className="w-full">
                                    {loading ? (
                                        <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                                        </div>
                                    ) : (
                                        <SolarFlareChart data={solarFlares} />
                                    )}
                                </div>

                                {/* Data Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {solarFlares.slice(0, showCount).map((flare, index) => (
                                        <DataCard
                                            key={flare.flrID || index}
                                            title={`Class ${flare.classType}`}
                                            subtext={flare.activeRegionNum ? `Sunspot AR ${flare.activeRegionNum}` : 'Source Region'}
                                            value={`Solar flare event peaking at ${flare.peakTime?.split('T')[1]?.slice(0, 5) || 'N/A'} UTC. Potential radio blackouts on sunlit side of Earth.`}
                                            accentColor={getSeverityColor(flare.classType)}
                                            footer={<p className="text-xs font-mono text-slate-500">{flare.beginTime?.split('T')[0]} UTC</p>}
                                        />
                                    ))}
                                </div>

                                {/* Show More / Show Less Buttons */}
                                {solarFlares.length > 6 && (
                                    <div className="flex justify-center gap-4">
                                        {showCount < solarFlares.length && (
                                            <button
                                                onClick={handleShowMore}
                                                className="px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-full text-orange-300 font-orbitron text-sm uppercase tracking-wider transition-all hover:scale-105"
                                            >
                                                Show More ({solarFlares.length - showCount} remaining)
                                            </button>
                                        )}
                                        {showCount > 6 && (
                                            <button
                                                onClick={handleShowLess}
                                                className="px-6 py-2 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/50 rounded-full text-slate-300 font-orbitron text-sm uppercase tracking-wider transition-all hover:scale-105"
                                            >
                                                Show Less
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
