import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import eurogateLogo from "../assets/logos/eurogate.svg";
import marsaMarocLogo from "../assets/logos/marsamaroc.svg";

export default function SimpleLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("Attempting login...");

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.error("Sign in error:", signInError);
                setError(signInError.message);
                setLoading(false);
                return;
            }

            console.log("Login successful:", data.user.email);

            // Force a hard redirect to bypass React Router issues
            window.location.href = "/clients";

        } catch (err) {
            console.error("Login exception:", err);
            setError(err.message || "Failed to sign in");
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

                {error && (
                    <div className="px-4 py-3 rounded-lg" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5'
                    }}>
                        {error}
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



                <div className="mt-8 pt-6 border-t border-gray-700/30 flex flex-col items-center">
                    <p className="text-xs text-[var(--text-muted)] mb-3">Trusted Partners</p>
                    <div className="flex justify-center items-center gap-6">
                        <img src={eurogateLogo} alt="Eurogate" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
                        <img src={marsaMarocLogo} alt="Marsa Maroc" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </div>
    );
}
