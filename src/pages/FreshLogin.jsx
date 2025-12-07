import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FreshLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        // If AuthContext reports a user, we are logged in.
        if (user) {
            console.log("FreshLogin: User detected from AuthContext");
            setStatus("✅ Authenticated! Ready to enter.");
            setLoading(false);
        }
    }, [user]);

    const handleLogin = async (e) => {
        e.preventDefault();

        // If already authenticated, just go to dashboard
        if (user) {
            window.location.href = "/";
            return;
        }

        setStatus("Signing in...");
        setLoading(true);

        try {
            // Direct API call to Supabase
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setStatus(`❌ ${data.error_description || data.msg || 'Login failed'}`);
                setLoading(false);
                return;
            }

            // Store the session in custom keys to avoid Supabase client interference and aggressive cleanup
            localStorage.setItem('rtg_core_token', data.access_token);
            localStorage.setItem('rtg_core_refresh_token', data.refresh_token);
            localStorage.setItem('rtg_core_user', JSON.stringify(data.user));

            // Verify storage
            const storedToken = localStorage.getItem('rtg_core_token');
            if (!storedToken) {
                throw new Error("Failed to save auth token to local storage");
            }

            setStatus("✅ Login successful! Waiting for sync...");

            // We don't redirect here anymore. We wait for AuthContext to pick up the user
            // and then the UI will update to show the "ENTER DASHBOARD" button.

        } catch (err) {
            setStatus(`❌ Error: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a12' }}>
            <div className="max-w-md w-full space-y-6 p-8 rounded-xl shadow-2xl" style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)'
            }}>
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Spidercord Operations Manager
                    </h2>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                        Fresh Login - Direct API
                    </p>
                </div>

                {status && (
                    <div className="px-4 py-3 rounded-lg flex items-start gap-2" style={{
                        backgroundColor: status.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: status.includes('❌') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                        color: status.includes('❌') ? '#fca5a5' : '#86efac'
                    }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{status}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#f1f5f9' }}>
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 w-full px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    color: '#f1f5f9',
                                    outline: 'none'
                                }}
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#f1f5f9' }}>
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 w-full px-4 py-2 rounded-lg"
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

                    <button
                        type="submit"
                        disabled={loading && !user}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all disabled:opacity-50"
                        style={{
                            background: user ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #00f0ff, #a855f7)',
                            color: '#ffffff',
                            boxShadow: user ? '0 0 20px rgba(34, 197, 94, 0.3)' : '0 0 20px rgba(0, 240, 255, 0.3)',
                            border: 'none'
                        }}
                    >
                        {user ? <LogIn className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                        {user ? "ENTER DASHBOARD" : (loading ? "Signing in..." : "Sign In")}
                    </button>
                </form>

                {user && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/'}
                            className="text-sm underline"
                            style={{ color: '#86efac' }}
                        >
                            Click here if button doesn't work
                        </button>
                    </div>
                )}

                <div className="text-center text-xs" style={{ color: '#64748b' }}>
                    <p>Using direct Supabase API authentication</p>
                    <p className="mt-1">Credentials pre-filled for testing</p>
                </div>
            </div>
        </div>
    );
}

export default FreshLogin;
