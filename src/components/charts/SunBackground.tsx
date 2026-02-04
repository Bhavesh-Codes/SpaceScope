'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';
import { SolarFlare, flareClassToValue } from '@/services/nasaApi';

const SUN_TEXTURE = '/assets/earth-celes/8k_sun.jpg';

// Aurora-style Solar Flare Loops
function SolarFlareLoops({ intensity = 0.5 }: { intensity: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const flareCount = 60;

    const flares = useMemo(() => {
        const flareData = [];
        for (let i = 0; i < flareCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const arcHeight = 0.05 + Math.random() * 0.15;
            const arcWidth = 0.02 + Math.random() * 0.08;
            const speed = 0.5 + Math.random() * 1.5;
            const phase = Math.random() * Math.PI * 2;

            const colorT = Math.random();
            let color;
            if (colorT < 0.4) {
                color = new THREE.Color('#ffcc00');
            } else if (colorT < 0.7) {
                color = new THREE.Color('#ff8800');
            } else {
                color = new THREE.Color('#ff4400');
            }

            flareData.push({ theta, phi, arcHeight, arcWidth, speed, phase, color });
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

function SolarFlareArc({ theta, phi, arcHeight, arcWidth, speed, phase, color, intensity }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const basePosition = useMemo(() => {
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }, [theta, phi]);

    const geometry = useMemo(() => {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, arcHeight, 0),
            new THREE.Vector3(arcWidth, 0, 0)
        );
        return new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
    }, [arcHeight, arcWidth]);

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
                void main() {
                    float fadeFactor = sin(vUv.x * 3.14159);
                    fadeFactor = pow(fadeFactor, 0.5);
                    float pulse = 0.7 + 0.3 * sin(time * 4.0 + phase);
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

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
            materialRef.current.uniforms.intensity.value = intensity;
        }
    });

    const rotation = useMemo(() => {
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, basePosition.clone().normalize());
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        euler.z += Math.random() * Math.PI * 2;
        return euler;
    }, [basePosition]);

    return (
        <mesh ref={meshRef} position={basePosition} rotation={rotation} geometry={geometry}>
            <primitive object={shaderMaterial} ref={materialRef} attach="material" />
        </mesh>
    );
}

function SolarFlareParticles({ intensity = 0.5 }: { intensity: number }) {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 8000;

    const [positions, velocities, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.0;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            const speed = 0.003 + Math.random() * 0.008;
            velocities[i * 3] = positions[i * 3] * speed;
            velocities[i * 3 + 1] = positions[i * 3 + 1] * speed;
            velocities[i * 3 + 2] = positions[i * 3 + 2] * speed;

            const t = Math.random();
            if (t < 0.3) { colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.4; }
            else if (t < 0.6) { colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.1; }
            else if (t < 0.85) { colors[i * 3] = 1; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.05; }
            else { colors[i * 3] = 1; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2; }
        }
        return [positions, velocities, colors];
    }, []);

    useFrame(() => {
        if (particlesRef.current) {
            const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                pos[i * 3] += velocities[i * 3] * intensity;
                pos[i * 3 + 1] += velocities[i * 3 + 1] * intensity;
                pos[i * 3 + 2] += velocities[i * 3 + 2] * intensity;

                const dist = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2);
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
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.008} vertexColors transparent opacity={0.7 * intensity} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
        </points>
    );
}

function Sun({ flareIntensity = 0.5 }: { flareIntensity: number }) {
    const sunRef = useRef<THREE.Mesh>(null);
    const sunTexture = useTexture(SUN_TEXTURE);

    useMemo(() => {
        sunTexture.anisotropy = 16;
        sunTexture.minFilter = THREE.LinearMipmapLinearFilter;
        sunTexture.magFilter = THREE.LinearFilter;
    }, [sunTexture]);

    const sunGeometry = useMemo(() => new THREE.SphereGeometry(1, 256, 256), []);

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
                    vec2 animatedUv = vUv;
                    animatedUv.x += sin(time * 0.03 + vUv.y * 4.0) * 0.008;
                    animatedUv.y += cos(time * 0.02 + vUv.x * 4.0) * 0.005;
                    vec3 color = texture2D(sunTexture, animatedUv).rgb;
                    color = pow(color, vec3(0.9));
                    color *= 1.4;
                    float pulse = 0.97 + 0.03 * sin(time * 2.0);
                    color *= pulse;
                    float boost = 1.0 + flareIntensity * 0.2;
                    color *= boost;
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
            <mesh ref={sunRef} geometry={sunGeometry}>
                <primitive object={sunMaterial} attach="material" />
            </mesh>
            <SolarFlareLoops intensity={flareIntensity} />
            <SolarFlareParticles intensity={flareIntensity} />
        </group>
    );
}

function CameraController() {
    const { camera } = useThree();
    React.useEffect(() => {
        camera.position.set(0, 0, 3);
    }, [camera]);
    return (
        <OrbitControls enablePan={false} enableZoom={true} minDistance={1.5} maxDistance={6} autoRotate autoRotateSpeed={0.3} enableDamping dampingFactor={0.05} rotateSpeed={0.5} />
    );
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
    );
}

export default function SunBackground({ solarFlares }: { solarFlares: SolarFlare[] }) {
    const flareIntensity = useMemo(() => {
        if (solarFlares.length === 0) return 0.4;
        const recentFlares = solarFlares.slice(0, 5);
        const avgValue = recentFlares.reduce((sum, f) => sum + flareClassToValue(f.classType), 0) / recentFlares.length;
        return Math.min(1, Math.max(0.4, avgValue / 8000));
    }, [solarFlares]);

    return (
        <div className="fixed inset-0 z-0 bg-black">
            <Suspense fallback={<LoadingFallback />}>
                <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} dpr={[1, 2]}>
                    <ambientLight intensity={0.1} />
                    <pointLight position={[0, 0, 0]} intensity={2} color="#ff8800" />
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.2} />
                    <Sun flareIntensity={flareIntensity} />
                    <CameraController />
                </Canvas>
            </Suspense>
        </div>
    );
}
