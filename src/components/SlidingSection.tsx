import { useEffect, useRef, useState } from 'react';
import styles from '../styles/SlidingSection.module.css';

type MediaItem = {
    type: 'image' | 'video' | 'youtube';
    src: string;
};

// YouTube video IDs
const DESKTOP_YOUTUBE_VIDEO_ID = 'UlrCaozEmAE'; // Desktop video
const MOBILE_YOUTUBE_VIDEO_ID = 'xL_fPN8I1d8';  // Mobile Shorts video

// Lazy YouTube Component - Shows thumbnail first, loads iframe only when needed
interface LazyYouTubeProps {
    videoId: string;
    shouldLoad: boolean;
    style?: React.CSSProperties;
    className?: string;
}

function LazyYouTube({ videoId, shouldLoad, style, className }: LazyYouTubeProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Load iframe when shouldLoad becomes true OR user clicks
    const showIframe = isLoaded || shouldLoad || hasInteracted;

    // YouTube thumbnail URL (maxresdefault is highest quality)
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    // Fallback to hqdefault if maxres doesn't exist
    const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    if (!showIframe) {
        return (
            <div
                className={className}
                style={{
                    ...style,
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => setHasInteracted(true)}
            >
                {/* Thumbnail Image */}
                <img
                    src={thumbnailUrl}
                    onError={(e) => {
                        // Fallback if maxresdefault doesn't exist
                        (e.target as HTMLImageElement).src = fallbackUrl;
                    }}
                    alt="Video thumbnail"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    loading="lazy"
                />
                {/* Play Button Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 0, 0, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
                        transition: 'transform 0.3s ease'
                    }}>
                        {/* Play triangle */}
                        <div style={{
                            width: 0,
                            height: 0,
                            borderTop: '15px solid transparent',
                            borderBottom: '15px solid transparent',
                            borderLeft: '25px solid white',
                            marginLeft: '5px'
                        }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={className}
            style={style}
            onLoad={() => setIsLoaded(true)}
        />
    );
}

// Hook to detect mobile device
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768;
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

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

const items: MediaItem[] = [
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/DSC04664_tixqnw.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637617/DSC_1292_gmhvgy.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637617/DSC_1311_jkmpfp.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/DSC_1361_ekaqvi.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/MIL_2765_s9amdw.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/MIL_2899_zaym3l.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/RSV-0497_e1njlo.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637618/RSV-0636_vpn5ko.jpg" },
    { type: 'image', src: "https://res.cloudinary.com/dkzmumdp2/image/upload/f_auto,q_auto/v1766637617/IMG_1768_2_yd4uxj.jpg" },
    // Last item will be dynamically set to mobile or desktop video
];

interface SlidingSectionProps {
    scrollProgress: number; // 0 to 1 (Scrolls through images)
    expansionProgress: number; // 0 to 1 (Expands last image)
}

export function SlidingSection({ scrollProgress, expansionProgress }: SlidingSectionProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // Choose video based on device
    const currentVideoId = isMobile ? MOBILE_YOUTUBE_VIDEO_ID : DESKTOP_YOUTUBE_VIDEO_ID;

    // Build items array with appropriate video
    const mediaItems = [...items, { type: 'youtube' as const, src: currentVideoId }];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        // Horizontal Scroll Logic
        // We want to scroll such that at scrollProgress = 1, the LAST image is centered.
        // We need to match the CSS dimensions:

        let itemWidthVmin = 40;
        let gapVmin = 4;

        // Check CSS breakpoints
        const vw = window.innerWidth;
        if (vw <= 480) {
            itemWidthVmin = 70;
            gapVmin = 2.5;
        } else if (vw <= 768) {
            itemWidthVmin = 60;
            gapVmin = 3;
        }

        const strideVmin = itemWidthVmin + gapVmin;
        const initialCenterOffsetVmin = itemWidthVmin / 2;

        // Position of Center of Last Image from start of track:
        // (N-1) * (Stride) + (InitialOffset)
        const travelDistanceVmin = (mediaItems.length - 1) * strideVmin;

        // Current position to center at 50vw:
        // We need to shift the track LEFT by [CurrentCenterPos].
        const currentVminOffset = initialCenterOffsetVmin + travelDistanceVmin * scrollProgress;

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

        if (item.type === 'video') {
            return (
                <video
                    key={index}
                    src={item.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={!isOverlay ? styles.image : undefined}
                    style={commonStyle}
                />
            );
        }

        return (
            <img
                key={index}
                src={item.src}
                alt={`Slide ${index + 1}`}
                width={800}
                height={1120}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={!isOverlay ? styles.image : undefined}
                style={commonStyle}
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
                {mediaItems.map((item, index) => {
                    const isLast = index === mediaItems.length - 1;
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
                                {item.type === 'youtube' ? (
                                    <LazyYouTube
                                        videoId={item.src}
                                        shouldLoad={expansionProgress > 0.1}
                                        style={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxWidth: 'none',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            border: 'none',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                ) : item.type === 'video' ? (
                                    <video
                                        src={item.src}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        style={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxWidth: 'none',
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
                                        loading="lazy"
                                        decoding="async"
                                        style={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxWidth: 'none',
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
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    zIndex: 1,
                                    pointerEvents: 'none'
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
                {mediaItems[mediaItems.length - 1].type === 'youtube' ? (
                    <LazyYouTube
                        videoId={mediaItems[mediaItems.length - 1].src}
                        // Only load when expansion has started to show thumbnail first
                        shouldLoad={expansionProgress > 0.1}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            pointerEvents: 'none'
                        }}
                    />
                ) : mediaItems[mediaItems.length - 1].type === 'video' ? (
                    <video
                        src={mediaItems[mediaItems.length - 1].src}
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
                        src={mediaItems[mediaItems.length - 1].src}
                        loading="lazy"
                        decoding="async"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
                {/* Dark overlay for expansion - increased for text visibility */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                {/* "Who Are We" Text Overlay - Fades in at 60% expansion */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    paddingTop: '15vh',
                    paddingLeft: '10vw',
                    paddingRight: '10vw',
                    opacity: expansionProgress >= 0.6 ? 1 : 0,
                    transition: 'opacity 0.8s ease-in',
                    pointerEvents: 'none'
                }}>
                    <h2 style={{
                        fontFamily: '"Helvetica Neue", "Helvetica", Arial, sans-serif',
                        fontWeight: 800,
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        color: '#ffffff',
                        margin: '0 0 1.5rem 0',
                        textAlign: 'left',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                    }}>
                        Who Are We
                    </h2>
                    <p style={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 400,
                        fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '700px',
                        textAlign: 'left',
                        lineHeight: 1.6,
                        margin: 0,
                        letterSpacing: 'normal'
                    }}>
                        The official Music Fusion Band of NIT Rourkela, blending diverse rhythms and melodies to create unforgettable performances that resonate with every soul.
                    </p>
                </div>
            </div>
        </div>
    );
}
