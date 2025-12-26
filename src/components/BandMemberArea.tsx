import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/BandMemberArea.module.css';

export function BandMemberArea() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Redirect if not a verified member
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/');
                return;
            }
            if (userProfile && userProfile.verificationStatus !== 'member') {
                navigate('/');
            }
        }
    }, [user, userProfile, loading, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    // Not authorized
    if (!userProfile || userProfile.verificationStatus !== 'member') {
        return null;
    }

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            {/* Back Link */}
            <Link to="/dashboard" className={styles.backLink}>
                ← DASHBOARD
            </Link>

            {/* Main Container */}
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.memberBadge}>
                        <span className={styles.badgeIcon}>♪</span>
                        VERIFIED MEMBER
                    </div>
                    <h1 className={styles.title}>BAND AREA</h1>
                    <p className={styles.subtitle}>
                        Welcome back, {userProfile.name || 'fellow musician'}!
                    </p>
                </div>

                {/* Content Cards */}
                <div className={styles.grid}>
                    {/* Applications Card - VIEW INDUCTION APPLICATIONS */}
                    <Link to="/applications" className={`${styles.card} ${styles.cardLink}`}>
                        <div className={styles.cardIcon}>📋</div>
                        <h2 className={styles.cardTitle}>APPLICATIONS</h2>
                        <p className={styles.cardText}>
                            View induction applications and check applicant details.
                        </p>
                        <div className={styles.cardAction}>VIEW APPLICATIONS →</div>
                    </Link>

                    {/* Chat Card - BAND CHAT */}
                    <Link to="/chat" className={`${styles.card} ${styles.cardLink}`}>
                        <div className={styles.cardIcon}>💬</div>
                        <h2 className={styles.cardTitle}>BAND CHAT</h2>
                        <p className={styles.cardText}>
                            Chat with other band members in real-time.
                        </p>
                        <div className={styles.cardAction}>OPEN CHAT →</div>
                    </Link>

                    {/* Members Card - VIEW BAND MEMBERS */}
                    <Link to="/members" className={`${styles.card} ${styles.cardLink}`}>
                        <div className={styles.cardIcon}>👥</div>
                        <h2 className={styles.cardTitle}>MEMBERS</h2>
                        <p className={styles.cardText}>
                            View all band members and their details.
                        </p>
                        <div className={styles.cardAction}>VIEW MEMBERS →</div>
                    </Link>

                    {/* Announcements Card */}
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📢</div>
                        <h2 className={styles.cardTitle}>ANNOUNCEMENTS</h2>
                        <p className={styles.cardText}>
                            Stay updated with the latest band news, rehearsal schedules, and upcoming events.
                        </p>
                        <div className={styles.placeholder}>Coming Soon</div>
                    </div>

                    {/* Resources Card */}
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🎵</div>
                        <h2 className={styles.cardTitle}>RESOURCES</h2>
                        <p className={styles.cardText}>
                            Access sheet music, backing tracks, setlists, and other band resources.
                        </p>
                        <div className={styles.placeholder}>Coming Soon</div>
                    </div>

                    {/* Practice Room Card */}
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🎸</div>
                        <h2 className={styles.cardTitle}>PRACTICE ROOM</h2>
                        <p className={styles.cardText}>
                            Book practice slots, view the equipment list, and coordinate with other members.
                        </p>
                        <div className={styles.placeholder}>Coming Soon</div>
                    </div>

                    {/* Events Card */}
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🎤</div>
                        <h2 className={styles.cardTitle}>EVENTS</h2>
                        <p className={styles.cardText}>
                            View upcoming gigs, performances, and band events calendar.
                        </p>
                        <div className={styles.placeholder}>Coming Soon</div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        More features are being developed. Stay tuned! 🎶
                    </p>
                </div>
            </div>
        </div>
    );
}
