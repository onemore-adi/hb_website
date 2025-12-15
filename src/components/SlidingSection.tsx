import { useEffect, useRef } from 'react';
import styles from '../styles/SlidingSection.module.css';

type MediaItem = {
    type: 'image' | 'video';
    src: string;
};

const items: MediaItem[] = [
    { type: 'image', src: "https://plus.unsplash.com/premium_photo-1682855223699-edb85ffa57b3?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1605340406960-f5b496c38b3d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1521547418549-6a31aad7c177?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1550635707-e8c55839e834?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1614247912229-26a7e2114c0a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'image', src: "https://images.unsplash.com/photo-1508979822114-db019a20d576?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { type: 'video', src: "/bpgc.mov" }
];

interface SlidingSectionProps {
    scrollProgress: number; // 0 to 1 (Scrolls through images)
    expansionProgress: number; // 0 to 1 (Expands last image)
}

export function SlidingSection({ scrollProgress, expansionProgress }: SlidingSectionProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        // Horizontal Scroll Logic
        // We want to scroll such that at scrollProgress = 1, the LAST image is centered.
        // Last Image is the Nth image.
        // Image Width = 40vmin. Gap = 4vmin.
        // Track logic: standard flex row.

        // Position of Center of Last Image from start of track:
        // (N-1) * (Width + Gap) + (Width / 2)
        // N = 8.
        // Dist = 7 * (44vmin) + 20vmin = 308vmin + 20vmin = 328vmin.

        // We want this point to be at 50vw.
        // Transform X = 50vw - 328vmin.

        // Let's use CSS calc for precision.
        // N=8.

        const travelDistanceVmin = (items.length - 1) * 44;
        const currentVminOffset = 20 + travelDistanceVmin * scrollProgress;

        // CSS module has `left: 50%`.
        // So 0px translation means the *start* of the track is at 50vw.
        // We want the current point of interest (currentVminOffset) to be at 50vw.
        // So we need to translate LEFT by currentVminOffset.

        track.style.transform = `translate(calc(-${currentVminOffset}vmin), -50%)`;

        // Parallax logic for images (keep as is or adjust?)
        // Original was `100 + percentage`.
        // Let's keep it simple: `objectPosition` creates the parallax.
        // We can map scrollProgress 0-1 to some parallax range.
        const mediaElements = track.getElementsByClassName(styles.image);
        for (const el of mediaElements) {
            // Linear mapping 100% -> 0%?
            // Just keep consistent motion.

            // Note: Video elements also support object-position if object-fit is set.
            el.animate({
                objectPosition: `${100 - 100 * scrollProgress}% center`
            }, { duration: 100, fill: "forwards" });
        }

        // Last Image Expansion Logic
        const lastItemContainer = track.children[track.children.length - 1] as HTMLElement;
        const overlayElement = overlayRef.current;

        if (lastItemContainer && overlayElement) {
            if (expansionProgress > 0) {
                // HIDE original container to prevent duplication/glitches
                lastItemContainer.style.opacity = '0';

                // SHOW Overlay Element
                // "Reveal" Transition using Overlay:
                overlayElement.style.display = 'block';
                overlayElement.style.zIndex = '100';
                overlayElement.style.position = 'fixed';
                overlayElement.style.top = '0';
                overlayElement.style.left = '0';
                overlayElement.style.width = '100vw';
                overlayElement.style.height = '100vh';

                // Interpolate Clip Path
                const p = 1 - expansionProgress;
                const currentInsetY = `calc((50vh - 28vmin) * ${p})`;
                const currentInsetX = `calc((50vw - 20vmin) * ${p})`;

                overlayElement.style.clipPath = `inset(${currentInsetY} ${currentInsetX} ${currentInsetY} ${currentInsetX} round 0px)`;

            } else {
                // RESET
                lastItemContainer.style.opacity = '1';

                overlayElement.style.display = 'none';
                overlayElement.style.zIndex = '';
                overlayElement.style.position = '';
                overlayElement.style.width = '';
                overlayElement.style.height = '';
                overlayElement.style.clipPath = '';
            }
        }

    }, [scrollProgress, expansionProgress]);

    // Helper to render media
    const renderMedia = (item: MediaItem, index: number, isOverlay = false) => {
        const commonStyle: React.CSSProperties = isOverlay ? {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        } : {
            // styles.image class handles the base size (40vmin x 56vmin)
        };

        const Tag = item.type === 'video' ? 'video' : 'img';
        const attrs = item.type === 'video' ? {
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            src: item.src
        } : {
            src: item.src,
            draggable: false,
            alt: `Slide ${index + 1}`
        };

        return (
            <Tag
                key={index}
                className={!isOverlay ? styles.image : undefined}
                style={commonStyle}
                {...attrs}
            />
        );
    };

    return (
        <div className={styles.container}>
            <div
                ref={trackRef}
                id="image-track"
                className={styles.imageTrack}
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    if (isLast) {
                        // For the last image/video, we want to simulate the Overlay crop.
                        // The Overlay is 100vw x 100vh Fixed centered.
                        // When this card is centered on screen, we want it to show the EXACT corresponding crop of that full image.
                        // We achieve this by putting the full image INSIDE this small card, centered.

                        return (
                            <div
                                key={index}
                                className={styles.image} // Re-use 40vmin x 56vmin size + relative
                                style={{ overflow: 'hidden', position: 'relative' }}
                            >
                                {item.type === 'video' ? (
                                    <video
                                        src={item.src}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        style={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxWidth: 'none', // Override any CSS limits
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={item.src}
                                        draggable="false"
                                        alt={`Slide ${index + 1}`}
                                        style={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxWidth: 'none', // Override any CSS limits
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}
                                {/* Dark overlay for the video/last item */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: 'rgba(0,0,0,0.3)', // Adjust opacity as needed
                                    zIndex: 1
                                }} />
                            </div>
                        );
                    }

                    // Standard cards
                    return renderMedia(item, index);
                })}
            </div>

            {/* Expansion Overlay Element */}
            <div
                ref={overlayRef}
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    overflow: 'hidden' // Ensure clip-path works nicely if needed
                }}
            >
                {/* 
                    Render the last item content again for the full screen overlay 
                */}
                {items[items.length - 1].type === 'video' ? (
                    <video
                        src={items[items.length - 1].src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <img
                        src={items[items.length - 1].src}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
                {/* Dark overlay for expansion as well */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 1
                }} />
            </div>
        </div>
    );
}
