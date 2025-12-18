import * as THREE from 'three'

// Import values and types separately

import { useRef, forwardRef, useImperativeHandle } from 'react'

import type { JSX } from 'react'

import { useGLTF } from '@react-three/drei'

// Import the GLTF type as a type-only import

import type { GLTF } from 'three-stdlib'



type GLTFResult = GLTF & {

    nodes: {

        bassdrum: THREE.Mesh

        Circle001: THREE.Mesh

        Circle001_1: THREE.Mesh

        Circle001_2: THREE.Mesh

        Circle002: THREE.Mesh

        Circle002_1: THREE.Mesh

        bassdrum_tom_holder_base: THREE.Mesh

        Circle007: THREE.Mesh

        Circle007_1: THREE.Mesh

        Circle017: THREE.Mesh

        Circle017_1: THREE.Mesh

        Circle034: THREE.Mesh

        Circle034_1: THREE.Mesh

        Circle040: THREE.Mesh

        Circle040_1: THREE.Mesh

        bassdrum003: THREE.Mesh

        Circle: THREE.Mesh

        bassdrum_tom_holder_hinge002: THREE.Mesh

        Circle011: THREE.Mesh

        Circle011_1: THREE.Mesh

        Circle015: THREE.Mesh

        Circle015_1: THREE.Mesh

        tom_tom2_cylinder001: THREE.Mesh

        Circle010: THREE.Mesh

        Circle010_1: THREE.Mesh

        Circle010_2: THREE.Mesh

        tom_tom2_hoop: THREE.Mesh

        tom_tom2_membrane: THREE.Mesh

        bassdrum_tom_holder_hinge003: THREE.Mesh

        Circle018: THREE.Mesh

        Circle018_1: THREE.Mesh

        Circle005: THREE.Mesh

        Circle005_1: THREE.Mesh

        tom_tom1_Cylinder001: THREE.Mesh

        Circle004: THREE.Mesh

        Circle004_1: THREE.Mesh

        Circle004_2: THREE.Mesh

        tom_tom1_hoop: THREE.Mesh

        tom_tom1_membrane: THREE.Mesh

        Circle008: THREE.Mesh

        Circle008_1: THREE.Mesh

        Circle008_2: THREE.Mesh

        Circle021: THREE.Mesh

        Circle021_1: THREE.Mesh

        snare_drum_cylinder001: THREE.Mesh

        Circle016: THREE.Mesh

        Circle016_1: THREE.Mesh

        Circle016_2: THREE.Mesh

        snare_drum_hoop: THREE.Mesh

        snare_drum_membrane: THREE.Mesh

        Circle022: THREE.Mesh

        Circle022_1: THREE.Mesh

        Plane: THREE.Mesh

        Plane_1: THREE.Mesh

        Plane_2: THREE.Mesh

        Plane_3: THREE.Mesh

        Circle029: THREE.Mesh

        Circle029_1: THREE.Mesh

        Circle026: THREE.Mesh

        Circle026_1: THREE.Mesh

        Circle026_2: THREE.Mesh

        stand_tom_hoop: THREE.Mesh

        Circle032: THREE.Mesh

        Circle032_1: THREE.Mesh

        Circle032_2: THREE.Mesh

        stand_tom_membrane: THREE.Mesh

        stand_tom_cylinder001: THREE.Mesh

        Circle037: THREE.Mesh

        Circle037_1: THREE.Mesh

        Circle037_2: THREE.Mesh

        stool_cushion: THREE.Mesh

        Circle036: THREE.Mesh

        Circle036_1: THREE.Mesh

        Circle036_2: THREE.Mesh

        Circle036_3: THREE.Mesh

        Circle036_4: THREE.Mesh

        Circle036_5: THREE.Mesh

        Circle023: THREE.Mesh

        Circle023_1: THREE.Mesh

        Circle023_2: THREE.Mesh

        Circle033: THREE.Mesh

        Circle033_1: THREE.Mesh

        symbal_rotor: THREE.Mesh

        symbal_leg001: THREE.Mesh

        Circle031: THREE.Mesh

        Circle031_1: THREE.Mesh

        Circle024: THREE.Mesh

        Circle024_1: THREE.Mesh

        Circle024_2: THREE.Mesh

        symbal_holder001: THREE.Mesh // This is the Crash Cymbal

        Circle044: THREE.Mesh

        Circle044_1: THREE.Mesh

        Circle044_2: THREE.Mesh

        Circle045: THREE.Mesh

        Circle045_1: THREE.Mesh

        Circle048: THREE.Mesh

        Circle048_1: THREE.Mesh

        Circle048_2: THREE.Mesh

        symbal_holder004: THREE.Mesh // This is the Ride Cymbal

        Circle038: THREE.Mesh

        Circle038_1: THREE.Mesh

        Circle038_2: THREE.Mesh

        Circle038_3: THREE.Mesh

        Circle039: THREE.Mesh

        Circle039_1: THREE.Mesh

        Circle039_2: THREE.Mesh

    }

    materials: {

        drums: THREE.MeshStandardMaterial

        metalas: THREE.MeshStandardMaterial

        plastikas: THREE.MeshStandardMaterial

        ['metalas grovie ']: THREE.MeshStandardMaterial

        ['Furniture wood']: THREE.MeshStandardMaterial

        ['Transparent plastic']: THREE.MeshStandardMaterial

        ['Transparent plastic.001']: THREE.MeshStandardMaterial

        ['drums.001']: THREE.MeshStandardMaterial

        ['Oak Wood']: THREE.MeshStandardMaterial

        strap: THREE.MeshStandardMaterial

        ['metalas gripy']: THREE.MeshStandardMaterial

        Leather: THREE.MeshStandardMaterial

        cymbals: THREE.MeshStandardMaterial

        ['Metal scratched (CHAIN)']: THREE.MeshPhysicalMaterial

        ['METAL PEDAL']: THREE.MeshStandardMaterial

    }

}



