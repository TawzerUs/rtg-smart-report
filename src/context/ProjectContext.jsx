import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDemoState } from '../utils/demoData';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    // Theme State
    const [theme, setTheme] = useState('dark');

    // Data State
    const [rtgs, setRtgs] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [paintingData, setPaintingData] = useState([]);
    const [corrosionData, setCorrosionData] = useState([]);
    const [zones, setZones] = useState([]);
    const [users, setUsers] = useState([]);

    // Initialize with Demo Data
    useEffect(() => {
        const demoData = getDemoState();
        setRtgs(demoData.rtgs);
        setWorkOrders(demoData.workOrders);
        setPaintingData(demoData.paintingData);
        setCorrosionData(demoData.corrosionData);
        setZones(demoData.zones);
        setUsers(demoData.users);
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
        getRTGProgress,
        // Add setters as needed for modules
        setWorkOrders,
        setPaintingData,
        setCorrosionData
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
