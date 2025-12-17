import { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../styles/BandMembers.module.css';

interface BandMember {
    name: string;
    role: string;
    image: string;
}

// Band member data
const bandMembers: BandMember[] = [
    {
        name: "Member 1",
        role: "Lead Vocals",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 2",
        role: "Lead Guitar",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 3",
        role: "Bass Guitar",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 4",
        role: "Drums",
        image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 5",
        role: "Keyboard",
        image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 6",
        role: "Rhythm Guitar",
        image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 7",
        role: "Tabla",
        image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Member 8",
        role: "Sitar",
        image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop"
    }
];

// Portrait Card Component
function PortraitCard({ member, index }: { member: BandMember; index: number }) {
    return (
        <div
            className={styles.portraitCard}
            style={{ '--index': index } as React.CSSProperties}
        >
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

    // Scroll handler for horizontal scroll linked to vertical scroll
    const handleScroll = useCallback(() => {
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

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

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
