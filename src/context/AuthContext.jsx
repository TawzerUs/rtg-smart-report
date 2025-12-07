import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle as supabaseSignInWithGoogle,
    signOut as supabaseSignOut,
    onAuthStateChange,
    fetchUserRole,
    createUserDocument,
} from "../services/supabaseAuth";

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
    const loadingRef = useRef(loading);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Listen to auth state changes
    useEffect(() => {
        let isMounted = true;
        console.log("AuthContext: Setting up auth listener...");

        // First, check for manually stored tokens (from FreshLogin)
        const checkManualAuth = async () => {
            const storedUser = localStorage.getItem('rtg_core_user');
            const storedToken = localStorage.getItem('rtg_core_token');
            const storedRefreshToken = localStorage.getItem('rtg_core_refresh_token');
            const loginTimestamp = localStorage.getItem('rtg_core_login_time');

            // Check session timeout (24 hours)
            if (loginTimestamp) {
                const now = Date.now();
                const loginTime = parseInt(loginTimestamp);
                const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

                if (hoursSinceLogin > 24) {
                    console.log('Session expired (24 hours), clearing tokens');
                    localStorage.removeItem('rtg_core_user');
                    localStorage.removeItem('rtg_core_token');
                    localStorage.removeItem('rtg_core_refresh_token');
                    localStorage.removeItem('rtg_core_login_time');
                    if (isMounted) {
                        setUser(null);
                        setUserRole(null);
                        setLoading(false);
                    }
                    return false;
                }
            }

            if (storedUser && storedToken) {
                try {
                    const userData = JSON.parse(storedUser);
                    console.log("Found manually stored auth:", userData.email);

                    // Set session on Supabase client
                    if (storedRefreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: storedToken,
                            refresh_token: storedRefreshToken
                        });
                        if (error) {
                            console.warn("Error setting Supabase session:", error);
                            // Clear invalid tokens
                            console.log("Clearing invalid tokens from localStorage");
                            localStorage.removeItem('rtg_core_user');
                            localStorage.removeItem('rtg_core_token');
                            localStorage.removeItem('rtg_core_refresh_token');
                            if (isMounted) {
                                setUser(null);
                                setUserRole(null);
                                setLoading(false);
                            }
                            return false;
                        } else {
                            console.log("Supabase session set from custom tokens");
                        }
                    }

                    // Fetch role
                    let role = 'viewer';
                    try {
                        role = await fetchUserRole(userData.id, userData.email);
                    } catch (roleErr) {
                        console.error("Error fetching role:", roleErr);
                        // If we can't fetch role due to RLS, clear auth and let user re-login
                        console.log("Clearing auth due to role fetch failure");
                        localStorage.removeItem('rtg_core_user');
                        localStorage.removeItem('rtg_core_token');
                        localStorage.removeItem('rtg_core_refresh_token');
                        if (isMounted) {
                            setUser(null);
                            setUserRole(null);
                            setLoading(false);
                        }
                        return false;
                    }

                    if (isMounted) {
                        setUser(userData);
                        setUserRole(role);
                        setLoading(false);
                    }
                    return true;
                } catch (err) {
                    console.error("Error loading manual auth:", err);
                    // Clear invalid data
                    localStorage.removeItem('rtg_core_user');
                    localStorage.removeItem('rtg_core_token');
                    localStorage.removeItem('rtg_core_refresh_token');
                    if (isMounted) {
                        setUser(null);
                        setUserRole(null);
                        setLoading(false);
                    }
                }
            }
            return false;
        };

        // Try manual auth first
        checkManualAuth().then(hasManualAuth => {
            if (hasManualAuth) return;

            // If no manual auth, set up Supabase listener
            const unsubscribe = onAuthStateChange(async (supabaseUser) => {
                if (!isMounted) return;

                console.log("Auth state changed:", supabaseUser?.email);
                try {
                    if (supabaseUser) {
                        const role = supabaseUser.role || await fetchUserRole(supabaseUser.id, supabaseUser.email);
                        console.log("Fetched role for", supabaseUser.email, ":", role);
                        if (isMounted) {
                            setUser(supabaseUser);
                            setUserRole(role);
                        }
                    } else {
                        console.log("No user logged in");
                        if (isMounted) {
                            setUser(null);
                            setUserRole(null);
                        }
                    }
                } catch (error) {
                    console.error("Error in auth state change:", error);
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            });

            // Timeout fallback - if loading takes too long, stop loading
            const timeout = setTimeout(() => {
                if (isMounted && loadingRef.current) {
                    console.warn("Auth loading timeout - no callback received, setting loading to false");
                    setLoading(false);
                }
            }, 5000); // 5 second timeout

            return () => {
                isMounted = false;
                clearTimeout(timeout);
                if (unsubscribe) unsubscribe();
            };
        });

        return () => {
            isMounted = false;
        };
    }, []);

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            setError(null);
            console.log("AuthContext: Signing in...");
            const user = await signInWithEmail(email, password);
            console.log("AuthContext: Sign in successful, user:", user?.email);
            // Don't set user here - let the auth state change listener handle it
            // This ensures the state is properly synchronized
            return user;
        } catch (err) {
            console.error("AuthContext: Sign in error:", err);
            setError(err.message);
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            // Supabase OAuth redirects to a callback URL
            // The callback will be handled by the auth state change listener
            await supabaseSignInWithGoogle();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Register new user
    const register = async (email, password, displayName) => {
        try {
            setError(null);
            const user = await signUpWithEmail(email, password, { displayName });
            if (user) {
                await createUserDocument(user.id, email, displayName, "viewer");
            }
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Manual Login (called by CleanLogin)
    const manualLogin = async (userData, accessToken, refreshToken) => {
        try {
            console.log("AuthContext: Manual login triggered for", userData.email);

            // 1. Store tokens in localStorage
            localStorage.setItem('rtg_core_user', JSON.stringify(userData));
            localStorage.setItem('rtg_core_token', accessToken);
            localStorage.setItem('rtg_core_refresh_token', refreshToken);
            localStorage.setItem('rtg_core_login_time', Date.now().toString());

            // 2. Set Supabase Session
            if (refreshToken) {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                if (error) console.warn("Error setting Supabase session:", error);
            }

            // 3. Fetch Role
            let role = 'viewer';
            try {
                role = await fetchUserRole(userData.id, userData.email);
            } catch (roleErr) {
                console.error("Error fetching role during manual login:", roleErr);
            }

            // 4. Update State IMMEDIATELY
            setUser(userData);
            setUserRole(role);
            setLoading(false);

            console.log("AuthContext: Manual login complete. User set.");
            return true;
        } catch (err) {
            console.error("AuthContext: Manual login failed:", err);
            return false;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            setError(null);
            // Clear user state immediately
            setUser(null);
            setUserRole(null);
            // Sign out from Supabase (this will also clear storage and redirect)
            await supabaseSignOut();
        } catch (err) {
            // Even on error, clear local state
            setUser(null);
            setUserRole(null);
            setError(err.message);
            // Force redirect to login
            // window.location.href = '/login';
            console.log("AuthContext: Sign out redirect disabled for debugging");
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
        manualLogin,
        signOut,
        isAdmin: userRole === "admin",
        isOperator: userRole === "operator" || userRole === "admin",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
