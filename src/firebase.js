/**
 * Firebase Configuration
 * 
 * ARCHITECTURE NOTE:
 * - Firebase is used ONLY for Hosting and Analytics
 * - Supabase handles: Auth, Database (PostgreSQL), Storage
 * 
 * This hybrid approach gives us:
 * - Firebase Hosting: Global CDN, easy deploys
 * - Firebase Analytics: Google Analytics integration
 * - Supabase: Better DB, Row Level Security, real-time subscriptions
 */

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate config in development
if (import.meta.env.DEV) {
    const missing = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
    
    if (missing.length > 0) {
        console.warn('⚠️ Missing Firebase env vars:', missing.join(', '));
        console.warn('Firebase Analytics will be disabled.');
    }
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (not in SSR, has valid config)
export let analytics = null;

isSupported().then((supported) => {
    if (supported && firebaseConfig.apiKey) {
        analytics = getAnalytics(app);
        console.log('📊 Firebase Analytics initialized');
    }
}).catch(() => {
    // Analytics not supported in this environment
});

// REMOVED: auth, db, storage - These are handled by Supabase
// See: src/lib/supabase.js, src/services/supabaseAuth.js, src/services/supabaseStorage.js
