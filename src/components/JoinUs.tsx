import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/JoinUs.module.css';

// Field options for dropdown
const fieldOptions = [
    'Vocals',
    'Guitar',
    'Bass',
    'Drums',
    'Keys',
    'Production',
    'Management',
    'Photography',
    'Videography',
    'Other'
];

interface FormData {
    name: string;
    rollNo: string;
    field: string;
    otherField: string;
    department: string;
    year: string;
    performanceLink: string;
    message: string;
}

export function JoinUs() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        rollNo: '',
        field: '',
        otherField: '',
        department: '',
        year: '',
        performanceLink: '',
        message: '',
    });

    // Page load animation trigger
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle input change with typing indicator
    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // Show typing indicator
        setIsTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setIsTyping(false), 1000);
        setTypingTimeout(timeout);
    };

    // Handle submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setIsSubmitted(true);
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.rollNo.trim() !== '' &&
            formData.field !== '' &&
            (formData.field !== 'Other' || formData.otherField.trim() !== '') &&
            formData.department.trim() !== '' &&
            formData.year.trim() !== ''
        );
    };

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

                {/* Right Side - Form */}
                <div className={styles.rightPanel}>
                    {/* Title with glitch animation */}
                    <h1 className={styles.title}>
                        <span className={styles.titleText}>JOIN THE PULSE</span>
                    </h1>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Name */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    NAME <span className={styles.hint}>your full name</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Roll No */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    ROLL NO <span className={styles.hint}>e.g., 121CS0XXX</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.rollNo}
                                    onChange={(e) => handleChange('rollNo', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Field to Apply */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    FIELD TO APPLY <span className={styles.hint}>select your role</span>
                                </label>
                                <select
                                    className={styles.select}
                                    value={formData.field}
                                    onChange={(e) => handleChange('field', e.target.value)}
                                    required
                                >
                                    <option value="">SELECT...</option>
                                    {fieldOptions.map(option => (
                                        <option key={option} value={option}>{option.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Other Field - Conditional */}
                            {formData.field === 'Other' && (
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        SPECIFY FIELD <span className={styles.hint}>describe your skill</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={formData.otherField}
                                        onChange={(e) => handleChange('otherField', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* Department */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    DEPARTMENT <span className={styles.hint}>e.g., Computer Science</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Year */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    YEAR <span className={styles.hint}>e.g., 2nd Year</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.year}
                                    onChange={(e) => handleChange('year', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Performance Link */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    PAST PERFORMANCE <span className={styles.hint}>youtube/drive link</span>
                                </label>
                                <input
                                    type="url"
                                    className={styles.input}
                                    value={formData.performanceLink}
                                    onChange={(e) => handleChange('performanceLink', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Message */}
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    WHY HEARTBEATS? <span className={styles.hint}>tell us your story</span>
                                </label>
                                <textarea
                                    className={styles.textarea}
                                    value={formData.message}
                                    onChange={(e) => handleChange('message', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={!isFormValid()}
                                onMouseEnter={() => setIsHoveringSubmit(true)}
                                onMouseLeave={() => setIsHoveringSubmit(false)}
                            >
                                COMMIT →
                            </button>
                        </form>
                    ) : (
                        /* Success State */
                        <div className={styles.successContainer}>
                            <div className={styles.successIcon}>✓</div>
                            <h2 className={styles.successTitle}>SIGNAL RECEIVED</h2>
                            <p className={styles.successMessage}>WE'LL BE IN TOUCH.</p>
                            <Link to="/" className={styles.homeLink}>
                                ← RETURN HOME
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
