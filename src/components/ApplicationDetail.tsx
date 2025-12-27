import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, onSnapshot, setDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/ApplicationDetail.module.css';

interface Vote {
    odUserId: string;
    vote: 'for' | 'against';
    votedBy: string;
    votedByName: string;
    votedAt: Date;
}

interface Remark {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

export function ApplicationDetail() {
    const { id } = useParams<{ id: string }>();
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Voting state
    const [myVote, setMyVote] = useState<'for' | 'against' | null>(null);
    const [allVotes, setAllVotes] = useState<Vote[]>([]);
    const [isVoting, setIsVoting] = useState(false);

    // Remarks state
    const [remarks, setRemarks] = useState<Remark[]>([]);
    const [newRemark, setNewRemark] = useState('');
    const [isAddingRemark, setIsAddingRemark] = useState(false);

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Check access
    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            navigate('/');
        }
        if (!loading && userProfile && !userProfile.isAdmin && userProfile.verificationStatus !== 'member') {
            navigate('/dashboard');
        }
    }, [user, userProfile, loading, navigate]);

    // Fetch application
    useEffect(() => {
        if (!id || !userProfile) return;

        const fetchApplication = async () => {
            try {
                const docRef = doc(db, 'applications', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setApplication({ id: docSnap.id, ...docSnap.data() } as Application);
                } else {
                    setApplication(null);
                }
            } catch (error) {
                console.error('Error fetching application:', error);
                setApplication(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplication();
    }, [id, userProfile]);

    // Subscribe to my vote
    useEffect(() => {
        if (!id || !user || !userProfile || userProfile.verificationStatus !== 'member') return;

        const voteRef = doc(db, 'applications', id, 'votes', user.uid);
        const unsubscribe = onSnapshot(voteRef, (snapshot) => {
            if (snapshot.exists()) {
                setMyVote(snapshot.data().vote);
            } else {
                setMyVote(null);
            }
        });
        return () => unsubscribe();
    }, [id, user, userProfile]);

    // Subscribe to all votes (admin only)
    useEffect(() => {
        if (!id || !userProfile?.isAdmin) return;

        const votesRef = collection(db, 'applications', id, 'votes');
        const unsubscribe = onSnapshot(votesRef, (snapshot) => {
            const votes = snapshot.docs.map(doc => ({ odUserId: doc.id, ...doc.data() } as Vote));
            setAllVotes(votes);
        });
        return () => unsubscribe();
    }, [id, userProfile]);

    // Subscribe to remarks
    useEffect(() => {
        if (!id || !userProfile) return;

        const remarksRef = collection(db, 'applications', id, 'remarks');
        const remarksQuery = query(remarksRef, orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(remarksQuery, (snapshot) => {
            const r = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Remark));
            setRemarks(r);
        });
        return () => unsubscribe();
    }, [id, userProfile]);

    // Cast vote
    const handleVote = async (vote: 'for' | 'against') => {
        if (!id || !user || !userProfile || isVoting) return;

        setIsVoting(true);
        try {
            const voteRef = doc(db, 'applications', id, 'votes', user.uid);
            await setDoc(voteRef, {
                vote,
                votedBy: user.uid,
                votedByName: userProfile.name || user.email || 'Unknown',
                votedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        } finally {
            setIsVoting(false);
        }
    };

    // Add remark
    const handleAddRemark = async () => {
        if (!id || !user || !userProfile || !newRemark.trim() || isAddingRemark) return;

        setIsAddingRemark(true);
        try {
            const remarksRef = collection(db, 'applications', id, 'remarks');
            await addDoc(remarksRef, {
                text: newRemark.trim(),
                authorId: user.uid,
                authorName: userProfile.name || user.email || 'Unknown',
                createdAt: serverTimestamp()
            });
            setNewRemark('');
        } catch (error) {
            console.error('Error adding remark:', error);
            alert('Failed to add remark. Please try again.');
        } finally {
            setIsAddingRemark(false);
        }
    };

    // Delete remark (admin only)
    const handleDeleteRemark = async (remarkId: string) => {
        if (!id || !userProfile?.isAdmin) return;
        try {
            await deleteDoc(doc(db, 'applications', id, 'remarks', remarkId));
        } catch (error) {
            console.error('Error deleting remark:', error);
        }
    };

    // Update status (admin only)
    const handleStatusChange = async (newStatus: 'pending' | 'accepted' | 'declined') => {
        if (!id || !userProfile?.isAdmin || isUpdating) return;

        setIsUpdating(true);
        try {
            const docRef = doc(db, 'applications', id);
            await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
            setApplication(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Vote counts (admin only)
    const votesFor = allVotes.filter(v => v.vote === 'for').length;
    const votesAgainst = allVotes.filter(v => v.vote === 'against').length;

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <span className={`${styles.badge} ${styles.badgeAccepted}`}>✓ ACCEPTED</span>;
            case 'declined': return <span className={`${styles.badge} ${styles.badgeDeclined}`}>✗ DECLINED</span>;
            case 'round2_selected': return <span className={`${styles.badge}`} style={{ background: 'rgba(64, 123, 255, 0.15)', color: '#407bff', border: '1px solid rgba(64, 123, 255, 0.3)' }}>ROUND 2</span>;
            default: return <span className={`${styles.badge} ${styles.badgePending}`}>⏳ PENDING</span>;
        }
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

    if (!application) {
        return (
            <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
                <Link to="/applications" className={styles.backLink}>← BACK</Link>
                <div className={styles.container}>
                    <div className={styles.notFound}>
                        <h1>APPLICATION NOT FOUND</h1>
                        <p>The application you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            <Link to={userProfile?.isAdmin ? '/admin' : '/applications'} className={styles.backLink}>
                ← BACK
            </Link>

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{application.name}</h1>
                    <div className={styles.headerMeta}>
                        {getStatusBadge(application.status)}
                        <span className={styles.source}>
                            {application.source === 'google_forms' ? 'GOOGLE FORMS' : 'WEBSITE'}
                        </span>
                    </div>
                </div>

                {/* Admin Actions */}
                {userProfile?.isAdmin && (
                    <div className={styles.actions}>
                        <button className={`${styles.actionButton} ${styles.acceptButton} ${application.status === 'accepted' ? styles.active : ''}`} onClick={() => handleStatusChange('accepted')} disabled={isUpdating}>
                            {isUpdating ? '...' : 'ACCEPT'}
                        </button>
                        <button className={`${styles.actionButton} ${styles.pendingButton} ${application.status === 'pending' ? styles.active : ''}`} onClick={() => handleStatusChange('pending')} disabled={isUpdating}>
                            {isUpdating ? '...' : 'PENDING'}
                        </button>
                        <button className={`${styles.actionButton} ${styles.declineButton} ${application.status === 'declined' ? styles.active : ''}`} onClick={() => handleStatusChange('declined')} disabled={isUpdating}>
                            {isUpdating ? '...' : 'DECLINE'}
                        </button>
                    </div>
                )}

                {/* Voting Section */}
                <div className={styles.votingSection}>
                    <h2 className={styles.sectionTitle}>VOTE</h2>
                    <div className={styles.voteButtons}>
                        <button
                            className={`${styles.voteButton} ${styles.voteFor} ${myVote === 'for' ? styles.voteActive : ''}`}
                            onClick={() => handleVote('for')}
                            disabled={isVoting}
                        >
                            👍 FOR
                        </button>
                        <button
                            className={`${styles.voteButton} ${styles.voteAgainst} ${myVote === 'against' ? styles.voteActive : ''}`}
                            onClick={() => handleVote('against')}
                            disabled={isVoting}
                        >
                            👎 AGAINST
                        </button>
                    </div>
                    {myVote && <p className={styles.voteStatus}>You voted: <strong>{myVote.toUpperCase()}</strong></p>}

                    {/* Admin sees vote tally */}
                    {userProfile?.isAdmin && (
                        <div className={styles.voteTally}>
                            <span className={styles.tallyFor}>FOR: {votesFor}</span>
                            <span className={styles.tallyAgainst}>AGAINST: {votesAgainst}</span>
                            <span className={styles.tallyTotal}>TOTAL: {allVotes.length}</span>
                        </div>
                    )}
                </div>

                {/* Details Grid */}
                <div className={styles.details}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>CONTACT INFO</h2>
                        <div className={styles.grid}>
                            <div className={styles.field}><span className={styles.label}>EMAIL</span><span className={styles.value}>{application.email}</span></div>
                            <div className={styles.field}><span className={styles.label}>ROLL NUMBER</span><span className={styles.value}>{application.rollNo}</span></div>
                            {application.phone && <div className={styles.field}><span className={styles.label}>PHONE</span><span className={styles.value}>{application.phone}</span></div>}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>ACADEMICS</h2>
                        <div className={styles.grid}>
                            <div className={styles.field}><span className={styles.label}>DEPARTMENT</span><span className={styles.value}>{application.department || '—'}</span></div>
                            <div className={styles.field}><span className={styles.label}>YEAR</span><span className={styles.value}>{application.year || '—'}</span></div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>MUSICAL PROFILE</h2>
                        <div className={styles.grid}>
                            <div className={styles.field}><span className={styles.label}>PRIMARY INSTRUMENT</span><span className={styles.value}>{application.field || '—'}</span></div>
                            {application.otherField && <div className={styles.field}><span className={styles.label}>OTHER</span><span className={styles.value}>{application.otherField}</span></div>}
                            {application.musicalStyles && <div className={styles.field}><span className={styles.label}>MUSICAL STYLES</span><span className={styles.value}>{application.musicalStyles}</span></div>}
                            {application.yearsExperience && <div className={styles.field}><span className={styles.label}>YEARS OF EXPERIENCE</span><span className={styles.value}>{application.yearsExperience}</span></div>}
                            {application.musicalInfluences && <div className={styles.field}><span className={styles.label}>TOP 3 INFLUENCES</span><span className={styles.value}>{application.musicalInfluences}</span></div>}
                        </div>
                    </div>

                    {application.experience && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>EXPERIENCE</h2>
                            <p className={styles.textContent}>{application.experience}</p>
                        </div>
                    )}

                    {application.videoLink && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>AUDITION VIDEO</h2>
                            <a href={application.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                WATCH VIDEO →
                            </a>
                        </div>
                    )}
                </div>

                {/* Round 2 Task - Visible to Members & Admins */}
                {application.status === 'round2_selected' && application.round2Task && (
                    <div className={styles.taskSection}>
                        <div className={styles.taskHeader}>
                            <h2 className={styles.taskTitle}>ROUND 2 TASK: {application.round2Task.title}</h2>
                            <span className={styles.taskMeta}>
                                Assigned: {application.round2Task.assignedAt ? new Date((application.round2Task.assignedAt as any).seconds * 1000).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                        <p className={styles.taskDesc} dangerouslySetInnerHTML={{
                            __html: application.round2Task.description.replace(/\n/g, '<br/>')
                        }} />
                    </div>
                )}

                {/* Remarks Section - at the end */}
                <div className={styles.remarksSection}>
                    <h2 className={styles.sectionTitle}>REMARKS</h2>

                    {/* Add Remark */}
                    <div className={styles.addRemark}>
                        <input
                            type="text"
                            className={styles.remarkInput}
                            placeholder="Add a remark..."
                            value={newRemark}
                            onChange={(e) => setNewRemark(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                        />
                        <button
                            className={styles.addRemarkButton}
                            onClick={handleAddRemark}
                            disabled={isAddingRemark || !newRemark.trim()}
                        >
                            {isAddingRemark ? '...' : 'ADD'}
                        </button>
                    </div>

                    {/* Remarks List */}
                    <div className={styles.remarksList}>
                        {remarks.length === 0 ? (
                            <p className={styles.noRemarks}>No remarks yet.</p>
                        ) : (
                            remarks.map(remark => (
                                <div key={remark.id} className={styles.remarkItem}>
                                    <div className={styles.remarkHeader}>
                                        <span className={styles.remarkAuthor}>{remark.authorName}</span>
                                        {userProfile?.isAdmin && (
                                            <button className={styles.deleteRemark} onClick={() => handleDeleteRemark(remark.id)}>✕</button>
                                        )}
                                    </div>
                                    <p className={styles.remarkText}>{remark.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
