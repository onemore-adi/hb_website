// Mobile Hero Component with Sophisticated Parallax
// Used on screens smaller than iPad (< 768px width)

import { useEffect, useRef, useState } from 'react';
import styles from '../styles/MobileHero.module.css';

// Cloudinary URL for the drumkit image - replace with your actual image
// You can take a screenshot of your 3D drumkit and upload it
const HERO_IMAGE_URL = 'https://res.cloudinary.com/dkzmumdp2/image/upload/v1766755409/Screenshot_2025-12-26_at_18.52.40_ubsq07.png';

interface MobileHeroProps {
    onScrollProgress?: (progress: number) => void;
}

export function MobileHero({ onScrollProgress }: MobileHeroProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const progress = Math.min(scrollY / vh, 1);

            // Notify parent of scroll progress
            onScrollProgress?.(progress);

            if (heroRef.current && imageRef.current && overlayRef.current) {
                // Parallax effect - image moves slower than scroll
                const parallaxY = scrollY * 0.4;

                // Scale up slightly as user scrolls
                const scale = 1 + progress * 0.15;

                // Subtle rotation for depth feel
                const rotateX = progress * 5; // degrees

                // Apply transforms with GPU acceleration
                imageRef.current.style.transform = `
                    translateY(${parallaxY}px) 
                    scale(${scale}) 
                    perspective(1000px) 
                    rotateX(${rotateX}deg)
                `;

                // Fade out hero section
                const opacity = Math.max(0, 1 - progress * 1.5);
                heroRef.current.style.opacity = String(opacity);

                // Darkening overlay
                overlayRef.current.style.backgroundColor = `rgba(0, 0, 0, ${0.3 + progress * 0.4})`;

                // Hide when fully scrolled
                if (progress >= 0.8) {
                    heroRef.current.style.visibility = 'hidden';
                    heroRef.current.style.pointerEvents = 'none';
                } else {
                    heroRef.current.style.visibility = 'visible';
                    heroRef.current.style.pointerEvents = 'auto';
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, [onScrollProgress]);

    return (
        <div
            ref={heroRef}
            className={`${styles.hero} ${isLoaded ? styles.loaded : ''}`}
        >
            {/* Background gradient for depth */}
            <div className={styles.gradientBackground} />

            {/* Main hero image with parallax */}
            <div className={styles.imageWrapper}>
                <img
                    ref={imageRef}
                    src={HERO_IMAGE_URL}
                    alt="HeartBeats Band"
                    className={styles.heroImage}
                    onLoad={() => setIsLoaded(true)}
                    loading="eager"
                />
            </div>

            {/* Dynamic overlay */}
            <div ref={overlayRef} className={styles.overlay} />

            {/* Content overlay */}
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.titleLine}>HEART</span>
                    <span className={styles.titleLine}>BEATS</span>
                </h1>
                <p className={styles.subtitle}>
                    The Official Music Fusion Band of NIT Rourkela
                </p>

                {/* Scroll indicator */}
                <div className={styles.scrollIndicator}>
                    <div className={styles.scrollLine} />
                    <span className={styles.scrollText}>SCROLL</span>
                </div>
            </div>

            {/* Animated accent lines */}
            <div className={styles.accentLines}>
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.accentLine}
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    );
}
