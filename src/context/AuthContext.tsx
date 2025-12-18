import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    type User
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    type Timestamp
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

// User profile interface matching Firestore document structure
export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    organization: string;
    musicalInterests: string;
    topSongs: string[];
    verificationStatus: 'none' | 'pending' | 'member' | 'declined';
    isAdmin: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Auth context interface
interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Auth Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Check if user document exists, create if not
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    // Create new user document with default fields
                    const newUserProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName || '',
                        email: firebaseUser.email || '',
                        organization: '',
                        musicalInterests: '',
                        topSongs: ['', '', ''],
                        verificationStatus: 'none',
                        isAdmin: false,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };

                    await setDoc(userDocRef, newUserProfile);
                }

                // Subscribe to user profile changes
                const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.data() as UserProfile);
                    }
                });

                setLoading(false);

                // Return cleanup for profile subscription
                return () => unsubscribeProfile();
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
