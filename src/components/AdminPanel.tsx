import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, type UserProfile } from '../context/AuthContext';
import styles from '../styles/AdminPanel.module.css';

type TabType = 'all' | 'pending';

export function AdminPanel() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

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

    // Fetch all users
    useEffect(() => {
        if (!userProfile?.isAdmin) return;

        const usersRef = collection(db, 'users');

        // Subscribe to all users
        const unsubscribeAll = onSnapshot(query(usersRef), (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data() as UserProfile);
            setAllUsers(users.sort((a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            ));
        });

        // Subscribe to pending users
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

    // Get status badge
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
                            <span className={styles.statNumber}>{allUsers.length}</span> USERS
                        </span>
                        <span className={styles.statItem}>
                            <span className={styles.statNumber}>{pendingUsers.length}</span> PENDING
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
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

                {/* User List */}
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
            </div>
        </div>
    );
}
