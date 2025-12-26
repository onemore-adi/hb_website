import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';
import styles from '../styles/JoinUs.module.css';

// Primary Instrument options (matching Google Form)
const instrumentOptions = [
    'Vocals',
    'Guitar (Electric/Acoustic/Bass)',
    'Drums/Percussion',
    'Keyboard/Piano/Tabla',
    'Violin/Strings',
    'Saxophone/Brass',
    'Indian Classical Instrument',
    'Other (Creative & Management Team)'
];

// Musical styles options (matching Google Form)
const styleOptions = [
    'Fusion/World Music',
    'Indian/Western Classical Music',
    'Bollywood',
    'Hip-hop/Rap/RnB',
    'Rock/Metal/Blues',
    'Pop/Electronic'
];

// Year options
const yearOptions = [
    '1st Year (Freshman)',
    '2nd Year (Sophomore)',
    '3rd Year (Pre-final)',
    'M Tech',
    'Postgraduate Student'
];

// Metronome options
const metronomeOptions = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];

// Commitment scale
const commitmentScale = [1, 2, 3, 4, 5];

interface FormData {
    name: string;
    rollNo: string;
    phone: string;
    department: string;
    year: string;
    experience: string;
    commitment: string;
    musicalStyles: string[];
    field: string;
    otherField: string;
    yearsExperience: string;
    metronomeUsage: string;
    musicalInfluences: string;
    videoLink: string;
}