// Type for the refs we are exposing

export type DrumRefs = {

    group: THREE.Group | null

    snare: THREE.Group | null

    tom1: THREE.Group | null

    tom2: THREE.Group | null

    floorTom: THREE.Group | null

    crash: THREE.Mesh | null

    ride: THREE.Mesh | null

    hiHat: THREE.Group | null

}



// Each part is now its own component to accept a ref

const Snare = forwardRef<THREE.Group, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group ref={ref} position={[0.436, 0.496, -0.519]} rotation={[0, 0.446, -1.571]}>

        <mesh castShadow receiveShadow geometry={nodes.Circle008.geometry} material={materials.metalas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle008_1.geometry} material={materials.plastikas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle008_2.geometry} material={materials['metalas grovie ']} />

        <group position={[-0.137, 0, 0]} rotation={[-3.005, 0, 0]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle021.geometry} material={materials.drums} />

            <mesh castShadow receiveShadow geometry={nodes.Circle021_1.geometry} material={materials['Furniture wood']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.snare_drum_cylinder001.geometry} material={materials['drums.001']} position={[-0.137, 0, 0]} rotation={[-3.005, 0, 0]} />

        <group position={[-0.137, 0, 0]} rotation={[-2.874, 0, Math.PI / 2]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle016.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle016_1.geometry} material={materials['metalas grovie ']} />

            <mesh castShadow receiveShadow geometry={nodes.Circle016_2.geometry} material={materials.plastikas} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.snare_drum_hoop.geometry} material={materials.metalas} position={[-0.068, 0, 0]} rotation={[0.267, -0.001, 1.568]} />

        <mesh castShadow receiveShadow geometry={nodes.snare_drum_membrane.geometry} material={materials['Transparent plastic.001']} position={[-0.138, 0, 0]} rotation={[1.707, 0, 0]} />

        <group position={[-0.014, 0, 0]} rotation={[-1.564, 0, Math.PI / 4]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle022.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle022_1.geometry} material={materials.plastikas} />

        </group>

        <group position={[-0.018, 0, -0.002]} rotation={[1.838, 0, 1.571]}>

            <mesh castShadow receiveShadow geometry={nodes.Plane.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Plane_1.geometry} material={materials.strap} />

            <mesh castShadow receiveShadow geometry={nodes.Plane_2.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Plane_3.geometry} material={materials['metalas grovie ']} />

        </group>

    </group>

));



const Tom1 = forwardRef<THREE.Group, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group ref={ref} position={[1.46, 0.059, 0.264]} rotation={[1.374, 1.076, -Math.PI]}>

        <group>

            <mesh castShadow receiveShadow geometry={nodes.Circle005.geometry} material={materials.drums} />

            <mesh castShadow receiveShadow geometry={nodes.Circle005_1.geometry} material={materials['Furniture wood']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.tom_tom1_Cylinder001.geometry} material={materials['drums.001']} />

        <group scale={7.795}>

            <mesh castShadow receiveShadow geometry={nodes.Circle004.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle004_1.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle004_2.geometry} material={materials['metalas grovie ']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.tom_tom1_hoop.geometry} material={materials.metalas} />

        <mesh castShadow receiveShadow geometry={nodes.tom_tom1_membrane.geometry} material={materials['Transparent plastic']} />

    </group>

));



