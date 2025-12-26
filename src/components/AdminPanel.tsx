import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    where,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, type UserProfile } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/AdminPanel.module.css';

type TabType = 'all' | 'pending' | 'applications';

export function AdminPanel() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('applications');
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [isAcceptingApplications, setIsAcceptingApplications] = useState(true);
    const [togglingApplications, setTogglingApplications] = useState(false);

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Redirect if not admin
    useEffect(() => {
        if (!loading && (!user || !userProfile?.isAdmin)) {
            navigate('/');
        }
    }, [user, userProfile, loading, navigate]);

    // Subscribe to applications config
    useEffect(() => {
        if (!userProfile?.isAdmin) return;

        const configRef = doc(db, 'config', 'applications');
        const unsubscribe = onSnapshot(configRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setIsAcceptingApplications(data.isAcceptingApplications ?? true);
            } else {
                setIsAcceptingApplications(true);
            }
        });

        return () => unsubscribe();
    }, [userProfile?.isAdmin]);

    // Toggle applications acceptance
    const handleToggleApplications = async () => {
        if (togglingApplications || !user) return;
        setTogglingApplications(true);

        try {
            const configRef = doc(db, 'config', 'applications');
            const configSnap = await getDoc(configRef);

            if (configSnap.exists()) {
                await updateDoc(configRef, {
                    isAcceptingApplications: !isAcceptingApplications,
                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                });
            } else {
                await setDoc(configRef, {
                    isAcceptingApplications: !isAcceptingApplications,
                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                });
            }
        } catch (error) {
            console.error('Error toggling applications:', error);
            alert('Failed to update application status. Please try again.');
        } finally {
            setTogglingApplications(false);
        }
    };

    // Fetch all users
    useEffect(() => {
        if (!userProfile?.isAdmin) return;

        const usersRef = collection(db, 'users');

        const unsubscribeAll = onSnapshot(query(usersRef), (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data() as UserProfile);
            setAllUsers(users.sort((a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            ));
        });

        const pendingQuery = query(usersRef, where('verificationStatus', '==', 'pending'));
        const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data() as UserProfile);
            setPendingUsers(users.sort((a, b) =>
                (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
            ));
        });

        return () => {
            unsubscribeAll();
            unsubscribePending();
        };
    }, [userProfile?.isAdmin]);

    // Fetch all applications
    useEffect(() => {
        if (!userProfile?.isAdmin) return;

        const applicationsRef = collection(db, 'applications');

        const unsubscribeAll = onSnapshot(query(applicationsRef), (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setApplications(apps.sort((a, b) => {
                const aTime = typeof a.submittedAt === 'object' && 'seconds' in a.submittedAt ? a.submittedAt.seconds : 0;
                const bTime = typeof b.submittedAt === 'object' && 'seconds' in b.submittedAt ? b.submittedAt.seconds : 0;
                return bTime - aTime;
            }));
        });

        const pendingQuery = query(applicationsRef, where('status', '==', 'pending'));
        const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setPendingApplications(apps.sort((a, b) => {
                const aTime = typeof a.submittedAt === 'object' && 'seconds' in a.submittedAt ? a.submittedAt.seconds : 0;
                const bTime = typeof b.submittedAt === 'object' && 'seconds' in b.submittedAt ? b.submittedAt.seconds : 0;
                return bTime - aTime;
            }));
        });

        return () => {
            unsubscribeAll();
            unsubscribePending();
        };
    }, [userProfile?.isAdmin]);

    // Approve user verification
    const handleApprove = async (userId: string) => {
        setProcessingIds(prev => new Set(prev).add(userId));

        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                verificationStatus: 'member',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    // Revoke user verification
    const handleRevoke = async (userId: string) => {
        setProcessingIds(prev => new Set(prev).add(userId));

        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                verificationStatus: 'none',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error revoking user:', error);
            alert('Failed to revoke verification. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    // Decline user verification request
    const handleDecline = async (userId: string) => {
        setProcessingIds(prev => new Set(prev).add(userId));

        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                verificationStatus: 'declined',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error declining user:', error);
            alert('Failed to decline request. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    // Accept application
    const handleAcceptApplication = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'accepted',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error accepting application:', error);
            alert('Failed to accept application. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(applicationId);
                return next;
            });
        }
    };

    // Decline application
    const handleDeclineApplication = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'declined',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error declining application:', error);
            alert('Failed to decline application. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(applicationId);
                return next;
            });
        }
    };

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

    // Not admin
    if (!userProfile?.isAdmin) {
        return null;
    }

    // Get status badge for users
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'member':
                return <span className={`${styles.badge} ${styles.badgeMember}`}>MEMBER</span>;
            case 'pending':
                return <span className={`${styles.badge} ${styles.badgePending}`}>PENDING</span>;
            case 'declined':
                return <span className={`${styles.badge} ${styles.badgeDeclined}`}>DECLINED</span>;
            default:
                return <span className={`${styles.badge} ${styles.badgeNone}`}>NONE</span>;
        }
    };

    // Get application status badge
    const getAppStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <span className={`${styles.badge} ${styles.badgeMember}`}>ACCEPTED</span>;
            case 'declined':
                return <span className={`${styles.badge} ${styles.badgeDeclined}`}>DECLINED</span>;
            default:
                return <span className={`${styles.badge} ${styles.badgePending}`}>PENDING</span>;
        }
    };

    // Get source badge
    const getSourceBadge = (source: string) => {
        return source === 'google_forms'
            ? <span className={`${styles.badge} ${styles.badgeSource}`}>FORMS</span>
            : <span className={`${styles.badge} ${styles.badgeSource}`}>WEB</span>;
    };

    const displayUsers = activeTab === 'all' ? allUsers : pendingUsers;

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
                    <h1 className={styles.title}>ADMIN PANEL</h1>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            <span className={styles.statNumber}>{applications.length}</span> APPLICATIONS
                        </span>
                        <span className={styles.statItem}>
                            <span className={styles.statNumber}>{pendingApplications.length}</span> PENDING
                        </span>
                    </div>
                </div>

                {/* Applications Toggle */}
                <div className={styles.toggleSection}>
                    <span className={styles.toggleLabel}>
                        ACCEPTING APPLICATIONS
                    </span>
                    <button
                        className={`${styles.toggle} ${isAcceptingApplications ? styles.toggleOn : ''}`}
                        onClick={handleToggleApplications}
                        disabled={togglingApplications}
                        aria-label={isAcceptingApplications ? 'Applications are open' : 'Applications are closed'}
                    >
                        <span className={styles.toggleTrack}>
                            <span className={styles.toggleThumb} />
                        </span>
                        <span className={styles.toggleStatus}>
                            {isAcceptingApplications ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'applications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        APPLICATIONS
                        {pendingApplications.length > 0 && (
                            <span className={styles.tabBadge}>{pendingApplications.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        ALL USERS
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        PENDING REQUESTS
                        {pendingUsers.length > 0 && (
                            <span className={styles.tabBadge}>{pendingUsers.length}</span>
                        )}
                    </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'applications' ? (
                    /* Applications List */
                    <div className={styles.userList}>
                        {applications.length === 0 ? (
                            <div className={styles.emptyState}>
                                No applications submitted yet.
                            </div>
                        ) : (
                            applications.map(app => (
                                <div key={app.id} className={styles.userCard}>
                                    <Link to={`/applications/${app.id}`} className={styles.userInfo} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className={styles.userName}>
                                            {app.name}
                                            {getSourceBadge(app.source)}
                                        </div>
                                        <div className={styles.userEmail}>{app.email}</div>
                                        <div className={styles.userOrg}>
                                            {app.rollNo} • {app.field} • {app.year}
                                        </div>
                                    </Link>

                                    <div className={styles.userActions}>
                                        {getAppStatusBadge(app.status)}

                                        {app.status === 'pending' && (
                                            <>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleAcceptApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                >
                                                    {processingIds.has(app.id) ? '...' : 'ACCEPT'}
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDeclineApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                >
                                                    {processingIds.has(app.id) ? '...' : 'DECLINE'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* User List */
                    <div className={styles.userList}>
                        {displayUsers.length === 0 ? (
                            <div className={styles.emptyState}>
                                {activeTab === 'all'
                                    ? 'No users registered yet.'
                                    : 'No pending verification requests.'}
                            </div>
                        ) : (
                            displayUsers.map(userItem => (
                                <div key={userItem.uid} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>
                                            {userItem.name || 'Unnamed User'}
                                            {userItem.isAdmin && (
                                                <span className={styles.adminBadge}>ADMIN</span>
                                            )}
                                        </div>
                                        <div className={styles.userEmail}>{userItem.email}</div>
                                        {userItem.organization && (
                                            <div className={styles.userOrg}>{userItem.organization}</div>
                                        )}
                                    </div>

                                    <div className={styles.userActions}>
                                        {getStatusBadge(userItem.verificationStatus)}

                                        {userItem.verificationStatus === 'pending' && (
                                            <>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleApprove(userItem.uid)}
                                                    disabled={processingIds.has(userItem.uid)}
                                                >
                                                    {processingIds.has(userItem.uid) ? '...' : 'APPROVE'}
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDecline(userItem.uid)}
                                                    disabled={processingIds.has(userItem.uid)}
                                                >
                                                    {processingIds.has(userItem.uid) ? '...' : 'DECLINE'}
                                                </button>
                                            </>
                                        )}

                                        {userItem.verificationStatus === 'member' && !userItem.isAdmin && (
                                            <button
                                                className={styles.revokeButton}
                                                onClick={() => handleRevoke(userItem.uid)}
                                                disabled={processingIds.has(userItem.uid)}
                                            >
                                                {processingIds.has(userItem.uid) ? '...' : 'REVOKE'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
