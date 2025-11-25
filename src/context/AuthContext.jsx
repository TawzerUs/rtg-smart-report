import { createContext, useContext, useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user role from Firestore
    const fetchUserRole = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                return userDoc.data().role || "viewer";
            }
            return "viewer"; // Default role
        } catch (err) {
            console.error("Error fetching user role:", err);
            return "viewer";
        }
    };

    // Create user document in Firestore
    const createUserDocument = async (uid, email, displayName, role = "viewer", createdBy = "self") => {
        try {
            await setDoc(doc(db, "users", uid), {
                email,
                displayName: displayName || email.split("@")[0],
                role,
                createdAt: new Date(),
                createdBy,
            });
        } catch (err) {
            console.error("Error creating user document:", err);
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const role = await fetchUserRole(firebaseUser.uid);
                setUser(firebaseUser);
                setUserRole(role);
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user document exists, create if not
            const userDoc = await getDoc(doc(db, "users", result.user.uid));
            if (!userDoc.exists()) {
                await createUserDocument(
                    result.user.uid,
                    result.user.email,
                    result.user.displayName,
                    "viewer"
                );
            }

            return result.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Register new user
    const register = async (email, password, displayName) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await createUserDocument(result.user.uid, email, displayName, "viewer");
            return result.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        userRole,
        loading,
        error,
        signIn,
        signInWithGoogle,
        register,
        signOut,
        isAdmin: userRole === "admin",
        isOperator: userRole === "operator" || userRole === "admin",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
