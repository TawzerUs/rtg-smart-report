import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function DirectLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [user, setUser] = useState(null);

    const testLogin = async () => {
        setStatus("Testing login...");
        console.log("Starting login test...");

        try {
            // Clear session first
            console.log("Clearing session...");
            await supabase.auth.signOut();
            setStatus("Session cleared. Signing in...");

            // Sign in with timeout
            console.log("Calling signInWithPassword...");
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout after 10 seconds')), 10000)
            );

            const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

            console.log("Login response:", { data, error });

            if (error) {
                setStatus(`❌ Error: ${error.message}`);
                console.error("Login error:", error);
                return;
            }

            setStatus(`✅ Login successful!`);
            setUser(data.user);
            console.log("User:", data.user);

            // Redirect to dashboard
            setTimeout(() => {
                console.log("Redirecting to dashboard...");
                window.location.href = "/";
            }, 1000);

        } catch (err) {
            setStatus(`❌ Error: ${err.message}`);
            console.error("Login exception:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a12' }}>
            <div className="max-w-md w-full p-8 rounded-xl" style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 240, 255, 0.1)'
            }}>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#00f0ff' }}>
                    Direct Login Test
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1" style={{ color: '#f1f5f9' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                color: '#f1f5f9'
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1" style={{ color: '#f1f5f9' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                color: '#f1f5f9'
                            }}
                        />
                    </div>

                    <button
                        onClick={testLogin}
                        className="w-full px-4 py-3 rounded-lg font-medium"
                        style={{
                            background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
                            color: '#ffffff'
                        }}
                    >
                        Test Login
                    </button>

                    {status && (
                        <div className="p-4 rounded-lg" style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            color: '#00f0ff'
                        }}>
                            {status}
                        </div>
                    )}

                    {user && (
                        <div className="p-4 rounded-lg" style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#86efac'
                        }}>
                            <p><strong>User ID:</strong> {user.id}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Redirecting to dashboard...</strong></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
