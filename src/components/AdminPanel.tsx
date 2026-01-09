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
    setDoc,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, type UserProfile } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/AdminPanel.module.css';

type TabType = 'all' | 'pending' | 'pending_apps' | 'round2' | 'round3' | 'rejected' | 'all_apps';

export function AdminPanel() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('pending_apps');
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
    const [round2Applications, setRound2Applications] = useState<Application[]>([]);
    const [round3Applications, setRound3Applications] = useState<Application[]>([]);
    const [rejectedApplications, setRejectedApplications] = useState<Application[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [isAcceptingApplications, setIsAcceptingApplications] = useState(true);
    const [togglingApplications, setTogglingApplications] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(true);
    const [togglingChat, setTogglingChat] = useState(false);

    // Selection & Assignment State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [sendEmail, setSendEmail] = useState(true);
    const [assignTarget, setAssignTarget] = useState<'round2' | 'round3'>('round2');
    const [isAssigning, setIsAssigning] = useState(false);

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

        // Chat config
        const chatConfigRef = doc(db, 'config', 'chat');
        const unsubscribeChat = onSnapshot(chatConfigRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setIsChatEnabled(data.isChatEnabled ?? true);
            } else {
                setIsChatEnabled(true);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeChat();
        };
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

    // Toggle chat
    const handleToggleChat = async () => {
        if (togglingChat || !user) return;
        setTogglingChat(true);

        try {
            const configRef = doc(db, 'config', 'chat');
            const configSnap = await getDoc(configRef);

            if (configSnap.exists()) {
                await updateDoc(configRef, {
                    isChatEnabled: !isChatEnabled,
                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                });
            } else {
                await setDoc(configRef, {
                    isChatEnabled: !isChatEnabled,
                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                });
            }
        } catch (error) {
            console.error('Error toggling chat:', error);
            alert('Failed to update chat status. Please try again.');
        } finally {
            setTogglingChat(false);
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

        const pendingAppsQuery = query(applicationsRef, where('status', '==', 'pending'));
        const unsubscribePending = onSnapshot(pendingAppsQuery, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setPendingApplications(apps.sort((a, b) => {
                const aTime = typeof a.submittedAt === 'object' && 'seconds' in a.submittedAt ? (a.submittedAt as any).seconds : 0;
                const bTime = typeof b.submittedAt === 'object' && 'seconds' in b.submittedAt ? (b.submittedAt as any).seconds : 0;
                return bTime - aTime;
            }));
        });

        // Round 2 (Includes Round 2 Selected AND Round 1 Cleared)
        const r2Query = query(applicationsRef, where('status', 'in', ['round2_selected', 'round1_cleared']));
        const unsubscribeR2 = onSnapshot(r2Query, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setRound2Applications(apps.sort((a, b) => (b.updatedAt as any)?.seconds - (a.updatedAt as any)?.seconds));
        });

        // Round 3
        const r3Query = query(applicationsRef, where('status', '==', 'round3_selected'));
        const unsubscribeR3 = onSnapshot(r3Query, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setRound3Applications(apps.sort((a, b) => (b.updatedAt as any)?.seconds - (a.updatedAt as any)?.seconds));
        });

        // Rejected
        const rejectedQuery = query(applicationsRef, where('status', '==', 'declined'));
        const unsubscribeRejected = onSnapshot(rejectedQuery, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setRejectedApplications(apps.sort((a, b) => (b.updatedAt as any)?.seconds - (a.updatedAt as any)?.seconds));
        });

        return () => {
            unsubscribeAll();
            unsubscribePending();
            unsubscribeR2();
            unsubscribeR3();
            unsubscribeRejected();
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

    // Clear Round 1 (Restore from Rejected or Promote)
    const handleClearRound1 = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'round1_cleared',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error clearing Round 1:', error);
            alert('Failed to update application. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(applicationId);
                return next;
            });
        }
    };

    // Accept application (Round 1 Cleared) - UPDATED: Now Moves to Round 2 directly if that is the flow, 
    // BUT user asked for "From round 1 -> 3 outcomes". 
    // The UI now has specific buttons for R2/R3. The "Accept" button logic in the card was replaced by specific buttons.
    // However, we still need these functions.

    const handleAcceptApplication = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'round2_selected',
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

    const handleMoveToRound3 = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'round3_selected',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error moving to Round 3:', error);
            alert('Failed to move to Round 3. Please try again.');
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

    // Revert to Pending (Un-reject)
    const handleRevertToPending = async (applicationId: string) => {
        setProcessingIds(prev => new Set(prev).add(applicationId));

        try {
            const appDocRef = doc(db, 'applications', applicationId);
            await updateDoc(appDocRef, {
                status: 'pending',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error reverting application:', error);
            alert('Failed to revert application. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(applicationId);
                return next;
            });
        }
    };

    // Selection Logic
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === applications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(applications.map(app => app.id)));
        }
    };

    // Open Modal
    const openAssignModal = () => {
        // Determine default target based on active tab
        let defaultTarget: 'round2' | 'round3' = 'round2';
        if (activeTab === 'round3') defaultTarget = 'round3';

        setAssignTarget(defaultTarget);
        setTaskTitle(defaultTarget === 'round2' ? 'Round 2: ' : 'Round 3: ');
        setTaskDesc('');
        setSendEmail(true);
        setShowAssignModal(true);
    };

    // Execute Assignment
    const handleAssignTask = async () => {
        if (!userProfile?.isAdmin) return;
        setIsAssigning(true);

        try {
            const batch = writeBatch(db);
            const selectedApps = applications.filter(app => selectedIds.has(app.id));
            const emailPromises: Promise<any>[] = [];

            // 1. Update Firestore
            selectedApps.forEach(app => {
                const docRef = doc(db, 'applications', app.id);

                const taskData = {
                    title: taskTitle,
                    description: taskDesc,
                    assignedAt: serverTimestamp(),
                    emailSent: sendEmail
                };

                const updateData: any = {
                    status: assignTarget === 'round2' ? 'round2_selected' : 'round3_selected',
                };

                if (assignTarget === 'round2') {
                    updateData.round2Task = taskData;
                } else {
                    updateData.round3Task = taskData;
                }

                batch.update(docRef, updateData);

                // 2. Prepare Emails (using GAS)
                if (sendEmail) {
                    const emailPromise = fetch(import.meta.env.VITE_GAS_EMAIL_URL || '', {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: app.email,
                            subject: `HeartBeats - ${taskTitle}`,
                            htmlBody: `
                                <h1>Congratulations! You've been selected for ${assignTarget === 'round2' ? 'Round 2' : 'Round 3'}.</h1>
                                <p>Dear ${app.name},</p>
                                <p>We are pleased to inform you that you have proceeded to the next round.</p>
                                <h3>Task: ${taskTitle}</h3>
                                <p>${taskDesc.replace(/\n/g, '<br>')}</p>
                                <hr>
                                <p>Please visit your <a href="https://heartbeats-nitr.web.app/join-us">Application Status Page</a> for more details.</p>
                                <p>Best,<br>HeartBeats Team</p>
                            `
                        })
                    }).catch(e => console.error("Failed to send email to " + app.email, e));
                    emailPromises.push(emailPromise);
                }
            });

            await batch.commit();
            await Promise.all(emailPromises);

            setShowAssignModal(false);
            setSelectedIds(new Set());
            alert(`Successfully assigned task to ${selectedApps.length} applicants.`);

        } catch (error) {
            console.error("Assignment Error:", error);
            alert("Failed to assign tasks.");
        } finally {
            setIsAssigning(false);
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
            case 'round1_cleared':
                return <span className={`${styles.badge}`} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>ROUND 1 CLEARED</span>;
            case 'round2_selected':
                return <span className={`${styles.badge}`} style={{ background: 'rgba(64, 123, 255, 0.15)', color: '#407bff', border: '1px solid rgba(64, 123, 255, 0.3)' }}>ROUND 2</span>;
            case 'round3_selected':
                return <span className={`${styles.badge}`} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>ROUND 3</span>;
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

    const getDisplayUsers = () => {
        switch (activeTab) {
            case 'pending_apps': return pendingApplications;
            case 'round2': return round2Applications;
            case 'round3': return round3Applications;
            case 'rejected': return rejectedApplications;
            case 'all_apps': return applications;
            case 'pending': return pendingUsers; // User verification pending
            case 'all': return allUsers;
            default: return [];
        }
    };

    const displayData = getDisplayUsers();
    const isApplicationView = ['pending_apps', 'round2', 'round3', 'rejected', 'all_apps'].includes(activeTab);

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            {/* Modal */}
            {showAssignModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>ASSIGN TASK</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>TARGET ROUND</label>
                            <div className={styles.tabs} style={{ margin: 0 }}>
                                <button
                                    className={`${styles.tab} ${assignTarget === 'round2' ? styles.active : ''}`}
                                    onClick={() => { setAssignTarget('round2'); setTaskTitle('Round 2: '); }}
                                    style={{ flex: 1, textAlign: 'center' }}
                                >
                                    ROUND 2
                                </button>
                                <button
                                    className={`${styles.tab} ${assignTarget === 'round3' ? styles.active : ''}`}
                                    onClick={() => { setAssignTarget('round3'); setTaskTitle('Round 3: '); }}
                                    style={{ flex: 1, textAlign: 'center' }}
                                >
                                    ROUND 3
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>TASK TITLE</label>
                            <input
                                className={styles.input}
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                placeholder="e.g. Round 2: Video Submission"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>TASK DESCRIPTION</label>
                            <textarea
                                className={styles.textarea}
                                rows={5}
                                value={taskDesc}
                                onChange={e => setTaskDesc(e.target.value)}
                                placeholder="Detailed instructions for the task..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.emailOption}>
                                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
                                Send Email Notification
                            </label>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowAssignModal(false)} className={styles.cancelButton}>CANCEL</button>
                            <button onClick={handleAssignTask} className={styles.confirmButton} disabled={isAssigning || !taskTitle.trim()}>
                                {isAssigning ? 'ASSIGNING...' : 'ASSIGN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                {/* Chat Toggle */}
                <div className={styles.toggleSection}>
                    <span className={styles.toggleLabel}>
                        BAND CHAT
                    </span>
                    <button
                        className={`${styles.toggle} ${isChatEnabled ? styles.toggleOn : ''}`}
                        onClick={handleToggleChat}
                        disabled={togglingChat}
                        aria-label={isChatEnabled ? 'Chat is enabled' : 'Chat is paused'}
                    >
                        <span className={styles.toggleTrack}>
                            <span className={styles.toggleThumb} />
                        </span>
                        <span className={styles.toggleStatus}>
                            {isChatEnabled ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>

                <div className={styles.tabs} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        className={`${styles.tab} ${activeTab === 'pending_apps' ? styles.active : ''}`}
                        onClick={() => setActiveTab('pending_apps')}
                    >
                        PENDING
                        {pendingApplications.length > 0 && <span className={styles.tabBadge}>{pendingApplications.length}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'round2' ? styles.active : ''}`}
                        onClick={() => setActiveTab('round2')}
                    >
                        ROUND 2
                        {round2Applications.length > 0 && <span className={styles.tabBadge}>{round2Applications.length}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'round3' ? styles.active : ''}`}
                        onClick={() => setActiveTab('round3')}
                    >
                        ROUND 3
                        {round3Applications.length > 0 && <span className={styles.tabBadge}>{round3Applications.length}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'rejected' ? styles.active : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        REJECTED
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'all_apps' ? styles.active : ''}`}
                        onClick={() => setActiveTab('all_apps')}
                    >
                        ALL APPS
                    </button>
                    <div className={styles.divider} style={{ width: 1, height: 20, background: '#333', margin: '0 10px' }} />
                    <button
                        className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        VERIFICATIONS
                        {pendingUsers.length > 0 && <span className={styles.tabBadge}>{pendingUsers.length}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        ALL USERS
                    </button>

                    {/* Selection Controls (Only on Applications tab) */}
                    {isApplicationView && (
                        <div style={{ marginLeft: 'auto', display: 'flex' }}>
                            <button
                                className={`${styles.actionButton} ${isSelectionMode ? styles.active : ''}`}
                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                            >
                                {isSelectionMode ? 'CANCEL' : 'SELECT'}
                            </button>
                            {isSelectionMode && (
                                <button className={styles.actionButton} onClick={handleSelectAll}>
                                    {selectedIds.size === (displayData as Application[]).length ? 'DESELECT ALL' : 'SELECT ALL'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content based on active tab */}
                {isApplicationView ? (
                    /* Applications List */
                    <div className={styles.userList}>
                        {(displayData as Application[]).length === 0 ? (
                            <div className={styles.emptyState}>
                                No applications in this category.
                            </div>
                        ) : (
                            (displayData as Application[]).map(app => (
                                <div key={app.id} className={styles.userCard}>
                                    {isSelectionMode && (
                                        <div className={styles.checkboxContainer}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                checked={selectedIds.has(app.id)}
                                                onChange={() => toggleSelect(app.id)}
                                            />
                                        </div>
                                    )}
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

                                        {app.status === 'declined' && (
                                            <button
                                                className={styles.approveButton}
                                                onClick={() => handleClearRound1(app.id)}
                                                disabled={processingIds.has(app.id)}
                                                style={{ fontSize: '0.7rem', backgroundColor: '#64748b' }}
                                            >
                                                RESTORE (R1)
                                            </button>
                                        )}

                                        {app.status === 'declined' && (
                                            <button
                                                className={styles.approveButton}
                                                onClick={() => handleRevertToPending(app.id)}
                                                disabled={processingIds.has(app.id)}
                                                style={{ fontSize: '0.7rem', backgroundColor: '#64748b' }}
                                            >
                                                REVERT TO PENDING
                                            </button>
                                        )}

                                        {app.status === 'pending' && (
                                            <>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleAcceptApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    TO R2
                                                </button>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleMoveToRound3(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ backgroundColor: '#8b5cf6', fontSize: '0.7rem' }}
                                                >
                                                    TO R3
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDeclineApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    REJECT
                                                </button>
                                            </>
                                        )}

                                        {(app.status === 'round2_selected' || app.status === 'round1_cleared') && (
                                            <>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleMoveToRound3(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ backgroundColor: '#8b5cf6', fontSize: '0.7rem' }}
                                                >
                                                    TO R3
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDeclineApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    REJECT
                                                </button>
                                            </>
                                        )}

                                        {app.status === 'round3_selected' && (
                                            <>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleAcceptApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    BACK TO R2
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDeclineApplication(app.id)}
                                                    disabled={processingIds.has(app.id)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    REJECT
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Floating Selection Bar */}
                        {isSelectionMode && selectedIds.size > 0 && (
                            <div className={styles.selectionBar}>
                                <span className={styles.selectionCount}>{selectedIds.size} SELECTED</span>
                                <button className={styles.assignButton} onClick={openAssignModal}>
                                    ASSIGN / MOVE
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* User List */
                    <div className={styles.userList}>
                        {(displayData as UserProfile[]).length === 0 ? (

                            <div className={styles.emptyState}>
                                {activeTab === 'all'
                                    ? 'No users registered yet.'
                                    : 'No pending verification requests.'}
                            </div>
                        ) : (
                            displayData.map((userItem: any) => (
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
