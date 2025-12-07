import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionCleared, setSessionCleared] = useState(false);
    const { signIn, signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (user) {
            console.log('User detected, redirecting to dashboard...');
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    // Clear any stale session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log('Found existing session, clearing it...');
                await supabase.auth.signOut();
                setSessionCleared(true);
            }
        };
        checkSession();
    }, []);

    const handleClearSession = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            setSessionCleared(true);
            setError("");
            alert("Session cleared! You can now log in with new credentials.");
        } catch (err) {
            console.error("Error clearing session:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Just sign in - the auth state listener will handle everything
            await signIn(email, password);
            // Don't navigate here - let the useEffect handle it when user state updates
        } catch (err) {
            setError(err.message || "Failed to sign in. Try clearing your session first.");
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate("/");
        } catch (err) {
            setError(err.message || "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a12' }}>
            <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl" style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)'
            }}>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-2">
                        Spidercord Operations Manager
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                        Sign in to your account
                    </p>
                </div>

                {sessionCleared && (
                    <div className="px-4 py-3 rounded-lg" style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#86efac'
                    }}>
                        ✅ Session cleared! You can now log in.
                    </div>
                )}

                {error && (
                    <div className="px-4 py-3 rounded-lg" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5'
                    }}>
                        {error}
                        <button
                            onClick={handleClearSession}
                            className="ml-2 underline hover:no-underline"
                        >
                            Clear Session
                        </button>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main, #f1f5f9)' }}>
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted, #94a3b8)' }} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        color: '#f1f5f9',
                                        outline: 'none'
                                    }}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main, #f1f5f9)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted, #94a3b8)' }} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        color: '#f1f5f9',
                                        outline: 'none'
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, var(--primary, #00f0ff), var(--secondary, #a855f7))',
                            color: '#ffffff',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                            border: 'none'
                        }}
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-muted, #94a3b8)' }}>
                            Or continue with
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        backgroundColor: 'rgba(30, 41, 59, 0.3)',
                        color: 'var(--text-main, #f1f5f9)'
                    }}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </button>

                <p className="text-center text-sm" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium" style={{ color: 'var(--primary, #00f0ff)' }}>
                        Sign up
                    </Link>
                </p>

                <button
                    onClick={handleClearSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-all"
                    style={{
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5'
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                    Clear Session (if login fails)
                </button>
            </div>
        </div>
    );
}
