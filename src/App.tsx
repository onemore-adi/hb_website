"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "../Scene";
import { Leva } from "leva";
import { useEffect, useRef, useState } from "react";
import { SlidingSection } from "./components/SlidingSection";

export function App() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll Logic State
  const [galleryScroll, setGalleryScroll] = useState(0);
  const [expansionProgress, setExpansionProgress] = useState(0);

  // Smooth Scroll Refs
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      targetScroll.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Lerp smoothing: move current towards target by factor 0.05 (slower/heavier) to 0.1 (faster)
      // 0.05 gives a nice "weighty" feel which reduces jitter perception
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.08;

      const scrollY = currentScroll.current;
      const vh = window.innerHeight;

      // TIMELINE CONFIGURATION - COMPRESSED (Faster)
      // Original Total: ~450vh (4.5 screens)
      // New Total: ~250vh (2.5 screens)

      const HERO_END = 0.7 * vh; // Slightly faster hero
      const GALLERY_START = 0.7 * vh;
      const GALLERY_END = 2.0 * vh; // 1.3 screens for gallery (was 2.5)
      const EXPANSION_START = 2.0 * vh;
      const EXPANSION_END = 2.5 * vh; // 0.5 screen for expansion (was 1.0)

      // 1. HERO ANIMATION (0 - 100vh)
      if (heroRef.current) {
        // We only handle Opacity here now. 
        // 3D transforms (Scale/Rotation) are handled inside Scene.tsx for smoothness.

        // Use raw scrollY for Opacity Logic to sync with timeline
        const heroProgress = Math.min(Math.max(0, scrollY / HERO_END), 1);

        // Opacity fade out
        const opacity = Math.max(0, 1 - Math.max(0, heroProgress - 0.7) * 3.33);

        heroRef.current.style.opacity = `${opacity}`;
        heroRef.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
        heroRef.current.style.pointerEvents = opacity <= 0.01 ? 'none' : 'auto';

        // Reset transform to ensure no CSS conflict if any remains
        heroRef.current.style.transform = 'none';
      }

      // 2. GALLERY ANIMATION
      // For gallery, we might want the smoothed value too, or direct? 
      // Smoothed is usually better for consistency.
      let currentGalleryScroll = 0;
      if (scrollY > GALLERY_START) {
        const progress = Math.min((scrollY - GALLERY_START) / (GALLERY_END - GALLERY_START), 1);
        currentGalleryScroll = progress;
      }

      // 3. EXPANSION ANIMATION
      let currentExpansion = 0;
      if (scrollY > EXPANSION_START) {
        const progress = Math.min((scrollY - EXPANSION_START) / (EXPANSION_END - EXPANSION_START), 1);
        currentExpansion = progress;
      }

      // Update state only if changed significantly to avoid strict equality churn?
      // Actually React state updates in RAF 60fps might be okay if components are optimized.
      // But passing these down as props triggers re-renders of SlidingSection.
      // Ideally SlidingSection should also expose a ref API or we pass the RefObject down.
      // For now, let's just set state and see if performance holds.
      setGalleryScroll(currentGalleryScroll);
      setExpansionProgress(currentExpansion);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ backgroundColor: 'black', minHeight: '550vh' }}>

      {/* 1. HERO SECTION (Sticky 0-100vh) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10,
          willChange: 'transform, opacity'
        }}
        ref={heroRef}
      >
        <Leva hidden />
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
      </div>

      {/* 2. SLIDING GALLERY (Sticky during its phase) */}
      {/* We want this to be visible after Hero fades. 
          It should be sticky starting at 100vh (or 0vh but under hero) until expansion is done.
          Actually easiest is to have it fixed/sticky at top zIndex 5, and Hero fades out to reveal it.
      */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 5, // Behind Hero initially
          // It needs to stay visible until we scroll very far past? 
          // Actually next section will just scroll over it if we use normal flow, OR we fade it out/transition.
          // Since "Last Frame Expands to Next Section", we might want the NEXT section to appear *inside* the expansion.
        }}
      >
        <SlidingSection scrollProgress={galleryScroll} expansionProgress={expansionProgress} />
      </div>

      {/* 3. NEXT SECTION PLACEHOLDER - REMOVED (Revealing image only) */}
      <div style={{ height: '100vh', width: '100vw' }} />

    </div>
  );
}