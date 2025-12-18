import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavLinkData {
    label: string;
    href: string;
    scrollTo?: number; // Scroll position in vh for same-page navigation
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    requiresMember?: boolean;
    showWhenLoggedOut?: boolean;
}

// Base navigation links - dynamic links added based on auth state
const BASE_NAV_LINKS: NavLinkData[] = [
    { label: 'About us', href: '#about', scrollTo: 100 },
    { label: 'Meet the Band', href: '#band', scrollTo: 550 },
    { label: 'Join Us', href: '/join' },
];

export function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, userProfile, signInWithGoogle, signOut, loading } = useAuth();

    // Build dynamic nav links based on auth state
    const navLinks: NavLinkData[] = [
        ...BASE_NAV_LINKS,
        // Show Login/Signup when logged out, Dashboard when logged in
        user
            ? { label: 'Dashboard', href: '/dashboard', requiresAuth: true }
            : { label: 'Login / Signup', href: '#login', showWhenLoggedOut: true },
        // Show Band Area for verified members
        ...(userProfile?.verificationStatus === 'member'
            ? [{ label: 'Band Area', href: '/band-area', requiresMember: true }]
            : []),
        // Show Admin for admins
        ...(userProfile?.isAdmin
            ? [{ label: 'Admin', href: '/admin', requiresAdmin: true }]
            : []),
        // Show Logout when logged in
        ...(user
            ? [{ label: 'Logout', href: '#logout', requiresAuth: true }]
            : []),
    ];

    // Smart scroll behavior for portal icon
    const handleScroll = useCallback(() => {
        if (isMenuOpen) {
            ticking.current = false;
            return; // Don't hide when menu is open
        }

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.current;

        // Show navbar when scrolling up, hide when scrolling down
        if (scrollDelta > 5 && currentScrollY > 100) {
            setIsVisible(false);
        } else if (scrollDelta < -5 || currentScrollY < 50) {
            setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
    }, [isMenuOpen]);

    const onScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(handleScroll);
            ticking.current = true;
        }
    }, [handleScroll]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // ESC key to close menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Handle navigation with smooth scroll
    const handleNavClick = async (e: React.MouseEvent<HTMLAnchorElement>, link: NavLinkData) => {
        e.preventDefault();
        closeMenu();

        // Handle login click
        if (link.href === '#login' && !user && !loading) {
            try {
                await signInWithGoogle();
                navigate('/dashboard');
            } catch (error) {
                console.error('Login failed:', error);
            }
            return;
        }

        // Handle logout click
        if (link.href === '#logout' && user) {
            try {
                await signOut();
                navigate('/');
            } catch (error) {
                console.error('Logout failed:', error);
            }
            return;
        }

        // If it's an external route (like /join), navigate to it
        if (link.href.startsWith('/')) {
            navigate(link.href);
            return;
        }

        // If we're not on the home page, navigate there first then scroll
        if (location.pathname !== '/') {
            navigate('/');
            // Wait for navigation then scroll
            setTimeout(() => {
                if (link.scrollTo !== undefined) {
                    window.scrollTo({
                        top: (link.scrollTo / 100) * window.innerHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
            return;
        }

        // Same page scroll
        if (link.scrollTo !== undefined) {
            window.scrollTo({
                top: (link.scrollTo / 100) * window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    // Kinetic link hover effect
    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget;
        const letters = target.querySelectorAll('.letter');
        letters.forEach((letter, i) => {
            (letter as HTMLElement).style.animationDelay = `${i * 0.03}s`;
            letter.classList.add('wave');
        });
    };

    const handleLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget;
        const letters = target.querySelectorAll('.letter');
        letters.forEach((letter) => {
            letter.classList.remove('wave');
        });
    };

    // Split text into letters for kinetic effect
    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className="letter">
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    return (
        <>
            {/* Sticky HEARTBEATS Title - Top Left */}
            <div className={`brand-title ${isVisible ? 'visible' : 'hidden'}`}>
                HEARTBEATS
            </div>

            {/* Portal Icon - Top Right */}
            <button
                className={`portal-icon ${isVisible ? 'visible' : 'hidden'} ${isMenuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
            >
                <div className="portal-ring">
                    <div className="portal-inner">
                        <span className="portal-line"></span>
                        <span className="portal-line"></span>
                        <span className="portal-line"></span>
                    </div>
                </div>
            </button>

            {/* Full-Screen Portal Overlay */}
            <div className={`portal-overlay ${isMenuOpen ? 'open' : ''}`}>
                <nav className="portal-nav">
                    {navLinks.map((link, index) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`portal-link ${link.requiresAdmin ? 'admin-link' : ''} ${link.requiresMember ? 'member-link' : ''} ${link.href === '#logout' ? 'logout-link' : ''}`}
                            style={{ '--delay': `${0.1 + index * 0.08}s` } as React.CSSProperties}
                            onClick={(e) => handleNavClick(e, link)}
                            onMouseEnter={handleLinkHover}
                            onMouseLeave={handleLinkLeave}
                        >
                            {splitText(link.label)}
                        </a>
                    ))}
                </nav>

                {/* Close hint */}
                <div className="portal-close-hint">
                    Click anywhere or press ESC to close
                </div>
            </div>

            {/* Backdrop for closing */}
            {isMenuOpen && (
                <div className="portal-backdrop" onClick={closeMenu} />
            )}
        </>
    );
}
