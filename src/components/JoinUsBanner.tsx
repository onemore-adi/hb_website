import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/JoinUsBanner.module.css';

// Achievements data - using index numbers instead of emojis
const achievements = [
    "Best Band - NIT Rourkela 2024",
    "50+ Live Performances",
    "Inter-NIT Champions 2023",
    "3 Original Compositions",
];

// Performances data
const performances = [
    "Nitrutsav 2024 - Main Stage",
    "Mood Indigo, IIT Bombay",
    "Thomso, IIT Roorkee",
    "Spring Fest 2024",
];

export function JoinUsBanner() {
    const [bannerState, setBannerState] = useState(0); // 0, 1, 2
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Intersection Observer to detect when section is in view
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.5,
        });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [handleIntersection]);

    // Cycle content every 3.5 seconds
    useEffect(() => {
        if (isVisible) {
            timerRef.current = setInterval(() => {
                setBannerState(prev => (prev + 1) % 3);
            }, 3500);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            // Reset to 0 when out of view? Optional.
            // setBannerState(0); 
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isVisible]);

    // Desktop: State 0 = Headline, State 1 & 2 = Stats
    const showStats = bannerState !== 0;

    return (
        <section
            ref={sectionRef}
            className={styles.section}
            id="join-us"
            data-state={bannerState}
        >
            {/* Ambient glow effects */}
            <div className={styles.ambientGlow} />
            <div className={styles.ambientGlow2} />

            {/* Main content wrapper */}
            <div className={styles.contentWrapper}>
                {/* Left side content */}
                <div className={styles.sideContent}>
                    {/* State 0: Headline */}
                    <div className={`${styles.sidePanel} ${styles.headlinePanel} ${!showStats ? styles.active : ''}`}>
                        <span className={styles.eyebrow}>NOW RECRUITING</span>
                        <h2 className={styles.headline}>
                            Become Part of<br />
                            <span className={styles.headlineAccent}>Something Epic</span>
                        </h2>
                    </div>
                    {/* State 1 (Mobile Focus): Achievements */}
                    <div className={`${styles.sidePanel} ${styles.statsPanel} ${styles.achievementsPanel} ${showStats ? styles.active : ''}`}>
                        <span className={styles.panelLabel}>Our Achievements</span>
                        <ul className={styles.statsList}>
                            {achievements.map((item, index) => (
                                <li key={index} className={styles.statItem}>
                                    <span className={styles.statNumber}>{String(index + 1).padStart(2, '0')}</span>
                                    <span className={styles.statText}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Center - Fixed CTA Button */}
                <div className={styles.centerCta}>
                    <div className={styles.ctaGlow} />
                    <Link to="/join" className={styles.ctaButton}>
                        <span className={styles.ctaText}>Join the Band</span>
                        <span className={styles.ctaArrow}>→</span>
                    </Link>
                    <div className={styles.ctaSubtext}>
                        {bannerState === 0 ? 'Applications open' :
                            bannerState === 1 ? 'Be part of the legacy' :
                                'Take the stage'}
                    </div>
                </div>

                {/* Right side content */}
                <div className={styles.sideContent}>
                    {/* State 0: Tagline */}
                    <div className={`${styles.sidePanel} ${styles.taglinePanel} ${!showStats ? styles.active : ''}`}>
                        <p className={styles.tagline}>
                            Are you a passionate musician, producer, or creative mind?
                            We're looking for talent to join the HEARTBEATS family.
                        </p>
                    </div>
                    {/* State 2 (Mobile Focus): Performances */}
                    <div className={`${styles.sidePanel} ${styles.statsPanel} ${styles.performancesPanel} ${showStats ? styles.active : ''}`}>
                        <span className={styles.panelLabel}>Key Performances</span>
                        <ul className={styles.statsList}>
                            {performances.map((item, index) => (
                                <li key={index} className={styles.statItem}>
                                    <span className={styles.statNumber}>{String(index + 1).padStart(2, '0')}</span>
                                    <span className={styles.statText}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom branding */}
            <div className={styles.bottomBranding}>
                <div className={styles.brandLine} />
                <span className={styles.brandText}>HEARTBEATS</span>
                <div className={styles.brandLine} />
            </div>

            {/* View indicator */}
            <div className={styles.viewIndicator}>
                <span className={`${styles.indicatorDot} ${bannerState === 0 ? styles.activeDot : ''}`} />
                <span className={`${styles.indicatorDot} ${bannerState === 1 ? styles.activeDot : ''}`} />
                <span className={`${styles.indicatorDot} ${bannerState === 2 ? styles.activeDot : ''}`} />
            </div>
        </section>
    );
}
