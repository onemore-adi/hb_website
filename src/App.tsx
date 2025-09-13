"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "../Scene"; // Fixed import path
import { Leva } from "leva";

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Leva />
      <Canvas
        shadows
        camera={{
          position: [0, 1.3, 10],
          fov: 15,
        }}
        style={{ background: '#090909ff' }}
      >
        <Scene />
      </Canvas>
      
      {/* Simple UI overlay
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>3D Drum Kit Viewer</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>• Left click + drag to rotate</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>• Right click + drag to pan</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>• Scroll to zoom</p>
      </div> */}
    </div>
  );
}