const Tom2 = forwardRef<THREE.Group, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group ref={ref} position={[-1.617, -0.182, 0.204]} rotation={[-0.979, -0.612, 0]}>

        <group>

            <mesh castShadow receiveShadow geometry={nodes.Circle015.geometry} material={materials.drums} />

            <mesh castShadow receiveShadow geometry={nodes.Circle015_1.geometry} material={materials['Furniture wood']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.tom_tom2_cylinder001.geometry} material={materials['drums.001']} position={[-0.003, 0.001, 0.001]} />

        <group rotation={[3.142, -0.347, 3.142]} scale={7.795}>

            <mesh castShadow receiveShadow geometry={nodes.Circle010.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle010_1.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle010_2.geometry} material={materials['metalas grovie ']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.tom_tom2_hoop.geometry} material={materials.metalas} rotation={[3.142, -0.347, 3.142]} />

        <mesh castShadow receiveShadow geometry={nodes.tom_tom2_membrane.geometry} material={materials['Transparent plastic']} rotation={[3.142, -0.347, 3.142]} />

    </group>

));



const FloorTom = forwardRef<THREE.Group, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group ref={ref} position={[-0.497, 0.382, -0.578]} rotation={[0, -0.787, Math.PI / 2]} scale={0.128}>

        <mesh castShadow receiveShadow geometry={nodes.Circle029.geometry} material={materials.drums} />

        <mesh castShadow receiveShadow geometry={nodes.Circle029_1.geometry} material={materials['Furniture wood']} />

        <group position={[0, -0.026, -0.026]} rotation={[-2.354, 0, -Math.PI / 2]} scale={7.795}>

            <mesh castShadow receiveShadow geometry={nodes.Circle026.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle026_1.geometry} material={materials['metalas grovie ']} />

            <mesh castShadow receiveShadow geometry={nodes.Circle026_2.geometry} material={materials.plastikas} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.stand_tom_hoop.geometry} material={materials.metalas} rotation={[-2.223, 0, 0]} scale={7.795} />

        <group rotation={[-2.094, 0, 0]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle032.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle032_1.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle032_2.geometry} material={materials['metalas gripy']} />

        </group>

        <mesh castShadow receiveShadow geometry={nodes.stand_tom_membrane.geometry} material={materials['Transparent plastic']} position={[0, -0.026, -0.026]} rotation={[-2.354, 0, -Math.PI / 2]} />

        <mesh castShadow receiveShadow geometry={nodes.stand_tom_cylinder001.geometry} material={materials['drums.001']} />

    </group>

));



const CrashCymbal = forwardRef<THREE.Mesh, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group position={[-0.661, 0.384, -0.195]} rotation={[0, 0.4, Math.PI / 2]}>

        <mesh castShadow receiveShadow geometry={nodes.Circle023.geometry} material={materials.metalas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle023_1.geometry} material={materials.plastikas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle023_2.geometry} material={materials['metalas grovie ']} />

        <group position={[0.191, 0, 0]} rotation={[-1.307, 0, -3.142]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle033.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle033_1.geometry} material={materials['metalas grovie ']} />

            <mesh castShadow receiveShadow geometry={nodes.symbal_rotor.geometry} material={materials.metalas} position={[-0.31, -0.004, 0.001]} rotation={[-0.26, 1.064, 1.571]}>

                <mesh castShadow receiveShadow geometry={nodes.symbal_leg001.geometry} material={materials.metalas} position={[0, -0.129, -0.129]}>

                    <group position={[0.006, -0.102, -0.101]} rotation={[-0.787, 0.267, -Math.PI / 2]}>

                        <mesh castShadow receiveShadow geometry={nodes.Circle031.geometry} material={materials.metalas} />

                        <mesh castShadow receiveShadow geometry={nodes.Circle031_1.geometry} material={materials['metalas grovie ']} />

                        <group position={[0, 0.009, -0.032]} rotation={[0.267, 0.687, 0]}>

                            <mesh castShadow receiveShadow geometry={nodes.Circle024.geometry} material={materials.plastikas} />

                            <mesh castShadow receiveShadow geometry={nodes.Circle024_1.geometry} material={materials.metalas} />

                            <mesh castShadow receiveShadow geometry={nodes.Circle024_2.geometry} material={materials['metalas grovie ']} />

                            <mesh ref={ref} castShadow receiveShadow geometry={nodes.symbal_holder001.geometry} material={materials.cymbals} position={[-0.014, -0.007, -0.069]} rotation={[Math.PI / 2, 0, 2.75]} />

                        </group>

                    </group>

                </mesh>

            </mesh>

        </group>

    </group>

));



