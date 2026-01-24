'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, RefreshCw, Loader2 } from 'lucide-react';
import { fetchAuroraData, getAuroraLatitude, getAuroraIntensity, AuroraData } from '@/services/auroraApi';

// 8K High-resolution Earth textures from local assets
const EARTH_TEXTURES = {
    day: '/assets/earth-celes/8k_earth_daymap.jpg',
    night: '/assets/earth-celes/8k_earth_nightmap.jpg',
    normal: '/assets/earth-celes/8k_earth_normal_map.jpg',
    specular: '/assets/earth-celes/8k_earth_specular_map.jpg',
    clouds: '/assets/earth-celes/8k_earth_clouds.jpg',
};

// Aurora ring shader material - enhanced for high-res
function AuroraRing({
    latitude,
    intensity = 0.5,
    speed = 0.3,
    isNorthern = true
}: {
    latitude: number;
    intensity: number;
    speed: number;
    isNorthern: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Convert latitude to radians and position on sphere
    const latRad = THREE.MathUtils.degToRad(isNorthern ? latitude : -latitude);
    const radius = 1.02;
    const ringRadius = Math.cos(latRad) * radius;
    const yPosition = Math.sin(latRad) * radius;

    // Enhanced aurora shader with more detail
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: intensity },
                color1: { value: new THREE.Color('#00ff88') },
                color2: { value: new THREE.Color('#00ffcc') },
                color3: { value: new THREE.Color('#ff00ff') },
                color4: { value: new THREE.Color('#ff3366') },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Enhanced wave animation with multiple frequencies
                    vec3 pos = position;
                    float wave = sin(pos.x * 12.0 + time * 2.5) * 0.025;
                    wave += sin(pos.z * 10.0 + time * 2.0) * 0.02;
                    wave += sin(pos.x * 6.0 - time * 1.5) * 0.015;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                uniform vec3 color4;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                // Enhanced noise functions for high-res aurora
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }
                
                float fbm(vec2 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    float frequency = 1.0;
                    for (int i = 0; i < 8; i++) {
                        value += amplitude * noise(p * frequency);
                        frequency *= 2.0;
                        amplitude *= 0.5;
                    }
                    return value;
                }
                
                void main() {
                    vec2 uv = vUv;
                    uv.x += time * 0.08;
                    
                    // Multi-layered noise for realistic aurora curtains
                    float n1 = fbm(uv * 5.0 + time * 0.15);
                    float n2 = fbm(uv * 8.0 - time * 0.1);
                    float n3 = fbm(uv * 12.0 + time * 0.2);
                    
                    float n = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
                    n = pow(n, 1.3);
                    
                    // Vertical curtain effect
                    float verticalFade = 1.0 - smoothstep(0.25, 0.75, vUv.y);
                    verticalFade *= smoothstep(0.0, 0.15, vUv.y);
                    
                    // Horizontal shimmer
                    float shimmer = sin(vUv.x * 30.0 + time * 4.0) * 0.5 + 0.5;
                    shimmer *= sin(vUv.x * 15.0 - time * 2.0) * 0.5 + 0.5;
                    
                    // Dynamic color mixing based on altitude simulation
                    vec3 color = mix(color1, color2, n);
                    color = mix(color, color3, shimmer * n * 0.6);
                    color = mix(color, color4, pow(n, 2.0) * 0.3);
                    
                    // Pulsing glow effect
                    float pulse = 0.7 + 0.3 * sin(time * 2.5 + vUv.x * 8.0);
                    
                    float alpha = n * verticalFade * intensity * pulse;
                    alpha *= (0.6 + 0.4 * shimmer);
                    
                    gl_FragColor = vec4(color, alpha * 0.9);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, [intensity]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
            materialRef.current.uniforms.intensity.value = intensity;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0008;
        }
    });

    // Higher resolution torus for smoother aurora band
    const geometry = useMemo(() => {
        return new THREE.TorusGeometry(ringRadius, 0.1, 32, 200);
    }, [ringRadius]);

    return (
        <mesh
            ref={meshRef}
            position={[0, yPosition, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={geometry}
        >
            <primitive object={shaderMaterial} ref={materialRef} attach="material" />
        </mesh>
    );
}

// Enhanced aurora particles with more detail
function AuroraParticles({ latitude, isNorthern, intensity }: { latitude: number; isNorthern: boolean; intensity: number }) {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 4000; // Doubled for higher resolution

    const [positions, colors, sizes] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const latRad = THREE.MathUtils.degToRad(isNorthern ? latitude : -latitude);
        const baseRadius = 1.04;

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const latOffset = (Math.random() - 0.5) * 0.35;
            const adjustedLat = latRad + latOffset;

            const r = baseRadius + Math.random() * 0.2;
            const x = r * Math.cos(adjustedLat) * Math.cos(theta);
            const y = r * Math.sin(adjustedLat);
            const z = r * Math.cos(adjustedLat) * Math.sin(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Enhanced color gradient: green -> cyan -> purple -> pink
            const t = Math.random();
            if (t < 0.4) {
                // Green
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 0.5;
            } else if (t < 0.7) {
                // Cyan
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            } else if (t < 0.9) {
                // Purple
                colors[i * 3] = 0.8;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 1;
            } else {
                // Pink
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.2;
                colors[i * 3 + 2] = 0.6;
            }

            sizes[i] = 0.005 + Math.random() * 0.01;
        }

        return [positions, colors, sizes];
    }, [latitude, isNorthern]);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.0003;
            const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.0001;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
                size={0.006}
                vertexColors
                transparent
                opacity={intensity * 0.7}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
}

