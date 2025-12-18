import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/UserDashboard.module.css';

export function UserDashboard() {
    const { user, userProfile, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

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