const RideCymbal = forwardRef<THREE.Mesh, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group position={[0.524, 0.384, -0.216]} rotation={[0, -1.415, 1.571]}>

        <mesh castShadow receiveShadow geometry={nodes.Circle044.geometry} material={materials.metalas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle044_1.geometry} material={materials.plastikas} />

        <mesh castShadow receiveShadow geometry={nodes.Circle044_2.geometry} material={materials['metalas grovie ']} />

        <group position={[0.571, 0, 0]} rotation={[-0.001, -1.304, -1.571]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle045.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle045_1.geometry} material={materials['metalas grovie ']} />

            <group position={[0, 0.009, -0.032]} rotation={[0.267, -0.349, 0]}>

                <mesh castShadow receiveShadow geometry={nodes.Circle048.geometry} material={materials.plastikas} />

                <mesh castShadow receiveShadow geometry={nodes.Circle048_1.geometry} material={materials.metalas} />

                <mesh castShadow receiveShadow geometry={nodes.Circle048_2.geometry} material={materials['metalas grovie ']} />

                <mesh ref={ref} castShadow receiveShadow geometry={nodes.symbal_holder004.geometry} material={materials.cymbals} position={[-0.014, -0.007, -0.069]} rotation={[Math.PI / 2, 0, 2.75]} scale={[1.186, 1, 1.186]} />

            </group>

        </group>

    </group>

));



const HiHat = forwardRef<THREE.Group, { nodes: GLTFResult['nodes'], materials: GLTFResult['materials'] }>(({ nodes, materials }, ref) => (

    <group ref={ref}>

        <group position={[0.021, 0.383, -0.255]} rotation={[0, -0.524, Math.PI / 2]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle038.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle038_1.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle038_2.geometry} material={materials['Metal scratched (CHAIN)']} />

            <mesh castShadow receiveShadow geometry={nodes.Circle038_3.geometry} material={materials['METAL PEDAL']} />

        </group>

        <group position={[0.021, 0.007, -0.252]} rotation={[0, -1.571, 0]}>

            <mesh castShadow receiveShadow geometry={nodes.Circle039.geometry} material={materials.plastikas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle039_1.geometry} material={materials.metalas} />

            <mesh castShadow receiveShadow geometry={nodes.Circle039_2.geometry} material={materials['metalas grovie ']} />

        </group>

    </group>

));





// Main component that assembles the drum kit

