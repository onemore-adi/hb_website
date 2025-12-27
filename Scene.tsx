// src/Scene.tsx

import { Suspense } from 'react';
import { ProgressiveDrumkit } from './src/components/ProgressiveDrumkit';

// Simple loading fallback
function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial wireframe color="#666666" />
        </mesh>
    );
}

export function Scene() {
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

            <Suspense fallback={<LoadingFallback />}>
                <ProgressiveDrumkit />
            </Suspense>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial transparent opacity={0.5} />
            </mesh>
        </>
    );
}