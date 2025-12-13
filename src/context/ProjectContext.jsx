import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDemoState } from '../utils/demoData';
import { useAuth } from './AuthContext';
import {
    subscribeToRTGs,
    subscribeToWorkOrders,
    subscribeToPaintingSystems,
    subscribeToCoatingControls,
    subscribeToZones,
    getAllUsers,
    getInspections
} from '../services/supabaseDb';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    // Theme State
    const [theme, setTheme] = useState('dark');
    const { user } = useAuth();

    // Data State
    // Data State
    const [selectedProject, setSelectedProject] = useState(null);
    const [rtgs, setRtgs] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [paintingData, setPaintingData] = useState([]);
    const [corrosionData, setCorrosionData] = useState([]);
    const [coatingControlData, setCoatingControlData] = useState([]);
    const [zones, setZones] = useState([]);
    const [zoneImages, setZoneImages] = useState({}); // Store zone images globally
    const [users, setUsers] = useState([]);
    const [headerImage, setHeaderImage] = useState(null);
    const [observations, setObservations] = useState({});
    const [loading, setLoading] = useState(true);
    const [useCloud, setUseCloud] = useState(true); // Toggle cloud/local storage

    // Initialize Project from LocalStorage
    useEffect(() => {
        const storedProject = localStorage.getItem('selectedProject');
        if (storedProject) {
            try {
                setSelectedProject(JSON.parse(storedProject));
            } catch (e) {
                console.error("Failed to parse selected project", e);
            }
        }
    }, []);

    // Initialize with Demo Data or Supabase
    useEffect(() => {
        if (!user) {
            // Not logged in - use demo data
            const demoData = getDemoState();
            setRtgs(demoData.rtgs);
            setWorkOrders(demoData.workOrders);
            setPaintingData(demoData.paintingData);
            setCorrosionData(demoData.corrosionData);
            setCoatingControlData(demoData.coatingControlData);
            setZones(demoData.zones);
            setUsers(demoData.users);
            setLoading(false);
            return;
        }

        // Logged in - use Supabase with real-time sync
        if (useCloud) {
            if (!selectedProject?.id) {
                setLoading(false);
                return;
            }

            // Subscribe to RTGs (Scoped to Project)
            const unsubscribeRTGs = subscribeToRTGs(selectedProject.id, (supabaseRTGs) => {
                // Map Supabase fields to expected format (if needed)
                const mappedRTGs = (supabaseRTGs || []).map(rtg => ({
                    ...rtg,
                    // Ensure compatibility with existing code
                    id: rtg.id,
                    lastUpdate: rtg.updated_at || rtg.created_at || new Date().toISOString()
                }));
                setRtgs(mappedRTGs);
                // Cache in localStorage
                localStorage.setItem('rtgs', JSON.stringify(mappedRTGs));

                // Painting and Corrosion data are fetched via their own subscriptions
                // Don't reset them here

                setLoading(false);
            });

            // Subscribe to Work Orders (Scoped to Project)
            // subscribeToWorkOrders(rtgId, projectId, callback)
            const unsubscribeWorkOrders = subscribeToWorkOrders(null, selectedProject.id, (supabaseWorkOrders) => {
                // Map Supabase fields to expected format
                const mappedWorkOrders = (supabaseWorkOrders || []).map(wo => ({
                    ...wo,
                    // Map rtg_id to rtgId for compatibility
                    rtgId: wo.rtg_id || wo.rtgId,
                    id: wo.id
                }));
                setWorkOrders(mappedWorkOrders);
                localStorage.setItem('workOrders', JSON.stringify(mappedWorkOrders));
            });

            // Subscribe to Painting Systems
            const unsubscribePainting = subscribeToPaintingSystems(null, (data) => {
                if (data && data.length > 0) {
                    const mapped = (data || []).map(p => ({ ...p, rtgId: p.rtg_id }));
                    setPaintingData(mapped);
                }
                // Keep existing (mock) data if DB returns empty
            });

            const unsubscribeCoating = subscribeToCoatingControls(null, (data) => {
                const mapped = (data || []).map(c => ({
                    ...c,
                    rtgId: c.rtg_id,
                    zoneId: c.zone_id,
                    averageDFT: c.average_dft,
                    layerName: c.layer_name,
                    dftReadings: c.dft_readings,
                    surfaceTemp: c.surface_temp
                }));
                setCoatingControlData(mapped);
            });

            const unsubscribeZones = subscribeToZones((data) => {
                setZones(data);
                // Also update zoneImages map from zone data
                const images = {};
                data.forEach(z => {
                    if (z.image_url) images[z.id] = z.image_url;
                });
                setZoneImages(images);
            });

            // Users
            getAllUsers().then(setUsers);

            // Load Corrosion Data and Zone Images from Inspections
            const loadCorrosionData = async () => {
                const inspections = await getInspections();
                const allPoints = [];
                const inspectionImages = {};
                const validatedZones = {};

                inspections.forEach(inspection => {
                    if (inspection.findings) {
                        Object.entries(inspection.findings).forEach(([zoneId, data]) => {
                            // Handle legacy structure (array of points)
                            if (Array.isArray(data)) {
                                allPoints.push(...data);
                            }
                            // Handle new structure (object with points, imageUrl, validated_at)
                            else if (data && typeof data === 'object') {
                                if (data.points && Array.isArray(data.points)) {
                                    allPoints.push(...data.points);
                                }
                                if (data.imageUrl) {
                                    inspectionImages[zoneId] = data.imageUrl;
                                }
                                if (data.validated_at) {
                                    validatedZones[zoneId] = data.validated_at;
                                }
                            }
                        });
                    }
                });

                if (allPoints.length > 0) {
                    setCorrosionData(allPoints);
                }

                // Merge inspection images with existing zone images
                if (Object.keys(inspectionImages).length > 0) {
                    setZoneImages(prev => ({ ...prev, ...inspectionImages }));
                }

                // Update zones validation status
                if (Object.keys(validatedZones).length > 0) {
                    setZones(prev => prev.map(z => ({
                        ...z,
                        validated_at: validatedZones[z.id] || z.validated_at
                    })));
                }
            };
            loadCorrosionData();



            // Cleanup subscriptions
            return () => {
                unsubscribeRTGs();
                unsubscribeWorkOrders();
                if (unsubscribePainting) unsubscribePainting();
                if (unsubscribeCoating) unsubscribeCoating();
                if (unsubscribeZones) unsubscribeZones();
            };
        } else {
            // Fallback to localStorage (offline mode)
            const cachedRTGs = localStorage.getItem('rtgs');
            const cachedWorkOrders = localStorage.getItem('workOrders');

            if (cachedRTGs) {
                setRtgs(JSON.parse(cachedRTGs));
            }
            if (cachedWorkOrders) setWorkOrders(JSON.parse(cachedWorkOrders));

            // In offline/fallback mode, data should come from cache
            // Don't use demo data for logged-in users
            // Zones, painting, corrosion will be empty until cloud sync
            setZones([]);
            setPaintingData([]);
            setCorrosionData([]);
            setCoatingControlData([]);
            setUsers([]);

            setLoading(false);
        }
    }, [user, useCloud, selectedProject]);

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
        const rtgTasks = workOrders.filter(wo => (wo.rtgId === rtgId || wo.rtg_id === rtgId));
        if (rtgTasks.length === 0) return 0;
        const completed = rtgTasks.filter(t => t.status === 'Completed').length;
        return Math.round((completed / rtgTasks.length) * 100);
    };

    // Explicit Project Selector
    const selectProject = (project) => {
        setSelectedProject(project);
        localStorage.setItem('selectedProject', JSON.stringify(project));
    };

    const value = {
        theme,
        toggleTheme,
        selectedProject, // Exposed state
        selectProject,   // Exposed setter
        rtgs,
        workOrders,
        paintingData,
        corrosionData,
        coatingControlData,
        zones,
        zoneImages,
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
        setCoatingControlData, // Added setCoatingControlData setter
        setZones, // Added setZones setter
        setZoneImages,
        setUsers, // Added setUsers setter
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