export const Drumkit = forwardRef<DrumRefs, JSX.IntrinsicElements['group']>((props, ref) => {

    const { nodes, materials } = useGLTF('https://cdn.jsdelivr.net/gh/onemore-adi/hb_website@optimization/public/drum.glb') as unknown as GLTFResult



    // Create refs for each animatable part

    const groupRef = useRef<THREE.Group>(null);

    const snareRef = useRef<THREE.Group>(null);

    const tom1Ref = useRef<THREE.Group>(null);

    const tom2Ref = useRef<THREE.Group>(null);

    const floorTomRef = useRef<THREE.Group>(null);

    const crashRef = useRef<THREE.Mesh>(null);

    const rideRef = useRef<THREE.Mesh>(null);

    const hiHatRef = useRef<THREE.Group>(null);




    // Expose the refs to the parent component

    useImperativeHandle(ref, () => ({

        group: groupRef.current,

        snare: snareRef.current,

        tom1: tom1Ref.current,

        tom2: tom2Ref.current,

        floorTom: floorTomRef.current,

        crash: crashRef.current,

        ride: rideRef.current,

        hiHat: hiHatRef.current,

    }));



    return (

        <group ref={groupRef} {...props} dispose={null}>

            <group position={[0.007, -0.075, 0.316]}>

                {/* === STATIC AND BASS DRUM RELATED PARTS === */}

                <mesh castShadow receiveShadow geometry={nodes.bassdrum.geometry} material={materials.drums} position={[0, 0.301, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />

                <group position={[0, 0.301, 0]} rotation={[-Math.PI / 2, -1.178, -Math.PI / 2]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle001.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle001_1.geometry} material={materials.plastikas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle001_2.geometry} material={materials['metalas grovie ']} />

                </group>

                <group position={[0, 0.301, 0]} rotation={[0, -1.571, 0]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle002.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle002_1.geometry} material={materials.plastikas} />

                </group>

                <mesh castShadow receiveShadow geometry={nodes.bassdrum_tom_holder_base.geometry} material={materials.metalas} position={[0, 0.597, -0.077]} rotation={[0, Math.PI / 2, 0]} />

                <group position={[0.031, 0.718, -0.077]} rotation={[-Math.PI, -0.475, 0]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle007.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle007_1.geometry} material={materials['metalas grovie ']} />

                </group>

                <group position={[-0.027, 0.718, -0.077]} rotation={[-Math.PI, -0.81, 0]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle017.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle017_1.geometry} material={materials['metalas grovie ']} />

                </group>

                <group position={[0, 0.301, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle034.geometry} material={materials.drums} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle034_1.geometry} material={materials['Furniture wood']} />

                </group>

                <group position={[0, 0.301, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle040.geometry} material={materials['Transparent plastic']} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle040_1.geometry} material={materials['Transparent plastic.001']} />

                </group>

                <mesh castShadow receiveShadow geometry={nodes.bassdrum003.geometry} material={materials['drums.001']} position={[0, 0.301, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} />

                <mesh castShadow receiveShadow geometry={nodes.Circle.geometry} material={materials['Oak Wood']} position={[-0.109, 0.532, -1.022]} />

                <group position={[-0.031, 0.772, -0.077]} rotation={[0.071, 0.613, -1.612]}>

                    <mesh castShadow receiveShadow geometry={nodes.bassdrum_tom_holder_hinge002.geometry} material={materials.metalas} rotation={[Math.PI, -1.178, Math.PI]}>

                        <group position={[-0.036, 0, 0.047]} rotation={[2.364, -0.142, -0.136]} scale={0.128}>

                            <mesh castShadow receiveShadow geometry={nodes.Circle011.geometry} material={materials.metalas} />

                            <mesh castShadow receiveShadow geometry={nodes.Circle011_1.geometry} material={materials['metalas grovie ']} />

                            <Tom2 ref={tom2Ref} nodes={nodes} materials={materials} />

                        </group>

                    </mesh>

                </group>

                <group position={[0.031, 0.772, -0.077]} rotation={[1.304, -0.145, 2.058]}>

                    <mesh castShadow receiveShadow geometry={nodes.bassdrum_tom_holder_hinge003.geometry} material={materials.metalas} position={[-0.011, 0, 0.053]} rotation={[-1.7, -0.576, 2.907]} />

                    <group position={[-0.047, 0, -0.049]} rotation={[-0.07, -0.195, 3.117]} scale={0.128}>

                        <mesh castShadow receiveShadow geometry={nodes.Circle018.geometry} material={materials.metalas} />

                        <mesh castShadow receiveShadow geometry={nodes.Circle018_1.geometry} material={materials['metalas grovie ']} />

                        <Tom1 ref={tom1Ref} nodes={nodes} materials={materials} />

                    </group>

                </group>

                <group position={[0.653, 0, -0.789]} rotation={[Math.PI, -1.164, Math.PI]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle036.geometry} material={materials.plastikas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle036_1.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle036_2.geometry} material={materials.cymbals} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle036_3.geometry} material={materials['Metal scratched (CHAIN)']} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle036_4.geometry} material={materials['METAL PEDAL']} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle036_5.geometry} material={materials['metalas grovie ']} />

                </group>

                <group position={[-0.008, 0.384, -0.996]} rotation={[Math.PI, 0.99, -Math.PI / 2]}>

                    <mesh castShadow receiveShadow geometry={nodes.Circle037.geometry} material={materials.metalas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle037_1.geometry} material={materials.plastikas} />

                    <mesh castShadow receiveShadow geometry={nodes.Circle037_2.geometry} material={materials['metalas grovie ']} />

                    <mesh castShadow receiveShadow geometry={nodes.stool_cushion.geometry} material={materials.Leather} position={[0.009, 0, 0]} rotation={[-2.618, 0, -Math.PI / 2]} scale={[0.15, 0.131, 0.15]} />

                </group>



                {/* === ANIMATABLE COMPONENTS === */}

                <Snare ref={snareRef} nodes={nodes} materials={materials} />

                <FloorTom ref={floorTomRef} nodes={nodes} materials={materials} />

                <CrashCymbal ref={crashRef} nodes={nodes} materials={materials} />

                <RideCymbal ref={rideRef} nodes={nodes} materials={materials} />

                <HiHat ref={hiHatRef} nodes={nodes} materials={materials} />



            </group>

        </group>

    )

})



useGLTF.preload('https://cdn.jsdelivr.net/gh/onemore-adi/hb_website@optimization/public/drum.glb')