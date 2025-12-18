// Progressive Drumkit Loader with LOD (Level of Detail)
// Loads models progressively: low → medium → high quality

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

// Model URLs - hosted on GitHub
const MODEL_URLS = {
    low: 'https://raw.githubusercontent.com/onemore-adi/hb_website/optimization/public/drum-low.glb',
    medium: 'https://raw.githubusercontent.com/onemore-adi/hb_website/optimization/public/drum-medium.glb',
    high: 'https://raw.githubusercontent.com/onemore-adi/hb_website/optimization/public/drum.glb',
} as const;

type LODLevel = 'low' | 'medium' | 'high';

// Generic GLTF model renderer
function ModelRenderer({ scene }: { scene: THREE.Group }) {
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Set up materials and shadows
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        return clone;
    }, [scene]);

    return <primitive object={clonedScene} />;
}

// Individual LOD level component
function LODLevel({ url, isActive }: { url: string; isActive: boolean }) {
    const gltf = useGLTF(url) as GLTF;

    if (!isActive) return null;

    return <ModelRenderer scene={gltf.scene} />;
}

// Main progressive loading component
export function ProgressiveDrumkit() {
    const groupRef = useRef<THREE.Group>(null);
    const scrollLerp = useRef(0);

    // Track which level is currently showing
    const [currentLevel, setCurrentLevel] = useState<LODLevel>('low');
    const [loadedLevels, setLoadedLevels] = useState<Record<LODLevel, boolean>>({
        low: false,
        medium: false,
        high: false,
    });

    // Mark a level as loaded - use callback to avoid recreating on each render
    const markLoaded = useCallback((level: LODLevel) => {
        setLoadedLevels(prev => {
            if (prev[level]) return prev; // Already loaded, don't update
            return { ...prev, [level]: true };
        });
    }, []);

    // Upgrade to better quality when available
    useEffect(() => {
        // Priority: high > medium > low
        if (loadedLevels.high && currentLevel !== 'high') {
            setCurrentLevel('high');
        } else if (loadedLevels.medium && currentLevel === 'low') {
            setCurrentLevel('medium');
        }
    }, [loadedLevels.high, loadedLevels.medium, currentLevel]);

    // Scroll-based animation
    useFrame(() => {
        const targetScroll = window.scrollY / window.innerHeight;
        const progress = Math.min(Math.max(0, targetScroll), 1);
        scrollLerp.current += (progress - scrollLerp.current) * 0.1;

        if (groupRef.current) {
            const baseScale = 2.8;
            const targetScale = baseScale + scrollLerp.current * 0.4;
            groupRef.current.scale.setScalar(targetScale);

            const baseRotY = 0.1;
            const targetRotY = baseRotY + scrollLerp.current * 0.5;
            groupRef.current.rotation.y = targetRotY;
        }
    });

    // Preload models in order (low first for fastest initial display)
    useEffect(() => {
        // Load low immediately
        useGLTF.preload(MODEL_URLS.low);

        // Load medium after a small delay
        const mediumTimer = setTimeout(() => {
            useGLTF.preload(MODEL_URLS.medium);
        }, 100);

        // Load high after medium starts
        const highTimer = setTimeout(() => {
            useGLTF.preload(MODEL_URLS.high);
        }, 200);

        return () => {
            clearTimeout(mediumTimer);
            clearTimeout(highTimer);
        };
    }, []);

    // Effect to detect when models are loaded
    useEffect(() => {
        const checkLoaded = () => {
            try {
                // Check if each model is in the cache
                const lowCached = useGLTF.preload(MODEL_URLS.low);
                markLoaded('low');
            } catch {
                // Not loaded yet
            }
        };

        // Check immediately
        checkLoaded();
    }, [markLoaded]);

    return (
        <group ref={groupRef} position={[-0.1, -1.9, 0]} scale={2.8} rotation-y={0.1}>
            {/* Render only the current active level */}
            <LODLevel url={MODEL_URLS.low} isActive={currentLevel === 'low'} />
            <LODLevel url={MODEL_URLS.medium} isActive={currentLevel === 'medium'} />
            <LODLevel url={MODEL_URLS.high} isActive={currentLevel === 'high'} />

            {/* Hidden loaders to trigger loading and track completion */}
            <LoadTracker url={MODEL_URLS.low} onLoad={() => markLoaded('low')} />
            <LoadTracker url={MODEL_URLS.medium} onLoad={() => markLoaded('medium')} />
            <LoadTracker url={MODEL_URLS.high} onLoad={() => markLoaded('high')} />
        </group>
    );
}

// Invisible component that loads a model and calls onLoad when done
function LoadTracker({ url, onLoad }: { url: string; onLoad: () => void }) {
    const hasCalledRef = useRef(false);

    useGLTF(url); // This triggers the load

    useEffect(() => {
        if (!hasCalledRef.current) {
            hasCalledRef.current = true;
            onLoad();
        }
    }, [onLoad]);

    return null;
}
