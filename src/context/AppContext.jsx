import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDemoState } from '../utils/demoData';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

const STORAGE_KEY = 'rtg_smart_report_data';

const initialState = {
    rtgs: [],
    zones: [],
    users: [],
    resources: [],
    tasks: [],
    hseItems: [],
    operationsFollowup: [],
    workOrders: [],
    dailyLogs: [],
    corrosionData: [],
    paintingData: [],
    qhsseData: [],
    qhsseInspections: [],
    wasteLogs: [],
    photos: [],
};

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    // Apply theme to HTML element for Tailwind dark mode
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Also apply to body for backwards compatibility
        document.body.className = theme;
    }, [theme]);

    const [state, setState] = useState(() => {
        // Load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return { ...initialState, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to parse stored data:', e);
                return initialState;
            }
        }
        return initialState;
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Generic CRUD operations
    const addItem = (collection, item) => {
        setState(prev => ({
            ...prev,
            [collection]: [...prev[collection], { ...item, id: Date.now() }]
        }));
    };

    const updateItem = (collection, id, updates) => {
        setState(prev => ({
            ...prev,
            [collection]: prev[collection].map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        }));
    };

    const deleteItem = (collection, id) => {
        setState(prev => ({
            ...prev,
            [collection]: prev[collection].filter(item => item.id !== id)
        }));
    };

    const getItemById = (collection, id) => {
        return state[collection].find(item => item.id === id);
    };

    // Specific operations
    const addRTG = (rtg) => addItem('rtgs', rtg);
    const updateRTG = (id, updates) => updateItem('rtgs', id, updates);
    const deleteRTG = (id) => {
        // Check for dependencies
        const hasWorkOrders = state.workOrders.some(wo => wo.rtgId === id);
        const hasLogs = state.dailyLogs.some(log => log.rtgId === id);
        if (hasWorkOrders || hasLogs) {
            throw new Error('Cannot delete RTG with existing work orders or logs');
        }
        deleteItem('rtgs', id);
    };

    const addZone = (zone) => addItem('zones', zone);
    const updateZone = (id, updates) => updateItem('zones', id, updates);
    const deleteZone = (id) => deleteItem('zones', id);

    const addUser = (user) => {
        // Generate auto-incremented ID Reference
        const currentUsers = state.users;
        const maxIdRef = currentUsers.length > 0
            ? Math.max(...currentUsers.map(u => parseInt(u.idRef?.replace('USR-', '') || 0)))
            : 0;
        const newIdRef = `USR-${String(maxIdRef + 1).padStart(4, '0')}`;

        addItem('users', { ...user, idRef: newIdRef });
    };
    const updateUser = (id, updates) => updateItem('users', id, updates);
    const deleteUser = (id) => deleteItem('users', id);

    const addResource = (resource) => addItem('resources', resource);
    const updateResource = (id, updates) => updateItem('resources', id, updates);
    const deleteResource = (id) => deleteItem('resources', id);

    const addTask = (task) => addItem('tasks', task);
    const updateTask = (id, updates) => updateItem('tasks', id, updates);
    const deleteTask = (id) => deleteItem('tasks', id);

    const addHSEItem = (item) => addItem('hseItems', item);
    const updateHSEItem = (id, updates) => updateItem('hseItems', id, updates);
    const deleteHSEItem = (id) => deleteItem('hseItems', id);

    const addOperationsFollowup = (item) => addItem('operationsFollowup', item);
    const updateOperationsFollowup = (id, updates) => updateItem('operationsFollowup', id, updates);
    const deleteOperationsFollowup = (id) => deleteItem('operationsFollowup', id);

    const addWorkOrder = (wo) => addItem('workOrders', wo);
    const updateWorkOrder = (id, updates) => updateItem('workOrders', id, updates);
    const deleteWorkOrder = (id) => deleteItem('workOrders', id);

    const addDailyLog = (log) => addItem('dailyLogs', log);
    const updateDailyLog = (id, updates) => updateItem('dailyLogs', id, updates);
    const deleteDailyLog = (id) => deleteItem('dailyLogs', id);

    const addCorrosionPoint = (point) => addItem('corrosionData', point);
    const updateCorrosionPoint = (id, updates) => updateItem('corrosionData', id, updates);
    const deleteCorrosionPoint = (id) => deleteItem('corrosionData', id);

    const addPaintingRecord = (record) => addItem('paintingData', record);
    const updatePaintingRecord = (id, updates) => updateItem('paintingData', id, updates);
    const updatePaintingLayer = (rtgId, type, layerId, updates) => {
        setState(prev => {
            // Find existing record for this RTG and type
            const existingRecordIndex = prev.paintingData.findIndex(p => p.rtgId === rtgId && p.type === type);

            let newPaintingData = [...prev.paintingData];

            if (existingRecordIndex >= 0) {
                // Update existing record
                const record = newPaintingData[existingRecordIndex];
                const updatedLayers = record.layers.map(l => l.id === layerId ? { ...l, ...updates } : l);
                newPaintingData[existingRecordIndex] = { ...record, layers: updatedLayers };
            } else {
                // Create new record if not exists (should be initialized elsewhere, but safe fallback)
                // This part assumes we have a default structure, which we might need to define
            }

            return { ...prev, paintingData: newPaintingData };
        });
    };

    const addQHSSERecord = (record) => addItem('qhsseData', record);
    const updateQHSSERecord = (id, updates) => updateItem('qhsseData', id, updates);

    const addQHSSEInspection = (inspection) => addItem('qhsseInspections', inspection);
    const addWasteLog = (log) => addItem('wasteLogs', log);

    const addPhoto = (photo) => addItem('photos', photo);
    const deletePhoto = (id) => deleteItem('photos', id);

    // Data aggregation helpers
    const getRTGStats = (rtgId) => {
        const workOrders = state.workOrders.filter(wo => wo.rtgId === rtgId);
        const logs = state.dailyLogs.filter(log => log.rtgId === rtgId);
        const corrosion = state.corrosionData.filter(c => c.rtgId === rtgId);
        const painting = state.paintingData.filter(p => p.rtgId === rtgId);

        // Calculate painting progress
        let paintingProgress = 0;
        if (painting.length > 0) {
            const totalLayers = painting.reduce((acc, curr) => acc + curr.layers.length, 0);
            const completedLayers = painting.reduce((acc, curr) => acc + curr.layers.filter(l => l.status === 'Completed').length, 0);
            paintingProgress = totalLayers > 0 ? Math.round((completedLayers / totalLayers) * 100) : 0;
        }

        return {
            totalWorkOrders: workOrders.length,
            activeWorkOrders: workOrders.filter(wo => wo.status !== 'Completed').length,
            totalLogs: logs.length,
            corrosionPoints: corrosion.length,
            paintingProgress
        };
    };

    const generateDailyReport = (rtgId, date) => {
        const rtg = getItemById('rtgs', rtgId);
        const logs = state.dailyLogs.filter(log =>
            log.rtgId === rtgId && log.date === date
        );

        if (!logs.length) return null;

        const log = logs[0]; // Assuming one log per RTG per day

        return {
            id: `RPT-${Date.now()}`,
            title: 'Daily Progress Report',
            rtg: rtg?.name || 'Unknown',
            rtgId,
            date,
            type: 'Daily',
            status: 'Generated',
            data: {
                summary: {
                    tasksCompleted: log.tasksCompleted || 0,
                    tasksTotal: log.tasksTotal || 0,
                    hoursWorked: log.hoursWorked || 0,
                    teamSize: log.teamSize || 0,
                    efficiency: log.efficiency || 0
                },
                tasks: log.tasks || [],
                materials: log.materials || [],
                issues: log.issues || [],
                notes: log.notes || ''
            }
        };
    };

    const loadDemoData = () => {
        const demoState = getDemoState();
        setState({ ...initialState, ...demoState });
        // Force save to local storage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState, ...demoState }));
        // Reload page to ensure all components refresh cleanly
        window.location.reload();
    };

    const value = {
        // State
        ...state,
        theme,
        toggleTheme,
        loadDemoData,

        // RTG operations
        addRTG,
        updateRTG,
        deleteRTG,

        // Zone operations
        addZone,
        updateZone,
        deleteZone,

        // User operations
        addUser,
        updateUser,
        deleteUser,

        // Resource operations
        addResource,
        updateResource,
        deleteResource,

        // Task operations
        addTask,
        updateTask,
        deleteTask,

        // HSE operations
        addHSEItem,
        updateHSEItem,
        deleteHSEItem,

        // Operations Follow-up operations
        addOperationsFollowup,
        updateOperationsFollowup,
        deleteOperationsFollowup,

        // Work Order operations
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,

        // Daily Log operations
        addDailyLog,
        updateDailyLog,
        deleteDailyLog,

        // Corrosion operations
        addCorrosionPoint,
        updateCorrosionPoint,
        deleteCorrosionPoint,

        // Painting operations
        addPaintingRecord,
        updatePaintingRecord,
        updatePaintingLayer,

        // QHSSE operations
        addQHSSERecord,
        updateQHSSERecord,
        addQHSSEInspection,
        addWasteLog,

        // Photo operations
        addPhoto,
        deletePhoto,

        // Helpers
        getItemById,
        getRTGStats,
        generateDailyReport,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
