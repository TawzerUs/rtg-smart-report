import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBzmwi1SuAVMcRRJ0dUvUVn75lcLSsrmUs",
    authDomain: "yooryka.firebaseapp.com",
    projectId: "yooryka",
    storageBucket: "yooryka.firebasestorage.app",
    messagingSenderId: "158173796688",
    appId: "1:158173796688:web:457df3e937a33b8702b455",
    measurementId: "G-30S4751F9Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "yoorykadb"); // Use yoorykadb database
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
