import { useState, useRef, useCallback, useEffect } from 'react';
import styles from '../styles/ContactFooter.module.css';

export function ContactFooter() {
    const sectionRef = useRef<HTMLElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Intersection Observer for fade-in/fade-out effect
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Mouse follower glow effect
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }, []);

    // Scroll to top handler
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer
            ref={sectionRef}
            className={`${styles.footer} ${isVisible ? styles.visible : ''}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Noise texture overlay */}
            <div className={styles.noiseOverlay} />

            {/* Mouse follower glow */}
            <div
                className={`${styles.mouseGlow} ${isHovering ? styles.glowVisible : ''}`}
                style={{
                    left: mousePos.x,
                    top: mousePos.y
                }}
            />

            {/* Main content */}
            <div className={styles.content}>
                {/* Title */}
                <span className={styles.sectionLabel}>CONTACT</span>
                <h2 className={styles.title}>START THE FREQUENCY</h2>

                {/* Giant Email Typography */}
                {/* Giant Email Typography */}
                <a
                    href="mailto:heartbeats.nitrkl@gmail.com"
                    className={styles.emailLink}
                >
                    <span className={styles.emailText}>
                        heartbeats.nitrkl@gmail.com
                    </span>
                </a>

                {/* Quick-Link Grid */}
                <div className={styles.linkGrid}>
                    {/* Social Pulse */}
                    <div className={styles.linkColumn}>
                        <span className={styles.columnLabel}>Social Pulse</span>
                        <div className={styles.socialGrid}>
                            <a href="https://www.instagram.com/heartbeats.nitr" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="18" cy="6" r="1" fill="currentColor" />
                                </svg>
                            </a>
                            <a href="https://www.youtube.com/@HeartBeatsNITR" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="4" width="20" height="16" rx="4" />
                                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Legal/Nav */}
                    <div className={styles.linkColumn}>
                        <span className={styles.columnLabel}>Navigation</span>
                        <ul className={styles.linkList}>
                            <li>
                                <button onClick={scrollToTop} className={styles.textLink}>
                                    Back to Top <span className={styles.arrow}>↑</span>
                                </button>
                            </li>
                            <li>
                                <a href="/dashboard" className={styles.textLink}>
                                    Dashboard <span className={styles.arrow}>→</span>
                                </a>
                            </li>
                            <li>
                                <span className={styles.copyright}>
                                    © 2025 HEARTBEATS
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Exit transition - Large HEARTBEATS logo */}
            <div className={styles.exitLogo}>
                <span className={styles.exitLogoText}>HEARTBEATS</span>
            </div>
        </footer>
    );
}
