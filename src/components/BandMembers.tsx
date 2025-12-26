import { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../styles/BandMembers.module.css';

interface BandMember {
    name: string;
    role: string;
    image: string;
    ebRole?: string; // Executive Body role (Vice President, Secretary, Treasurer)
}

// Band member data - Using Cloudinary CDN for bandwidth optimization
const bandMembers: BandMember[] = [
    {
        name: "Amrit",
        role: "Vocalist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637065/Amrit_vocalist_gx8zrs.webp"
    },
    {
        name: "Ashrit",
        role: "Vocalist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637067/Ashrit_vocalist_u1xsii.jpg"
    },
    {
        name: "Paromita",
        role: "Vocalist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637069/Paromita_vocalist_oxihdv.jpg"
    },
    {
        name: "Rishreeta",
        role: "Vocalist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637065/Rishreeta_vocalist_pffbrk.jpg",
        ebRole: "Vice President"
    },
    {
        name: "Sumedh",
        role: "Guitarist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637066/Sumedh_guitarist_masgx8.jpg"
    },
    {
        name: "Ajitesh",
        role: "Keyboardist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637245/Ajitesh_keyboardist-min_xj8mvj.jpg",
        ebRole: "Secretary"
    },
    {
        name: "Ayush",
        role: "Keyboardist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637246/Ayush_keyboardist-min_ozbcdl.jpg"
    },
    {
        name: "Govind",
        role: "Drummer",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637066/Govind_drummer_ygr9nc.jpg"
    },
    {
        name: "Achutha",
        role: "Flautist",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637066/Achutha_flautist_riw35e.jpg",
        ebRole: "Treasurer"
    },
    {
        name: "Anustup",
        role: "Sarod",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637067/Anustup_sarod_kibn4o.jpg"
    },
    {
        name: "Rishabh",
        role: "Manager",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637245/Rishabh_manager-min_xw8pcv.jpg"
    },
    {
        name: "Sthiti",
        role: "Manager",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637065/Sthiti_manager_h8aozg.jpg"
    },
    {
        name: "Nirav",
        role: "Designer",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637067/Nirav_designer_sl5e3d.jpg"
    },
    {
        name: "Rishav",
        role: "Photographer",
        image: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637066/rishav_photographer_gdbitk.jpg"
    }
];

// Portrait Card Component
function PortraitCard({ member, index }: { member: BandMember; index: number }) {
    return (
        <div
            className={`${styles.portraitCard} ${member.ebRole ? styles.ebMember : ''}`}
            style={{ '--index': index } as React.CSSProperties}
        >
            {/* EB Badge */}
            {member.ebRole && (
                <div className={styles.ebBadge}>
                    <span className={styles.ebLabel}>EB</span>
                    <span className={styles.ebRole}>{member.ebRole}</span>
                </div>
            )}

            {/* Portrait Image */}
            <div className={styles.imageContainer}>
                <img
                    src={member.image}
                    alt={member.name}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                />
                <div className={styles.imageOverlay}></div>
            </div>

            {/* Info */}
            <div className={styles.cardInfo}>
                <span className={styles.indexNumber}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.name}>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
            </div>
        </div>
    );
}

export function BandMembers() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const tickingRef = useRef(false);

    // Core update logic - Separated for rAF throttling
    const updateScroll = useCallback(() => {
        if (!sectionRef.current || !trackRef.current) return;

        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;

        // Section is "active" when its top is at or above viewport top
        // and its bottom is below viewport top
        if (rect.top > 0 || rect.bottom < windowHeight) {
            // Not in active scroll zone yet
            if (rect.top > 0) {
                setScrollProgress(0);
                trackRef.current.style.transform = `translateX(0px)`;
            }
            return;
        }

        // Calculate scroll progress through the section
        const scrollableDistance = sectionHeight - windowHeight;
        const scrolled = Math.abs(rect.top);
        const progress = Math.min(1, Math.max(0, scrolled / scrollableDistance));

        setScrollProgress(progress);

        // Apply horizontal translation
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const maxTranslate = Math.max(0, trackWidth - viewportWidth + 100);
        const translateX = progress * maxTranslate;

        trackRef.current.style.transform = `translateX(-${translateX}px)`;
    }, []);

    // Scroll listener that schedules update on next animation frame
    const onScroll = useCallback(() => {
        if (!tickingRef.current) {
            window.requestAnimationFrame(() => {
                updateScroll();
                tickingRef.current = false;
            });
            tickingRef.current = true;
        }
    }, [updateScroll]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll, { passive: true });
        // Initial measurement
        updateScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll, updateScroll]);

    return (
        <section ref={sectionRef} className={styles.section}>
            {/* Sticky Container */}
            <div className={styles.stickyContainer}>
                {/* Header */}
                <header className={styles.header}>
                    <span className={styles.tagline}>THE ARTISTS</span>
                    <h2 className={styles.title}>Meet the Band</h2>
                </header>

                {/* Horizontal Gallery */}
                <div className={styles.galleryWrapper}>
                    <div ref={trackRef} className={styles.galleryTrack}>
                        {bandMembers.map((member, index) => (
                            <PortraitCard
                                key={index}
                                member={member}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ transform: `scaleX(${scrollProgress})` }}
                    ></div>
                </div>
            </div>
        </section>
    );
}