// High-resolution Earth component using 8K textures
function HighResEarth({ kpIndex }: { kpIndex: number }) {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    const auroraLatitude = getAuroraLatitude(kpIndex);
    const intensity = getAuroraIntensity(kpIndex);

    // Load all 8K textures
    const [dayMap, nightMap, normalMap, specularMap, cloudsMap] = useTexture([
        EARTH_TEXTURES.day,
        EARTH_TEXTURES.night,
        EARTH_TEXTURES.normal,
        EARTH_TEXTURES.specular,
        EARTH_TEXTURES.clouds,
    ]);

    // Configure textures for best quality
    useMemo(() => {
        [dayMap, nightMap, normalMap, specularMap, cloudsMap].forEach(tex => {
            tex.anisotropy = 16;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
        });
    }, [dayMap, nightMap, normalMap, specularMap, cloudsMap]);

    // Ultra high-poly sphere for 8K textures (256 segments)
    const earthGeometry = useMemo(() => {
        return new THREE.SphereGeometry(1, 256, 256);
    }, []);

    // Advanced day/night shader with normal mapping
    const earthMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: dayMap },
                nightTexture: { value: nightMap },
                normalTexture: { value: normalMap },
                specularTexture: { value: specularMap },
                sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
                normalScale: { value: 0.05 },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                varying vec3 vTangent;
                varying vec3 vBitangent;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    
                    // Calculate tangent and bitangent for normal mapping
                    vec3 tangent = normalize(cross(vNormal, vec3(0.0, 1.0, 0.0)));
                    if (length(tangent) < 0.01) {
                        tangent = normalize(cross(vNormal, vec3(1.0, 0.0, 0.0)));
                    }
                    vTangent = normalize(normalMatrix * tangent);
                    vBitangent = normalize(cross(vNormal, vTangent));
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform sampler2D normalTexture;
                uniform sampler2D specularTexture;
                uniform vec3 sunDirection;
                uniform float normalScale;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                varying vec3 vTangent;
                varying vec3 vBitangent;
                
                void main() {
                    // Sample textures
                    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
                    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                    vec3 normalSample = texture2D(normalTexture, vUv).rgb * 2.0 - 1.0;
                    float specularSample = texture2D(specularTexture, vUv).r;
                    
                    // Apply normal mapping
                    mat3 TBN = mat3(vTangent, vBitangent, vNormal);
                    vec3 perturbedNormal = normalize(TBN * vec3(normalSample.xy * normalScale, normalSample.z));
                    
                    // Calculate lighting with perturbed normal
                    float sunDot = dot(perturbedNormal, sunDirection);
                    float dayNightMix = smoothstep(-0.15, 0.25, sunDot);
                    
                    // Enhanced day lighting with ambient occlusion
                    vec3 ambient = dayColor * 0.15;
                    vec3 diffuse = dayColor * max(0.0, sunDot);
                    vec3 dayLit = ambient + diffuse;
                    
                    // Enhanced night lights with bloom effect
                    vec3 nightLit = nightColor * 2.0;
                    nightLit += nightColor * nightColor * 0.5; // Bloom
                    
                    // Mix day and night
                    vec3 finalColor = mix(nightLit, dayLit, dayNightMix);
                    
                    // Specular highlights for water
                    vec3 viewDir = normalize(-vWorldPosition);
                    vec3 reflectDir = reflect(-sunDirection, perturbedNormal);
                    float specHighlight = pow(max(0.0, dot(viewDir, reflectDir)), 40.0);
                    vec3 specColor = vec3(0.4, 0.5, 0.6) * specHighlight * specularSample * dayNightMix;
                    finalColor += specColor;
                    
                    // Fresnel rim lighting
                    float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 3.0);
                    finalColor += vec3(0.1, 0.15, 0.25) * fresnel * 0.5;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
        });
    }, [dayMap, nightMap, normalMap, specularMap]);

    // Enhanced atmosphere with multi-layer glow
    const atmosphereMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color('#4da6ff') },
                sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform vec3 sunDirection;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDir = normalize(-vPosition);
                    float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
                    
                    // Multi-layer atmosphere
                    float glow1 = pow(rim, 2.0) * 0.6;
                    float glow2 = pow(rim, 4.0) * 0.4;
                    float glow3 = pow(rim, 8.0) * 0.2;
                    
                    float totalGlow = glow1 + glow2 + glow3;
                    
                    // Slight sun-side brightening
                    float sunFacing = max(0.0, dot(vNormal, sunDirection)) * 0.3 + 0.7;
                    
                    gl_FragColor = vec4(glowColor * sunFacing, totalGlow * 0.6);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, []);

    // Cloud material with transparency
    const cloudMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            alphaMap: cloudsMap,
        });
    }, [cloudsMap]);

    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0004;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.0006;
        }
    });

    return (
        <group>
            {/* Main Earth with 8K textures */}
            <mesh ref={earthRef} geometry={earthGeometry}>
                <primitive object={earthMaterial} attach="material" />
            </mesh>

            {/* Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[1.008, 128, 128]} />
                <primitive object={cloudMaterial} attach="material" />
            </mesh>


            {/* Northern Aurora - Enhanced */}
            <AuroraRing
                latitude={auroraLatitude}
                intensity={intensity + 0.4}
                speed={0.6}
                isNorthern={true}
            />
            <AuroraParticles latitude={auroraLatitude} isNorthern={true} intensity={intensity + 0.2} />

            {/* Southern Aurora - Enhanced */}
            <AuroraRing
                latitude={auroraLatitude}
                intensity={intensity + 0.3}
                speed={0.5}
                isNorthern={false}
            />
            <AuroraParticles latitude={auroraLatitude} isNorthern={false} intensity={intensity + 0.1} />
        </group>
    );
}

