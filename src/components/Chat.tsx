import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDocs, deleteDoc, doc, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Chat.module.css';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: Timestamp | null;
}

const MESSAGE_LIMIT = 50;

export function Chat() {
    const { user, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Subscribe to messages (last 50)
    useEffect(() => {
        if (!userProfile) return;

        const messagesRef = collection(db, 'chat');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGE_LIMIT));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message)).reverse();
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [userProfile]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const handleSend = async () => {
        if (!user || !userProfile || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await addDoc(collection(db, 'chat'), {
                text: newMessage.trim(),
                senderId: user.uid,
                senderName: userProfile.name || user.email || 'Unknown',
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    // Delete old messages (admin only) - messages older than 7 days
    const handleClearOldMessages = async () => {
        if (!userProfile?.isAdmin || isDeleting) return;

        const confirmed = window.confirm('Delete all messages older than 7 days?');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const oldMessagesQuery = query(
                collection(db, 'chat'),
                where('createdAt', '<', Timestamp.fromDate(sevenDaysAgo))
            );

            const snapshot = await getDocs(oldMessagesQuery);
            let deleteCount = 0;

            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, 'chat', docSnap.id));
                deleteCount++;
            }

            alert(`Deleted ${deleteCount} old messages.`);
        } catch (error) {
            console.error('Error deleting old messages:', error);
            alert('Failed to delete messages.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Format timestamp
    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
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
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>BAND CHAT</h1>
                    <span className={styles.memberCount}>{MESSAGE_LIMIT} messages max</span>

                    {userProfile?.isAdmin && (
                        <button
                            className={styles.clearButton}
                            onClick={handleClearOldMessages}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'DELETING...' : 'CLEAR OLD (7+ DAYS)'}
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div className={styles.messagesContainer}>
                    {messages.length === 0 ? (
                        <p className={styles.noMessages}>No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.senderId === user?.uid;
                            const showDate = index === 0 ||
                                formatDate(msg.createdAt) !== formatDate(messages[index - 1]?.createdAt);

                            return (
                                <div key={msg.id}>
                                    {showDate && (
                                        <div className={styles.dateDivider}>
                                            <span>{formatDate(msg.createdAt)}</span>
                                        </div>
                                    )}
                                    <div className={`${styles.message} ${isMe ? styles.messageMe : styles.messageOther}`}>
                                        {!isMe && <span className={styles.senderName}>{msg.senderName}</span>}
                                        <p className={styles.messageText}>{msg.text}</p>
                                        <span className={styles.messageTime}>{formatTime(msg.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isSending}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={handleSend}
                        disabled={isSending || !newMessage.trim()}
                    >
                        {isSending ? '...' : 'SEND'}
                    </button>
                </div>
            </div>
        </div>
    );
}
