import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/ApplicationsList.module.css';

export function ApplicationsList() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Check access - must be admin or verified member
    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            navigate('/');
        }
        if (!loading && userProfile && !userProfile.isAdmin && userProfile.verificationStatus !== 'member') {
            navigate('/dashboard');
        }
    }, [user, userProfile, loading, navigate]);

    // Fetch applications
    useEffect(() => {
        if (!userProfile || (!userProfile.isAdmin && userProfile.verificationStatus !== 'member')) {
            return;
        }

        const applicationsRef = collection(db, 'applications');
        const unsubscribe = onSnapshot(query(applicationsRef), (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            // Sort by submission time (newest first)
            apps.sort((a, b) => {
                const aTime = typeof a.submittedAt === 'object' && 'seconds' in a.submittedAt ? a.submittedAt.seconds : 0;
                const bTime = typeof b.submittedAt === 'object' && 'seconds' in b.submittedAt ? b.submittedAt.seconds : 0;
                return bTime - aTime;
            });
            setApplications(apps);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching applications:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <span className={`${styles.badge} ${styles.badgeAccepted}`}>ACCEPTED</span>;
            case 'declined':
                return <span className={`${styles.badge} ${styles.badgeDeclined}`}>DECLINED</span>;
            default:
                return <span className={`${styles.badge} ${styles.badgePending}`}>PENDING</span>;
        }
    };

    // Filter applications
    const filteredApps = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    // Count by status
    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        declined: applications.filter(a => a.status === 'declined').length
    };

    if (loading || isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            <Link to="/band-area" className={styles.backLink}>← BAND AREA</Link>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>APPLICATIONS</h1>
                    <div className={styles.stats}>
                        <span className={styles.stat}>{counts.all} TOTAL</span>
                        <span className={styles.stat}>{counts.pending} PENDING</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className={styles.tabs}>
                    {(['all', 'pending', 'accepted', 'declined'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${filter === tab ? styles.active : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab.toUpperCase()}
                            <span className={styles.tabCount}>{counts[tab]}</span>
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                <div className={styles.list}>
                    {filteredApps.length === 0 ? (
                        <div className={styles.empty}>No applications found.</div>
                    ) : (
                        filteredApps.map(app => (
                            <Link
                                key={app.id}
                                to={`/applications/${app.id}`}
                                className={styles.card}
                            >
                                <div className={styles.cardMain}>
                                    <span className={styles.cardName}>{app.name}</span>
                                    <span className={styles.cardMeta}>
                                        {app.rollNo} • {app.field} • {app.year}
                                    </span>
                                </div>
                                <div className={styles.cardRight}>
                                    {getStatusBadge(app.status)}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
