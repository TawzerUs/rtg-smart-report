import React, { useState } from 'react';
import { signUpWithEmail, signInWithEmail, createUserDocument, updateUserRole, fetchUserRole } from '../services/supabaseAuth';

const AdminSetup = () => {
    const [email, setEmail] = useState('admin@tawzer.com');
    const [password, setPassword] = useState('admin123');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAdmin = async () => {
        setLoading(true);
        setStatus('Starting process...');
        try {
            let user;
            // 1. Try to sign up
            try {
                setStatus('Attempting to sign up...');
                user = await signUpWithEmail(email, password, { displayName: 'Admin User' });
                setStatus('Sign up successful.');
            } catch (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setStatus('User already exists. Attempting to sign in...');
                    // 2. If already registered, sign in
                    try {
                        user = await signInWithEmail(email, password);
                        setStatus('Sign in successful.');
                    } catch (signInError) {
                        setStatus(`Sign in failed: ${signInError.message}`);
                        setLoading(false);
                        return;
                    }
                } else {
                    setStatus(`Sign up failed: ${signUpError.message}`);
                    setLoading(false);
                    return;
                }
            }

            if (user) {
                setStatus(`User ID: ${user.id}. Checking role...`);
                // 3. Check/Update role
                const currentRole = await fetchUserRole(user.id, user.email);
                if (currentRole !== 'admin') {
                    setStatus('Updating user role to admin...');
                    // Ensure user document exists first
                    await createUserDocument(user.id, email, 'Admin User', 'admin');
                    // Explicitly update role just in case
                    await updateUserRole(user.id, 'admin');
                    setStatus('User role updated to admin successfully!');
                } else {
                    setStatus('User is already an admin.');
                }
            }
        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Setup</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create or promote an admin user</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="admin@tawzer.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password:</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="admin123"
                        />
                    </div>
                    <button
                        onClick={handleCreateAdmin}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Create/Promote Admin User'}
                    </button>
                </div>

                {status && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{status}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSetup;
