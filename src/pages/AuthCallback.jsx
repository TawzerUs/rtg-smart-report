import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the session from the URL hash
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Auth callback error:', error);
                    setError(error.message);
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (session) {
                    console.log('Auth callback: Session found, redirecting to dashboard');
                    navigate('/', { replace: true });
                } else {
                    console.log('Auth callback: No session found');
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err.message);
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">Authentication Error</div>
                    <p className="text-[var(--text-muted)]">{error}</p>
                    <p className="text-[var(--text-muted)] mt-2">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-main)]">Completing sign in...</p>
            </div>
        </div>
    );
}
