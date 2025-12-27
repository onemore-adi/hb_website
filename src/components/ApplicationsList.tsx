import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
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
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'round2_selected'>('all');

    useEffect(() => {
        console.log("ApplicationsList Debug:", { userProfile, isAdmin: userProfile?.isAdmin, verStatus: userProfile?.verificationStatus });
    }, [userProfile]);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [sendEmail, setSendEmail] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);

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
            case 'round2_selected':
                return <span className={`${styles.badge} ${styles.badgeRound2}`}>ROUND 2</span>;
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
        declined: applications.filter(a => a.status === 'declined').length,
        round2_selected: applications.filter(a => a.status === 'round2_selected').length
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
        if (selectedIds.size === filteredApps.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredApps.map(app => app.id)));
        }
    };

    // Open Modal
    const openAssignModal = () => {
        setTaskTitle('Round 2: ');
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
                batch.update(docRef, {
                    status: 'round2_selected',
                    round2Task: {
                        title: taskTitle,
                        description: taskDesc,
                        assignedAt: serverTimestamp(),
                        emailSent: sendEmail
                    }
                });

                // 2. Prepare Emails (using GAS)
                if (sendEmail) {
                    const emailPromise = fetch(import.meta.env.VITE_GAS_EMAIL_URL || '', { // Ensure this env var is set
                        method: 'POST',
                        mode: 'no-cors', // Important for GAS "Anyone" access
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: app.email,
                            subject: `HeartBeats - ${taskTitle}`,
                            htmlBody: `
                                <h1>Congratulations! You've been selected for Round 2.</h1>
                                <p>Dear ${app.name},</p>
                                <p>We are pleased to inform you that you have passed the initial screening.</p>
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

            // Note: with no-cors, we can't truly await the response status, fire and forget
            await Promise.all(emailPromises);

            // Cleanup
            setShowAssignModal(false);
            setSelectedIds(new Set());
            alert(`Successfully assigned task to ${selectedApps.length} applicants.`);

        } catch (error) {
            console.error("Assignment Error:", error);
            alert("Failed to assign tasks. Check console.");
        } finally {
            setIsAssigning(false);
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

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
            {/* Modal */}
            {showAssignModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>ASSIGN TASK</h2>
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
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={e => setSendEmail(e.target.checked)}
                                />
                                Send Email Notification
                            </label>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className={styles.cancelButton}
                                disabled={isAssigning}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleAssignTask}
                                className={styles.confirmButton}
                                disabled={isAssigning || !taskTitle.trim()}
                            >
                                {isAssigning ? 'ASSIGNING...' : `ASSIGN TO ${selectedIds.size} APPLICANTS`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Link to="/band-area" className={styles.backLink}>← BAND AREA</Link>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>APPLICATIONS</h1>
                    <div className={styles.stats}>
                        <span className={styles.stat}>{counts.all} TOTAL</span>
                        <span className={styles.stat}>{counts.pending} PENDING</span>
                        <span className={styles.stat}>{counts.round2_selected} R2</span>
                        {/* Debug Info */}
                        <span className={styles.stat} style={{ color: userProfile?.isAdmin ? '#4caf50' : '#f44336' }}>
                            {userProfile?.isAdmin ? 'ADMIN' : 'USER'} ({userProfile?.verificationStatus})
                        </span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className={styles.tabs}>
                    {(['all', 'pending', 'round2_selected', 'accepted', 'declined'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${filter === tab ? styles.active : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab.toUpperCase().replace('_', ' ')}
                            <span className={styles.tabCount}>{counts[tab]}</span>
                        </button>
                    ))}
                </div>

                {/* Actions & Selection */}
                {userProfile?.isAdmin && (
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                        <button
                            className={styles.tab}
                            onClick={() => setIsSelectionMode(!isSelectionMode)}
                            style={{ borderColor: isSelectionMode ? '#fff' : '' }}
                        >
                            {isSelectionMode ? 'EXIT SELECTION' : 'SELECT MODE'}
                        </button>
                        {isSelectionMode && (
                            <button className={styles.tab} onClick={handleSelectAll}>
                                {selectedIds.size === filteredApps.length ? 'DESELECT ALL' : 'SELECT ALL'}
                            </button>
                        )}
                    </div>
                )}

                {/* Applications List */}
                <div className={styles.list}>
                    {filteredApps.length === 0 ? (
                        <div className={styles.empty}>No applications found.</div>
                    ) : (
                        filteredApps.map(app => (
                            <div key={app.id} style={{ display: 'flex', width: '100%' }}>
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
                                <Link
                                    to={`/applications/${app.id}`}
                                    className={styles.card}
                                    style={{ flex: 1 }}
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
                            </div>
                        ))
                    )}
                </div>

                {/* Floating Selection Bar */}
                {isSelectionMode && selectedIds.size > 0 && (
                    <div className={styles.selectionBar}>
                        <span className={styles.selectionCount}>{selectedIds.size} SELECTED</span>
                        <button className={styles.assignButton} onClick={openAssignModal}>
                            ASSIGN TASK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
