import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/UserDashboard.module.css';

export function UserDashboard() {
    const { user, userProfile, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Application state
    const [myApplication, setMyApplication] = useState<Application | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        organization: '',
        musicalInterests: '',
        topSongs: ['', '', ''],
    });

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // Populate form with user profile data
    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                organization: userProfile.organization || '',
                musicalInterests: userProfile.musicalInterests || '',
                topSongs: userProfile.topSongs?.length === 3
                    ? userProfile.topSongs
                    : ['', '', ''],
            });
        }
    }, [userProfile]);

    // Fetch user's application
    useEffect(() => {
        if (!user) return;

        const appsRef = collection(db, 'applications');
        const q = query(appsRef, where('email', '==', user.email));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setMyApplication({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Application);
            } else {
                setMyApplication(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Handle input change
    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle top songs change
    const handleSongChange = (index: number, value: string) => {
        setFormData(prev => {
            const newSongs = [...prev.topSongs];
            newSongs[index] = value;
            return { ...prev, topSongs: newSongs };
        });
    };

    // Save profile changes
    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                ...formData,
                updatedAt: serverTimestamp(),
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Request band member verification
    const handleVerificationRequest = async () => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                verificationStatus: 'pending',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error requesting verification:', error);
            alert('Failed to request verification. Please try again.');
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
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

    // Get verification status display
    const getVerificationBadge = () => {
        switch (userProfile?.verificationStatus) {
            case 'member':
                return <span className={`${styles.badge} ${styles.badgeMember}`}>✓ VERIFIED MEMBER</span>;
            case 'pending':
                return <span className={`${styles.badge} ${styles.badgePending}`}>⏳ PENDING VERIFICATION</span>;
            case 'declined':
                return <span className={`${styles.badge} ${styles.badgeDeclined}`}>✗ REQUEST DECLINED</span>;
            default:
                return <span className={`${styles.badge} ${styles.badgeNone}`}>NOT VERIFIED</span>;
        }
    };

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            {/* Back Link */}
            <Link to="/" className={styles.backLink}>
                ← BACK
            </Link>

            {/* Main Container */}
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>DASHBOARD</h1>
                    <div className={styles.userInfo}>
                        <span className={styles.email}>{user?.email}</span>
                        {getVerificationBadge()}
                    </div>
                </div>

                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>YOUR PROFILE</h2>
                        {!isEditing ? (
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditing(true)}
                            >
                                EDIT
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    CANCEL
                                </button>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'SAVING...' : 'SAVE'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.fields}>
                        {/* Name */}
                        <div className={styles.field}>
                            <label className={styles.label}>NAME</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            ) : (
                                <span className={styles.value}>{formData.name || '—'}</span>
                            )}
                        </div>

                        {/* Organization */}
                        <div className={styles.field}>
                            <label className={styles.label}>ORGANIZATION</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.organization}
                                    onChange={(e) => handleChange('organization', e.target.value)}
                                    placeholder="e.g., NIT Rourkela"
                                />
                            ) : (
                                <span className={styles.value}>{formData.organization || '—'}</span>
                            )}
                        </div>

                        {/* Musical Interests */}
                        <div className={styles.field}>
                            <label className={styles.label}>MUSICAL INTERESTS</label>
                            {isEditing ? (
                                <textarea
                                    className={styles.textarea}
                                    value={formData.musicalInterests}
                                    onChange={(e) => handleChange('musicalInterests', e.target.value)}
                                    placeholder="Describe your musical interests..."
                                    rows={3}
                                />
                            ) : (
                                <span className={styles.value}>{formData.musicalInterests || '—'}</span>
                            )}
                        </div>

                        {/* Top 3 Songs */}
                        <div className={styles.field}>
                            <label className={styles.label}>TOP 3 SONGS</label>
                            {isEditing ? (
                                <div className={styles.songsList}>
                                    {formData.topSongs.map((song, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            className={styles.input}
                                            value={song}
                                            onChange={(e) => handleSongChange(index, e.target.value)}
                                            placeholder={`Song ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.songsList}>
                                    {formData.topSongs.map((song, index) => (
                                        <span key={index} className={styles.songItem}>
                                            {index + 1}. {song || '—'}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Status Card */}
                {myApplication && (
                    <div className={styles.verificationCard} style={{ marginBottom: '20px', borderColor: 'rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
                        <h3 className={styles.verificationTitle} style={{ color: '#60a5fa' }}>HEARTBEATS INDUCTION 2024</h3>
                        <div style={{ margin: '1rem 0' }}>
                            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', marginBottom: '0.5rem' }}>
                                {myApplication.status === 'round3_selected' ? 'FINAL ROUND' :
                                    myApplication.status === 'round2_selected' ? 'APPLICATION UPDATE' :
                                        myApplication.status === 'round1_cleared' ? 'ROUND 1 CLEARED' :
                                            myApplication.status === 'accepted' ? 'ACCEPTED' :
                                                myApplication.status.toUpperCase()}
                            </div>
                            <p className={styles.verificationText}>
                                {myApplication.status === 'pending' && 'Your application is currently under review.'}
                                {myApplication.status === 'round1_cleared' && 'You have cleared Round 1! Please wait for further instructions via WhatsApp/Email.'}
                                {myApplication.status === 'round2_selected' && 'Update on your application. Check the Join Us page for details.'}
                                {myApplication.status === 'round3_selected' && 'You have been selected for the Final Round! Check the Join Us page for details.'}
                                {myApplication.status === 'accepted' && 'Welcome to the family! You are now a member of HeartBeats.'}
                                {myApplication.status === 'declined' && 'Thank you for your interest. Unfortunately, you were not selected this time. Try again next time.. Good luck!'}
                            </p>
                        </div>
                        <Link to="/join-us" className={styles.verifyButton} style={{ display: 'inline-block', textDecoration: 'none', background: '#2563eb', border: 'none' }}>
                            VIEW APPLICATION DETAILS →
                        </Link>
                    </div>
                )}

                {/* Verification Section */}
                {userProfile?.verificationStatus === 'none' && (
                    <div className={styles.verificationCard}>
                        <h3 className={styles.verificationTitle}>BAND MEMBER VERIFICATION</h3>
                        <p className={styles.verificationText}>
                            Are you a member of HeartBeats? Request verification to access exclusive band member features.
                        </p>
                        <button
                            className={styles.verifyButton}
                            onClick={handleVerificationRequest}
                        >
                            VERIFY AS BAND MEMBER →
                        </button>
                    </div>
                )}

                {/* Declined Message */}
                {userProfile?.verificationStatus === 'declined' && (
                    <div className={styles.declinedCard}>
                        <div className={styles.declinedIcon}>✗</div>
                        <h3 className={styles.declinedTitle}>VERIFICATION REQUEST DECLINED</h3>
                        <p className={styles.declinedText}>
                            Unfortunately, your request to be verified as a band member has been declined.
                            This could be because we couldn't verify your membership or the information provided was insufficient.
                        </p>
                        <p className={styles.declinedSubtext}>
                            If you believe this was a mistake, please contact the band administration or try applying again with updated information.
                        </p>
                        <button
                            className={styles.reapplyButton}
                            onClick={handleVerificationRequest}
                        >
                            REAPPLY FOR VERIFICATION →
                        </button>
                    </div>
                )}

                {/* Band Area Link for Members */}
                {userProfile?.verificationStatus === 'member' && (
                    <Link to="/band-area" className={styles.bandAreaLink}>
                        ACCESS BAND MEMBER AREA →
                    </Link>
                )}

                {/* Admin Link */}
                {userProfile?.isAdmin && (
                    <Link to="/admin" className={styles.adminLink}>
                        ADMIN PANEL →
                    </Link>
                )}

                {/* Sign Out */}
                <button
                    className={styles.signOutButton}
                    onClick={handleSignOut}
                >
                    SIGN OUT
                </button>
            </div>
        </div>
    );
}