// Camera controller with smooth movement
function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0.5, 2.5);
    }, [camera]);

    return (
        <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.3}
            maxDistance={6}
            autoRotate
            autoRotateSpeed={0.2}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
        />
    );
}

// Info panel component
function AuroraInfoPanel({ data, loading }: { data: AuroraData | null; loading: boolean }) {
    if (loading) {
        return (
            <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span className="text-sm">Loading aurora data...</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const getKpDescription = (kp: number) => {
        if (kp <= 2) return 'Quiet';
        if (kp <= 4) return 'Moderate';
        if (kp <= 6) return 'Active';
        if (kp <= 8) return 'Storm';
        return 'Severe Storm';
    };

    const getKpColor = (kp: number) => {
        if (kp <= 2) return 'text-green-400';
        if (kp <= 4) return 'text-yellow-400';
        if (kp <= 6) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white max-w-xs"
        >
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg">Aurora Activity</h3>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Kp Index</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getKpColor(data.kpIndex)}`}>
                            {data.kpIndex.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">/ 9</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className={`font-semibold ${getKpColor(data.kpIndex)}`}>
                        {getKpDescription(data.kpIndex)}
                    </span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.kpIndex / 9) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    />
                </div>

                <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Northern visibility</span>
                        <span className="text-cyan-300">{data.probability.northern}%</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">Southern visibility</span>
                        <span className="text-cyan-300">{data.probability.southern}%</span>
                    </div>
                </div>

                <div className="text-xs text-slate-500 mt-2">
                    Visible down to {getAuroraLatitude(data.kpIndex)}° latitude
                </div>
            </div>
        </motion.div>
    );
}

// Legend component
function AuroraLegend() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white"
        >
            <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold">Aurora Colors</span>
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-cyan-400" />
                    <span className="text-slate-300">Low altitude (100km) - Green</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span className="text-slate-300">High altitude (200km+) - Purple/Red</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-500">
                8K Earth Textures • NOAA Data
            </div>
        </motion.div>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold">Loading 8K Aurora Globe...</p>
                <p className="text-slate-400 text-sm mt-2">Initializing high-resolution textures</p>
            </div>
        </div>
    );
}

// Main export component
export default function AuroraGlobe() {
    const [auroraData, setAuroraData] = useState<AuroraData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await fetchAuroraData();
                setAuroraData(data);
                setError(null);
            } catch (err) {
                console.error('Error loading aurora data:', err);
                setError('Failed to load aurora data');
                setAuroraData({
                    kpIndex: 3,
                    forecast: [],
                    timestamp: new Date().toISOString(),
                    probability: { northern: 50, southern: 45 },
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
                    <ambientLight intensity={0.08} />
                    <directionalLight position={[5, 3, 5]} intensity={1.8} />

                    <Stars
                        radius={150}
                        depth={80}
                        count={8000}
                        factor={5}
                        saturation={0}
                        fade
                        speed={0.3}
                    />

                    <HighResEarth kpIndex={auroraData?.kpIndex ?? 3} />
                    <CameraController />
                </Canvas>
            </Suspense>

            {/* UI Overlays */}
            <AnimatePresence>
                <AuroraInfoPanel data={auroraData} loading={loading} />
                <AuroraLegend />
            </AnimatePresence>

            {/* Title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-orbitron font-bold text-white tracking-widest"
                >
                    REAL-TIME AURORA
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-slate-400 mt-1"
                >
                    8K High-Resolution Earth • Northern & Southern Lights
                </motion.p>
            </div>

            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-900/50 border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm">
                    {error} - Using fallback data
                </div>
            )}
        </div>
    );
}
