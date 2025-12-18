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
                <a
                    href="mailto:heartbeats@nitrourkela.ac.in"
                    className={styles.emailLink}
                >
                    <span className={styles.emailText}>
                        heartbeats@nitrourkela.ac.in
                    </span>
                </a>

                {/* Quick-Link Grid */}
                <div className={styles.linkGrid}>
                    {/* Direct Channels */}
                    <div className={styles.linkColumn}>
                        <span className={styles.columnLabel}>Direct Channels</span>
                        <ul className={styles.linkList}>
                            <li>
                                <a href="mailto:bookings@heartbeats.in" className={styles.textLink}>
                                    Bookings <span className={styles.arrow}>→</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:press@heartbeats.in" className={styles.textLink}>
                                    Press <span className={styles.arrow}>→</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:hello@heartbeats.in" className={styles.textLink}>
                                    General Inquiries <span className={styles.arrow}>→</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Pulse */}
                    <div className={styles.linkColumn}>
                        <span className={styles.columnLabel}>Social Pulse</span>
                        <div className={styles.socialGrid}>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="18" cy="6" r="1" fill="currentColor" />
                                </svg>
                            </a>
                            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Spotify">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 15c4-1 8 0 8 0" />
                                    <path d="M7 12c5-1.5 10 0 10 0" />
                                    <path d="M6 9c6-2 12 0 12 0" />
                                </svg>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="4" width="20" height="16" rx="4" />
                                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                                </svg>
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="TikTok">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
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
                                <a href="#privacy" className={styles.textLink}>
                                    Privacy <span className={styles.arrow}>→</span>
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
