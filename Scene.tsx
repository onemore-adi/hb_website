// src/Scene.tsx

import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Drumkit, type DrumRefs } from "./drum";
import { Group } from 'three';

// Fallback component no longer needs controls
function FallbackDrumKit() {
    return (
        <mesh>
            <boxGeometry />
            <meshStandardMaterial wireframe color="hotpink" />
        </mesh>
    );
}

export function Scene() {
    const drumkitRef = useRef<DrumRefs>(null);
    const groupRef = useRef<Group>(null);

    // Smooth scroll reference
    const scrollLerp = useRef(0);

    useFrame(() => {
        // Calculate normalized scroll progress (0 to 1) based on window height
        // Hero section is approx 100vh, so we normalize against that.
        const targetScroll = window.scrollY / window.innerHeight;
        const progress = Math.min(Math.max(0, targetScroll), 1);

        // Smooth Lerp
        // Adjust factor for weightiness. 0.1 is standard smooth.
        scrollLerp.current += (progress - scrollLerp.current) * 0.1;

        if (groupRef.current) {
            // ZOOM / SCALE
            // Scale up from 2.8 -> 3.2 (Subtle zoom)
            const baseScale = 2.8;
            const targetScale = baseScale + scrollLerp.current * 0.4;
            groupRef.current.scale.setScalar(targetScale);

            // ROTATION
            // Rotate Y-axis (Vertical axis) "away from camera"
            // Initial Y is 0.1. We want to rotate it further.
            // Let's rotate by ~0.5 radians (approx 30 degrees)
            const baseRotY = 0.1;
            const targetRotY = baseRotY + scrollLerp.current * 0.5;

            groupRef.current.rotation.y = targetRotY;
        }
    });

    return (
        <>
            {/* Lighting setup */}
            <ambientLight intensity={1} />
            <directionalLight
                position={[10, 5, 5]}
                intensity={10}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-5, 5, -5]} intensity={15} />

            <Suspense fallback={<FallbackDrumKit />}>
                {/* 2. Controls are applied to the group wrapping the Drumkit */}
                <group ref={groupRef} position={[-0.1, -1.9, 0]} scale={2.8} rotation-y={0.1}>
                    <Drumkit ref={drumkitRef} />
                </group>
            </Suspense>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#333333" metalness={1} />
            </mesh>
        </>
    );
}