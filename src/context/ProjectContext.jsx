import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDemoState } from '../utils/demoData';
import { useAuth } from './AuthContext';
import { subscribeToRTGs, subscribeToWorkOrders } from '../services/firestore';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    // Theme State
    const [theme, setTheme] = useState('dark');
    const { user } = useAuth();

    // Data State
    const [rtgs, setRtgs] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [paintingData, setPaintingData] = useState([]);
    const [corrosionData, setCorrosionData] = useState([]);
    const [zones, setZones] = useState([]);
    const [users, setUsers] = useState([]);
    const [headerImage, setHeaderImage] = useState(null);
    const [observations, setObservations] = useState({});
    const [loading, setLoading] = useState(true);
    const [useCloud, setUseCloud] = useState(true); // Toggle cloud/local storage

    // Initialize with Demo Data or Firestore
    useEffect(() => {
        if (!user) {
            // Not logged in - use demo data
            const demoData = getDemoState();
            setRtgs(demoData.rtgs);
            setWorkOrders(demoData.workOrders);
            setPaintingData(demoData.paintingData);
            setCorrosionData(demoData.corrosionData);
            setZones(demoData.zones);
            setUsers(demoData.users);
            setLoading(false);
            return;
        }

        // Logged in - use Firestore with real-time sync
        if (useCloud) {
            // Subscribe to RTGs
            const unsubscribeRTGs = subscribeToRTGs((firestoreRTGs) => {
                setRtgs(firestoreRTGs);
                // Cache in localStorage
                localStorage.setItem('rtgs', JSON.stringify(firestoreRTGs));
                setLoading(false);
            });

            // Subscribe to Work Orders (all work orders, not filtered by RTG)
            const unsubscribeWorkOrders = subscribeToWorkOrders(null, (firestoreWorkOrders) => {
                setWorkOrders(firestoreWorkOrders);
                // Cache in localStorage
                localStorage.setItem('workOrders', JSON.stringify(firestoreWorkOrders));
            });

            // Cleanup subscriptions
            return () => {
                unsubscribeRTGs();
                unsubscribeWorkOrders();
            };
        } else {
            // Fallback to localStorage
            const cachedRTGs = localStorage.getItem('rtgs');
            const cachedWorkOrders = localStorage.getItem('workOrders');

            if (cachedRTGs) setRtgs(JSON.parse(cachedRTGs));
            if (cachedWorkOrders) setWorkOrders(JSON.parse(cachedWorkOrders));

            setLoading(false);
        }
    }, [user, useCloud]);

    // Load header image and observations from localStorage
    useEffect(() => {
        const savedHeader = localStorage.getItem('reportHeaderImage');
        if (savedHeader) {
            setHeaderImage(savedHeader);
        }

        const savedObservations = localStorage.getItem('reportObservations');
        if (savedObservations) {
            setObservations(JSON.parse(savedObservations));
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Helper to get RTG Progress
    const getRTGProgress = (rtgId) => {
        const rtgTasks = workOrders.filter(wo => wo.rtgId === rtgId);
        if (rtgTasks.length === 0) return 0;
        const completed = rtgTasks.filter(t => t.status === 'Completed').length;
        return Math.round((completed / rtgTasks.length) * 100);
    };

    const value = {
        theme,
        toggleTheme,
        rtgs,
        workOrders,
        paintingData,
        corrosionData,
        zones,
        users,
        headerImage,
        observations,
        loading,
        useCloud,
        getRTGProgress,
        // Setters
        setRtgs,
        setWorkOrders,
        setPaintingData,
        setCorrosionData,
        setHeaderImage,
        setObservations,
        setUseCloud,
    };

    return (
        <ProjectContext.Provider value={value}>
            <div className={theme}>
                <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] transition-colors duration-300">
                    {children}
                </div>
            </div>
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
