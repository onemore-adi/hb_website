import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/MembersList.module.css';

interface Member {
    id: string;
    name: string;
    email: string;
    organization?: string;
    rollNo?: string;
    isAdmin?: boolean;
}

export function MembersList() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

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

    // Fetch members
    useEffect(() => {
        if (!userProfile) return;

        const membersQuery = query(
            collection(db, 'users'),
            where('verificationStatus', '==', 'member')
        );

        const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
            const membersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Member));

            // Sort: admins first, then alphabetically by name
            membersList.sort((a, b) => {
                if (a.isAdmin && !b.isAdmin) return -1;
                if (!a.isAdmin && b.isAdmin) return 1;
                return (a.name || '').localeCompare(b.name || '');
            });

            setMembers(membersList);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

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
                    <h1 className={styles.title}>BAND MEMBERS</h1>
                    <span className={styles.count}>{members.length} members</span>
                </div>

                <div className={styles.grid}>
                    {members.map(member => (
                        <div key={member.id} className={`${styles.card} ${member.isAdmin ? styles.adminCard : ''}`}>
                            <div className={styles.avatar}>
                                {(member.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.info}>
                                <h2 className={styles.name}>
                                    {member.name || 'Unknown'}
                                    {member.isAdmin && <span className={styles.adminBadge}>ADMIN</span>}
                                </h2>
                                <p className={styles.email}>{member.email}</p>
                                {member.organization && (
                                    <p className={styles.org}>{member.organization}</p>
                                )}
                                {member.rollNo && (
                                    <p className={styles.roll}>{member.rollNo}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