export function JoinUs() {
    const { user, userProfile } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [isAcceptingApplications, setIsAcceptingApplications] = useState(true);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    // Application state
    const [existingApplication, setExistingApplication] = useState<Application | null>(null);
    const [isLoadingApplication, setIsLoadingApplication] = useState(true);

    // Lookup mode state
    const [showLookup, setShowLookup] = useState(false);
    const [lookupRollNo, setLookupRollNo] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        rollNo: '',
        phone: '',
        department: '',
        year: '',
        experience: '',
        commitment: '',
        musicalStyles: [],
        field: '',
        otherField: '',
        yearsExperience: '',
        metronomeUsage: '',
        musicalInfluences: '',
        videoLink: '',
    });

    // Page load animation trigger
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Subscribe to applications config
    useEffect(() => {
        const configRef = doc(db, 'config', 'applications');
        const unsubscribe = onSnapshot(configRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setIsAcceptingApplications(data.isAcceptingApplications ?? true);
            } else {
                setIsAcceptingApplications(true);
            }
            setIsLoadingConfig(false);
        }, (error) => {
            console.error('Error fetching config:', error);
            setIsAcceptingApplications(true);
            setIsLoadingConfig(false);
        });

        return () => unsubscribe();
    }, []);

    // Check for existing application when user is logged in
    useEffect(() => {
        if (!user) {
            setIsLoadingApplication(false);
            setExistingApplication(null);
            return;
        }

        const checkExistingApplication = async () => {
            try {
                const applicationsRef = collection(db, 'applications');
                const emailQuery = query(applicationsRef, where('email', '==', user.email));
                const emailSnapshot = await getDocs(emailQuery);

                if (!emailSnapshot.empty) {
                    const appDoc = emailSnapshot.docs[0];
                    const appData = { id: appDoc.id, ...appDoc.data() } as Application;
                    setExistingApplication(appData);

                    // Link user if not already linked
                    if (!appData.linkedUserId && user.uid) {
                        await updateDoc(doc(db, 'applications', appDoc.id), {
                            linkedUserId: user.uid
                        });
                    }
                } else {
                    setExistingApplication(null);
                }
            } catch (error) {
                console.error('Error checking application:', error);
                setExistingApplication(null);
            } finally {
                setIsLoadingApplication(false);
            }
        };

        checkExistingApplication();
    }, [user]);

    // Pre-fill name from user profile
    useEffect(() => {
        if (userProfile && !existingApplication) {
            setFormData(prev => ({
                ...prev,
                name: userProfile.name || prev.name,
            }));
        }
    }, [userProfile, existingApplication]);

    // Handle input change with typing indicator
    const handleChange = (key: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setIsTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setIsTyping(false), 1000);
        setTypingTimeout(timeout);
    };

    // Handle checkbox array change
    const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
        setFormData(prev => {
            const current = prev[key as keyof FormData] as string[];
            if (checked) {
                return { ...prev, [key]: [...current, value] };
            } else {
                return { ...prev, [key]: current.filter(v => v !== value) };
            }
        });
        setIsTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setIsTyping(false), 1000);
        setTypingTimeout(timeout);
    };

    // Handle submit - save to Firestore
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const applicationId = formData.rollNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
            const applicationRef = doc(db, 'applications', applicationId);

            await setDoc(applicationRef, {
                rollNo: formData.rollNo.toUpperCase(),
                email: user.email,
                name: formData.name,
                phone: formData.phone,
                department: formData.department,
                year: formData.year,
                experience: formData.experience,
                commitment: formData.commitment,
                musicalStyles: formData.musicalStyles.join(', '),
                field: formData.field,
                otherField: formData.field.includes('Other') ? formData.otherField : '',
                yearsExperience: formData.yearsExperience,
                metronomeUsage: formData.metronomeUsage,
                musicalInfluences: formData.musicalInfluences,
                videoLink: formData.videoLink,
                status: 'pending',
                source: 'website',
                linkedUserId: user.uid,
                submittedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.rollNo.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.department.trim() !== '' &&
            formData.year !== '' &&
            formData.field !== '' &&
            (formData.field.includes('Other') ? formData.otherField.trim() !== '' : true) &&
            formData.musicalStyles.length > 0 &&
            formData.yearsExperience.trim() !== '' &&
            formData.musicalInfluences.trim() !== ''
        );
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <span className={`${styles.statusBadge} ${styles.statusAccepted}`}>✓ ACCEPTED</span>;
            case 'declined':
                return <span className={`${styles.statusBadge} ${styles.statusDeclined}`}>✗ DECLINED</span>;
            default:
                return <span className={`${styles.statusBadge} ${styles.statusPending}`}>⏳ PENDING</span>;
        }
    };

    // Handle roll number lookup
    const handleLookup = async () => {
        if (!lookupRollNo.trim() || isSearching) return;

        setIsSearching(true);
        setLookupError(null);

        try {
            // Normalize roll number to uppercase (common format)
            const normalizedRollNo = lookupRollNo.trim().toUpperCase();

            // Try exact match first (document ID is rollNo)
            const docRef = doc(db, 'applications', normalizedRollNo);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const appData = { id: docSnap.id, ...docSnap.data() } as Application;
                setExistingApplication(appData);
                setShowLookup(false);

                // Link user to this application
                if (user && !appData.linkedUserId) {
                    await updateDoc(docRef, { linkedUserId: user.uid });
                }
            } else {
                // Try lowercase version
                const lowerDocRef = doc(db, 'applications', lookupRollNo.trim().toLowerCase());
                const lowerDocSnap = await getDoc(lowerDocRef);

                if (lowerDocSnap.exists()) {
                    const appData = { id: lowerDocSnap.id, ...lowerDocSnap.data() } as Application;
                    setExistingApplication(appData);
                    setShowLookup(false);

                    if (user && !appData.linkedUserId) {
                        await updateDoc(lowerDocRef, { linkedUserId: user.uid });
                    }
                } else {
                    setLookupError('No application found with this roll number. Please fill out the form below.');
                }
            }
        } catch (error) {
            console.error('Lookup error:', error);
            setLookupError('Error searching. Please try again or fill out the form.');
        } finally {
            setIsSearching(false);
        }
    };

    const isLoading = isLoadingConfig || (user && isLoadingApplication);

    return (
        <div className={`${styles.page} ${isLoaded ? styles.loaded : ''} ${isHoveringSubmit ? styles.inverted : ''}`}>
            {/* Vertical Blind Entrance Animation */}
            <div className={styles.blinds}>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={styles.blind} style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
            </div>

            {/* Recording Indicator */}
            <div className={`${styles.recordingIndicator} ${isTyping ? styles.active : ''}`}>
                <span className={styles.recordingDot} />
                <span className={styles.recordingText}>REC</span>
            </div>

            {/* Back Link */}
            <Link to="/" className={styles.backLink}>
                ← BACK
            </Link>

            {/* Main Container - Split Screen */}
            <div className={styles.container}>
                {/* Left Side - Sticky Logo */}
                <div className={styles.leftPanel}>
                    <div className={styles.logoContainer}>
                        <span className={styles.verticalLogo}>HEARTBEATS</span>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className={styles.rightPanel}>
                    {isLoading ? (
                        /* Loading State */
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingPulse} />
                        </div>
                    ) : userProfile && (userProfile.verificationStatus === 'member' || userProfile.isAdmin) ? (
                        /* Band Member or Admin - Already Part of the Family */
                        <div className={styles.familyMessage}>
                            <div className={styles.familyIcon}>❤️</div>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>YOU'RE ALREADY<br />PART OF THE FAMILY</span>
                            </h1>
                            <p className={styles.familyText}>
                                Welcome back, {userProfile.name || 'fellow musician'}! You're already a verified member of HeartBeats.
                            </p>
                            <Link to="/band-area" className={styles.familyButton}>
                                GO TO BAND AREA →
                            </Link>
                        </div>
                    ) : existingApplication ? (
                        /* Existing Application - Show Status */
                        <div className={styles.applicationView}>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>YOUR APPLICATION</span>
                            </h1>

                            <div className={styles.statusSection}>
                                {getStatusBadge(existingApplication.status)}
                                {existingApplication.status === 'pending' && (
                                    <p className={styles.statusMessage}>
                                        Your application is being reviewed. We'll get back to you soon!
                                    </p>
                                )}
                                {existingApplication.status === 'accepted' && (
                                    <p className={styles.statusMessage}>
                                        Welcome to HeartBeats! Check your email for next steps.
                                    </p>
                                )}
                                {existingApplication.status === 'declined' && (
                                    <p className={styles.statusMessage}>
                                        Unfortunately, your application was not successful this time.
                                    </p>
                                )}
                            </div>

                            <div className={styles.applicationDetails}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>NAME</span>
                                    <span className={styles.detailValue}>{existingApplication.name}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>ROLL NO</span>
                                    <span className={styles.detailValue}>{existingApplication.rollNo}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>INSTRUMENT</span>
                                    <span className={styles.detailValue}>{existingApplication.field}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>DEPARTMENT</span>
                                    <span className={styles.detailValue}>{existingApplication.department}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>YEAR</span>
                                    <span className={styles.detailValue}>{existingApplication.year}</span>
                                </div>
                                {existingApplication.videoLink && (
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>VIDEO</span>
                                        <a href={existingApplication.videoLink} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
                                            Watch →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : !user ? (
                        /* Not Logged In - Login Prompt */
                        <div className={styles.loginPrompt}>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>JOIN US</span>
                            </h1>
                            <p className={styles.promptText}>
                                Please sign in with your Google account to submit an application.
                            </p>
                            <Link to="/dashboard" className={styles.loginButton}>
                                SIGN IN TO APPLY →
                            </Link>
                        </div>
                    ) : !isAcceptingApplications ? (
                        /* Applications Closed */
                        <div className={styles.closedContainer}>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>APPLICATIONS CLOSED</span>
                            </h1>
                            <p className={styles.closedText}>
                                We're currently not accepting new applications. Check back later or follow us for updates.
                            </p>
                        </div>
                    ) : isSubmitted ? (
                        /* Submission Success */
                        <div className={styles.successContainer}>
                            <div className={styles.successIcon}>✓</div>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>APPLICATION SUBMITTED</span>
                            </h1>
                            <p className={styles.successText}>
                                Thank you for applying to HeartBeats! We'll review your application and get back to you soon.
                            </p>
                        </div>
                    ) : (
                        /* Application Form */
                        <>
                            <h1 className={styles.title}>
                                <span className={styles.titleText}>JOIN HEARTBEATS</span>
                            </h1>

                            {/* Lookup Section */}
                            {!showLookup ? (
                                <button
                                    type="button"
                                    className={styles.lookupToggle}
                                    onClick={() => setShowLookup(true)}
                                >
                                    Applied earlier and can't find details? →
                                </button>
                            ) : (
                                <div className={styles.lookupSection}>
                                    <p className={styles.lookupText}>
                                        Enter your roll number to find your application:
                                    </p>
                                    <div className={styles.lookupInputGroup}>
                                        <input
                                            type="text"
                                            className={styles.lookupInput}
                                            placeholder="Enter Roll Number"
                                            value={lookupRollNo}
                                            onChange={(e) => setLookupRollNo(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                        />
                                        <button
                                            type="button"
                                            className={styles.lookupButton}
                                            onClick={handleLookup}
                                            disabled={isSearching || !lookupRollNo.trim()}
                                        >
                                            {isSearching ? 'SEARCHING...' : 'FIND'}
                                        </button>
                                    </div>
                                    {lookupError && (
                                        <p className={styles.lookupError}>{lookupError}</p>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.lookupCancel}
                                        onClick={() => {
                                            setShowLookup(false);
                                            setLookupError(null);
                                            setLookupRollNo('');
                                        }}
                                    >
                                        ← Fill out form instead
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className={styles.form}>
                                {/* Section: Personal Info */}
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>PERSONAL INFO</h2>

                                    <div className={styles.field}>
                                        <label className={styles.label}>FULL NAME *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>ROLL NUMBER *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., 125CS0001"
                                            value={formData.rollNo}
                                            onChange={(e) => handleChange('rollNo', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>PHONE (WHATSAPP) *</label>
                                        <input
                                            type="tel"
                                            className={styles.input}
                                            placeholder="e.g., 9876543210"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>YEAR OF STUDY *</label>
                                        <select
                                            className={styles.select}
                                            value={formData.year}
                                            onChange={(e) => handleChange('year', e.target.value)}
                                            required
                                        >
                                            <option value="">SELECT...</option>
                                            {yearOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>DEPARTMENT *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., Computer Science and Engineering"
                                            value={formData.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Section: Musical Profile */}
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>MUSICAL PROFILE</h2>

                                    <div className={styles.field}>
                                        <label className={styles.label}>PRIOR BAND/PERFORMANCE EXPERIENCE *</label>
                                        <textarea
                                            className={styles.textarea}
                                            rows={3}
                                            placeholder="Describe any previous band or performance experience..."
                                            value={formData.experience}
                                            onChange={(e) => handleChange('experience', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>COMMITMENT LEVEL (1-5) *</label>
                                        <p className={styles.hint}>How committed can you be to weekly practice and college events?</p>
                                        <div className={styles.scaleContainer}>
                                            {commitmentScale.map(n => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    className={`${styles.scaleButton} ${formData.commitment === String(n) ? styles.scaleActive : ''}`}
                                                    onClick={() => handleChange('commitment', String(n))}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>MUSICAL STYLES * <span className={styles.hint}>(select all that apply)</span></label>
                                        <div className={styles.checkboxGroup}>
                                            {styleOptions.map(style => (
                                                <label key={style} className={styles.checkbox}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.musicalStyles.includes(style)}
                                                        onChange={(e) => handleCheckboxChange('musicalStyles', style, e.target.checked)}
                                                    />
                                                    <span>{style}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>PRIMARY INSTRUMENT *</label>
                                        <select
                                            className={styles.select}
                                            value={formData.field}
                                            onChange={(e) => handleChange('field', e.target.value)}
                                            required
                                        >
                                            <option value="">SELECT...</option>
                                            {instrumentOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.field.includes('Other') && (
                                        <div className={styles.field}>
                                            <label className={styles.label}>SPECIFY ROLE *</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="e.g., Band Manager, Video Editor, Designer..."
                                                value={formData.otherField}
                                                onChange={(e) => handleChange('otherField', e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className={styles.field}>
                                        <label className={styles.label}>YEARS OF EXPERIENCE *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., 3 years"
                                            value={formData.yearsExperience}
                                            onChange={(e) => handleChange('yearsExperience', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>METRONOME USAGE</label>
                                        <select
                                            className={styles.select}
                                            value={formData.metronomeUsage}
                                            onChange={(e) => handleChange('metronomeUsage', e.target.value)}
                                        >
                                            <option value="">SELECT...</option>
                                            {metronomeOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>TOP 3 MUSICAL INFLUENCES *</label>
                                        <textarea
                                            className={styles.textarea}
                                            rows={2}
                                            placeholder="e.g., A.R. Rahman, Coldplay, Prateek Kuhad"
                                            value={formData.musicalInfluences}
                                            onChange={(e) => handleChange('musicalInfluences', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Section: Audition */}
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>AUDITION VIDEO</h2>

                                    <div className={styles.field}>
                                        <label className={styles.label}>VIDEO LINK</label>
                                        <p className={styles.hint}>Upload to Google Drive/YouTube and share the link (max 90 seconds)</p>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://drive.google.com/..."
                                            value={formData.videoLink}
                                            onChange={(e) => handleChange('videoLink', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSubmitting || !isFormValid()}
                                    onMouseEnter={() => setIsHoveringSubmit(true)}
                                    onMouseLeave={() => setIsHoveringSubmit(false)}
                                >
                                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
