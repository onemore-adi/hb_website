"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "../Scene";
import { Leva } from "leva";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { SlidingSection } from "./components/SlidingSection";
import { Navbar } from "./components/Navbar";
import { MobileHero } from "./components/MobileHero";

// Lazy load below-fold components - only load when user scrolls to them
const BandMembers = lazy(() => import("./components/BandMembers").then(m => ({ default: m.BandMembers })));
const JoinUsBanner = lazy(() => import("./components/JoinUsBanner").then(m => ({ default: m.JoinUsBanner })));
const ContactFooter = lazy(() => import("./components/ContactFooter").then(m => ({ default: m.ContactFooter })));

// Breakpoint for iPad and larger (768px is standard iPad width)
const TABLET_BREAKPOINT = 768;

// Hook to detect if device is mobile (below iPad width)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // SSR-safe initial value
    if (typeof window === 'undefined') return false;
    return window.innerWidth < TABLET_BREAKPOINT;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < TABLET_BREAKPOINT);
    };

    // Check on mount
    checkMobile();

    // Listen for resize (with debounce)
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
}

export function App() {
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll Logic State
  const [galleryScroll, setGalleryScroll] = useState(0);
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [galleryOpacity, setGalleryOpacity] = useState(1); // Control gallery visibility

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

  // Mobile: Simpler scroll handler without heavy lerping
  useEffect(() => {
    if (!isMobile) return;

    const handleMobileScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Timeline constants
      const GALLERY_START = 0.7 * vh;
      const GALLERY_END = 2.0 * vh; // Video reaches center at this point

      // Gallery scroll progress (0-1)
      let currentGalleryScroll = 0;
      if (scrollY > GALLERY_START) {
        currentGalleryScroll = Math.min((scrollY - GALLERY_START) / (GALLERY_END - GALLERY_START), 1);
      }

      // Expansion Logic:
      // We want the video to sit as a thumbnail for a bit before expanding.
      // User requested minimal gap: "as soon as the last image is crossed"
      const EXPANSION_START = GALLERY_END + 0.2 * vh;
      const EXPANSION_END = EXPANSION_START + 0.8 * vh;

      let currentExpansion = 0;
      if (scrollY > EXPANSION_START) {
        currentExpansion = Math.min((scrollY - EXPANSION_START) / (EXPANSION_END - EXPANSION_START), 1);
      }

      // Safety: If expanding, gallery MUST be finished
      if (currentExpansion > 0) currentGalleryScroll = 1;

      // Hero fade (unchanged)
      const FADE_START = 400 * vh;
      const FADE_END = 500 * vh;
      let videoOpacity = 1;
      if (scrollY > FADE_START) {
        videoOpacity = Math.max(0, 1 - (scrollY - FADE_START) / (FADE_END - FADE_START));
      }

      // Gallery opacity - show after hero fades
      let currentGalleryOpacity = 1;
      if (scrollY < GALLERY_START) {
        currentGalleryOpacity = 0;
      } else if (scrollY < GALLERY_START + 0.1 * vh) {
        currentGalleryOpacity = (scrollY - GALLERY_START) / (0.1 * vh);
      }

      setGalleryScroll(currentGalleryScroll);
      setExpansionProgress(currentExpansion);
      setVideoOpacity(videoOpacity);
      setGalleryOpacity(currentGalleryOpacity);
    };

    window.addEventListener('scroll', handleMobileScroll, { passive: true });
    handleMobileScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleMobileScroll);
  }, [isMobile]);

  // Desktop: Animation Loop with lerping for smooth feel
  useEffect(() => {
    // Skip heavy animation loop on mobile
    if (isMobile) return;

    let animationFrameId: number;

    const animate = () => {
      // Lerp smoothing: move current towards target by factor 0.05 (slower/heavier) to 0.1 (faster)
      // 0.05 gives a nice "weighty" feel which reduces jitter perception
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.08;

      const scrollY = currentScroll.current;
      const vh = window.innerHeight;

      // TIMELINE CONFIGURATION
      // Phase 1: Hero fades (0 - 0.7vh)
      // Phase 2: Gallery scrolls (0.7vh - 2.0vh)
      // Phase 3: PAUSE (2.0vh - 2.2vh) - Brief pause
      // Phase 4: Video expands (2.2vh - 3.5vh)

      const HERO_END = 0.7 * vh;
      const GALLERY_START = 0.7 * vh;
      const GALLERY_END = 2.0 * vh;

      // Reduced gap as requested
      const EXPANSION_START = 2.2 * vh;
      const EXPANSION_END = 3.5 * vh; // Slower expansion

      // 1. HERO ANIMATION (0 - 0.7vh)
      if (heroRef.current) {
        const heroProgress = Math.min(Math.max(0, scrollY / HERO_END), 1);
        const opacity = Math.max(0, 1 - Math.max(0, heroProgress - 0.7) * 3.33);

        heroRef.current.style.opacity = `${opacity}`;
        heroRef.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
        heroRef.current.style.pointerEvents = opacity <= 0.01 ? 'none' : 'auto';
        heroRef.current.style.transform = 'none';
      }

      // 2. GALLERY ANIMATION
      let currentGalleryScroll = 0;
      if (scrollY > GALLERY_START) {
        // Gallery finishes at GALLERY_END (2.0vh).
        // It stays at 1 (centered) from 2.0vh onwards.
        const progress = Math.min((scrollY - GALLERY_START) / (GALLERY_END - GALLERY_START), 1);
        currentGalleryScroll = progress;
      }

      // 3. EXPANSION ANIMATION
      let currentExpansion = 0;
      if (scrollY > EXPANSION_START) {
        const progress = Math.min((scrollY - EXPANSION_START) / (EXPANSION_END - EXPANSION_START), 1);
        currentExpansion = progress;
      }

      // Safety: If expanding, gallery MUST be finished
      if (currentExpansion > 0) currentGalleryScroll = 1;


      // Calculate video fade based on Meet the Band scroll position
      // Corrected values for fade logic
      const FADE_START = 5.0 * vh; // Start fading later
      const FADE_END = 6.0 * vh;   // Fully faded
      let videoOpacity = 1;
      if (scrollY > FADE_START) {
        videoOpacity = Math.max(0, 1 - (scrollY - FADE_START) / (FADE_END - FADE_START));
      }

      setGalleryScroll(currentGalleryScroll);
      setExpansionProgress(currentExpansion);
      setVideoOpacity(videoOpacity);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobile]);

  return (
    <div style={{ backgroundColor: 'black', minHeight: '550vh' }}>

      {/* NAVIGATION BAR - Smart header with scroll behavior */}
      <Navbar />

      {/* 1. HERO SECTION - Conditional rendering based on device */}
      {isMobile ? (
        // Mobile: Lightweight parallax hero (no WebGL)
        <MobileHero />
      ) : (
        // Desktop/Tablet: Full Three.js experience
        // Desktop/Tablet: Full Three.js experience
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10,
            willChange: 'transform, opacity',
            backgroundColor: '#090909', // Base background color
          }}
          ref={heroRef}
        >
          {/* Layer 1: Back Text (Solid) - Renders first (behind) */}
          <h1 className="hero-title-layered hero-title-back">HEARTBEATS</h1>

          {/* Layer 2: 3D Scene (Drum Kit) - Renders second (middle) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Leva hidden />
            <Canvas
              shadows
              gl={{ alpha: true }} // Force transparent background
              camera={{
                position: [0, 1.3, 10],
                fov: 15,
              }}
              style={{ background: 'transparent' }}
            >
              <Scene />
            </Canvas>
          </div>

          {/* Layer 3: Front Text (Outline) - Renders last (on top) */}
          <h1 className="hero-title-layered hero-title-front">HEARTBEATS</h1>
        </div>
      )}

      {/* 2. SLIDING GALLERY (Sticky during its phase) */}
      {/* Fades out after video hold completes to reveal Band Members section */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 5,
          opacity: isMobile ? galleryOpacity * videoOpacity : videoOpacity,
          visibility: (isMobile ? galleryOpacity * videoOpacity : videoOpacity) <= 0.01 ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease',
          pointerEvents: (isMobile ? galleryOpacity * videoOpacity : videoOpacity) <= 0.01 ? 'none' : 'auto',
        }}
      >
        <SlidingSection scrollProgress={galleryScroll} expansionProgress={expansionProgress} />
      </div>

      {/* 3. SPACER TO PUSH BAND MEMBERS BELOW THE FIXED SECTIONS */}
      <div style={{ height: '450vh', width: '100vw' }} />

      {/* 4. BAND MEMBERS SECTION - Seamless with black background */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#000000',
        margin: 0,
        padding: 0,
      }}>
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
          <BandMembers />
          <JoinUsBanner />
          <ContactFooter />
        </Suspense>
      </div>

    </div>
  );
}