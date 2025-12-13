import { supabase } from '../lib/supabase';

/**
 * Supabase Authentication Service
 * Provides authentication methods compatible with Firebase Auth interface
 */

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // Map Supabase errors to user-friendly messages
            let errorMessage = error.message;

            if (error.message.includes('Invalid login credentials') || error.message.includes('invalid')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and confirm your account.';
            }

            const mappedError = new Error(errorMessage);
            mappedError.code = error.status || error.code;
            throw mappedError;
        }

        return data.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};

// Sign up with email and password
export const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata // Additional user metadata
            }
        });

        if (error) {
            // Map Supabase errors to user-friendly messages
            let errorMessage = error.message;

            if (errorMessage.includes('already registered') || errorMessage.includes('already exists') || errorMessage.includes('already-in-use')) {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (errorMessage.includes('invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            }

            const mappedError = new Error(errorMessage);
            mappedError.code = error.status || error.code;
            throw mappedError;
        }

        return data.user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

// Sign in with Google (OAuth)
export const signInWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            // Handle provider not enabled error
            if (error.message?.includes('provider is not enabled') || error.error_code === 'validation_failed') {
                const friendlyError = new Error('Google sign-in is not enabled. Please use email and password to sign in, or contact your administrator to enable Google OAuth.');
                friendlyError.code = 'PROVIDER_NOT_ENABLED';
                throw friendlyError;
            }
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

// Sign out
export const signOut = async () => {
    try {
        console.log('Signing out...');

        // Sign out from Supabase (this clears the session on the server)
        const { error } = await supabase.auth.signOut();

        // Get the actual storage key Supabase uses
        const projectRef = supabase.supabaseUrl?.split('//')[1]?.split('.')[0];
        const storageKeys = [
            'supabase.auth.token',
            `sb-${projectRef}-auth-token`,
            `sb-${projectRef}-auth-token-code-verifier`,
        ];

        // Remove all Supabase storage keys
        storageKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            } catch (e) {
                console.warn('Error removing key:', key, e);
            }
        });

        // Clear all localStorage items that might contain auth data
        Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    // Ignore errors
                }
            }
        });

        // Clear session storage completely
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('Error clearing sessionStorage:', e);
        }

        // Clear cached app data
        localStorage.removeItem('rtgs');
        localStorage.removeItem('workOrders');

        if (error) {
            console.warn('Sign out error (continuing anyway):', error);
        }

        console.log('Sign out complete');
        // Redirect handled by caller or context
    } catch (error) {
        console.error('Error signing out:', error);
        // Even if there's an error, clear storage and redirect
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            // Ignore
        }
        // window.location.href = '/login';
        console.log("Sign out redirect disabled for debugging");
    }
};

// Get current user
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
    let isSubscribed = true;
    console.log("onAuthStateChange: Setting up listener...");

    // Get initial session
    console.log("onAuthStateChange: Getting initial session...");
    supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error("Error getting session:", error);
            if (isSubscribed) callback(null);
            return;
        }

        if (session?.user && isSubscribed) {
            fetchUserRole(session.user.id, session.user.email).then(role => {
                if (isSubscribed) {
                    callback({
                        ...session.user,
                        role
                    });
                }
            }).catch(err => {
                console.error("Error fetching role:", err);
                if (isSubscribed) {
                    callback({
                        ...session.user,
                        role: 'viewer'
                    });
                }
            });
        } else if (isSubscribed) {
            callback(null);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("onAuthStateChange: Event:", event, "User:", session?.user?.email);

        if (!isSubscribed) return;

        if (session?.user) {
            try {
                // Fetch user role from database
                const role = await fetchUserRole(session.user.id, session.user.email);
                if (isSubscribed) {
                    callback({
                        ...session.user,
                        role
                    });
                }
            } catch (error) {
                console.error("Error fetching role in auth change:", error);
                if (isSubscribed) {
                    callback({
                        ...session.user,
                        role: 'viewer'
                    });
                }
            }
        } else {
            if (isSubscribed) {
                callback(null);
            }
        }
    });

    return () => {
        isSubscribed = false;
        if (subscription) {
            subscription.unsubscribe();
        }
    };
};

// Fetch user role from database with timeout protection
export const fetchUserRole = async (userId, email) => {
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('fetchUserRole timeout after 4s')), 4000);
    });

    const fetchPromise = (async () => {
        try {
            console.log(`fetchUserRole: Fetching role for user: ${userId}`);
            
            // First, verify we have a valid session
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session) {
                console.warn('fetchUserRole: No active session, defaulting to viewer');
                return 'viewer';
            }

            const { data, error } = await supabase
                .from('users')
                .select('role, email, display_name')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') { // PGRST116 means no rows found
                console.warn(`fetchUserRole: User ${userId} not found in public.users table. Attempting to create.`);
                // User exists in auth.users but not in public.users, create a record
                try {
                    await createUserDocument(userId, email, email?.split('@')[0], 'viewer');
                    console.log(`fetchUserRole: User ${userId} created in public.users with default role 'viewer'.`);
                } catch (createErr) {
                    console.error('fetchUserRole: Failed to create user document:', createErr);
                }
                return 'viewer';
            } else if (error) {
                console.error('Error fetching user role:', error);
                return 'viewer';
            }

            if (data) {
                console.log(`fetchUserRole: Found role '${data.role}' for user ${userId}`);
                return data.role || 'viewer';
            }

            return 'viewer'; // Default role
        } catch (error) {
            console.error('Error fetching user role:', error);
            return 'viewer';
        }
    })();

    // Race between fetch and timeout
    try {
        return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
        console.error('fetchUserRole: Timeout or error, defaulting to viewer:', err.message);
        return 'viewer';
    }
};

// Create user document in database
export const createUserDocument = async (userId, email, displayName, role = 'viewer', createdBy = 'self') => {
    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email,
                display_name: displayName || email?.split('@')[0],
                role,
                created_at: new Date().toISOString(),
                created_by: createdBy
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

// Update user role
export const updateUserRole = async (userId, role) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};
