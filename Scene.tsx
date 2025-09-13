// src/Scene.tsx

import { useRef, Suspense } from 'react';
// import { Environment } from '@react-three/drei';
import { Drumkit, type DrumRefs } from "./drum";
// import { useControls } from 'leva';

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

    // // 1. Leva controls are now in the main Scene component
    // const { scale, position, rotationY, lightIntensity } = useControls({
    //     scale: { value: 5, min: 1, max: 15, step: 0.1 },
    //     position: { value: [0, -1.7, 0], step: 0.1 },
    //     rotationY: { value: 0, min: -Math.PI, max: Math.PI, label: 'Y Rotation' },
    //     lightIntensity: { value: 1.5, min: 0, max: 5, label: 'Light Intensity' }
    // });

    return (
        <>
            {/* Lighting setup */}
            <ambientLight intensity={1} />
            <directionalLight
                position={[10, 5, 5]}
                intensity={10} // Controlled by Leva
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-5, 5, -5]} intensity={15} />

            {/* <Environment preset="studio" /> */}

            <Suspense fallback={<FallbackDrumKit />}>
                {/* 2. Controls are applied to the group wrapping the Drumkit */}
                <group position={[-0.1 , -1.9 , 0]} scale={2.8} rotation-y={0.1}>
                    <Drumkit ref={drumkitRef} />
                </group>
            </Suspense>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#333333" metalness={1}/>
            </mesh>
        </>
    );
}