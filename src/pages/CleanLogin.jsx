import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CleanLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clientInfo, setClientInfo] = useState(null);

    const { manualLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Need to import this

    useEffect(() => {
        // Get client from URL or LocalStorage
        const clientParam = searchParams.get('client');
        let client = null;

        if (clientParam) {
            // Find client logic (simplified for now directly from params or LS)
            // In real app we might fetch client details. here we trust LS if it matches param or just LS
        }

        const storedClient = localStorage.getItem('selectedClient');
        if (storedClient) {
            const parsed = JSON.parse(storedClient);
            setClientInfo(parsed);
        } else {
            // If no client context, redirect to home
            navigate('/');
        }
    }, [navigate, searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Direct Fetch Login (Bypassing SDK due to timeout issues)
            console.log('🚀 Attempting Direct Fetch Login...');

            const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;

            const response = await fetch(authUrl, {
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

            console.log('📥 Login Response:', {
                status: response.status,
                ok: response.ok,
                hasUser: !!data.user,
                hasToken: !!data.access_token,
                error: data.error,
                errorDescription: data.error_description
            });

            if (!response.ok) {
                const errorMsg = data.error_description || data.msg || data.error || 'Login failed';
                console.error('❌ Login failed:', errorMsg);
                throw new Error(errorMsg);
            }

            if (!data.access_token || !data.user) {
                console.error('❌ Login response missing required data');
                throw new Error('Invalid login response - missing authentication data');
            }

            console.log('✅ Direct Fetch Login SUCCESS!', data.user?.email);

            // Set LocalStorage manually to match app expectations
            localStorage.setItem('rtg_core_token', data.access_token);
            localStorage.setItem('rtg_core_refresh_token', data.refresh_token);
            localStorage.setItem('rtg_core_user', JSON.stringify(data.user));
            localStorage.setItem('rtg_core_login_time', Date.now().toString());

            // Also set the standard Supabase token format
            const projectRef = import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0];
            const sbKey = `sb-${projectRef}-auth-token`;
            localStorage.setItem(sbKey, JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                user: data.user
            }));

            // Force navigation to projects
            console.log("CleanLogin: Navigating to /projects");
            setTimeout(() => {
                window.location.href = '/projects';
            }, 500);

        } catch (err) {
            console.error("❌ Login error details:", {
                message: err.message,
                stack: err.stack,
                email: email
            });

            // Show user-friendly error
            let userMessage = err.message;
            if (userMessage.includes('Invalid login credentials')) {
                userMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (userMessage.includes('Email not confirmed')) {
                userMessage = 'Your email needs to be confirmed. Please check your email or contact an administrator.';
            }

            setError(userMessage);
        } finally {
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
                        {clientInfo?.name ? `Sign in to ${clientInfo.name}` : 'Spidercord Access'}
                    </h2>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                        Secure Workspace Access
                    </p>
                </div>

                {error && (
                    <div className="px-4 py-3 rounded-lg flex items-start gap-2" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5'
                    }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* ... (existing fields) ... */}
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
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
                            color: '#ffffff',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                            border: 'none'
                        }}
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700/30 flex flex-col items-center">
                    <p className="text-xs text-[var(--text-muted)] mb-3" style={{ color: '#94a3b8' }}>Secure Enterprise Platform</p>
                </div>
            </div>
        </div>
    );
};

export default CleanLogin;
