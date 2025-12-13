import { supabase } from '../lib/supabase';

/**
 * Supabase Database Service
 * Provides CRUD operations and real-time subscriptions for the database
 */

// ============== PAGINATION CONFIG ==============
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/**
 * Helper to apply pagination to queries
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {{ from: number, to: number }}
 */
const getPaginationRange = (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    const size = Math.min(pageSize, MAX_PAGE_SIZE);
    const from = (page - 1) * size;
    const to = from + size - 1;
    return { from, to };
};

// ============== RTGs ==============

// Get RTGs for a specific project (with optional pagination)
export const getRTGs = async (projectId, options = {}) => {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = options;
    
    if (!projectId) {
        console.warn('getRTGs called without projectId - returning empty to prevent data leak');
        return [];
    }
    try {
        const { from, to } = getPaginationRange(page, pageSize);
        
        const { data, error, count } = await supabase
            .from('rtgs')
            .select('*', { count: 'exact' })
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        
        // Return data with pagination metadata
        return {
            data: data || [],
            pagination: {
                page,
                pageSize,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / pageSize)
            }
        };
    } catch (error) {
        console.error('Error fetching RTGs:', error);
        return { data: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } };
    }
};

// Legacy wrapper for backward compatibility (returns array directly)
export const getRTGsLegacy = async (projectId) => {
    const result = await getRTGs(projectId, { page: 1, pageSize: MAX_PAGE_SIZE });
    return result.data || [];
};

// Get single RTG by ID
export const getRTG = async (id) => {
    try {
        const { data, error } = await supabase
            .from('rtgs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching RTG:', error);
        return null;
    }
};

// Create RTG
export const createRTG = async (rtgData) => {
    try {
        const { data, error } = await supabase
            .from('rtgs')
            .insert({
                project_id: rtgData.projectId || rtgData.project_id,
                name: rtgData.name,
                status: rtgData.status || 'active',
                location: rtgData.location,
                description: rtgData.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating RTG:', error);
        throw error;
    }
};

// Update RTG
export const updateRTG = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('rtgs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating RTG:', error);
        throw error;
    }
};

// Delete RTG
export const deleteRTG = async (id) => {
    try {
        const { error } = await supabase
            .from('rtgs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting RTG:', error);
        throw error;
    }
};

// Subscribe to RTGs (real-time) - uses legacy function for backward compatibility
export const subscribeToRTGs = (projectId, callback) => {
    if (!projectId) {
        console.warn('Cannot subscribe to RTGs without projectId');
        return () => { };
    }

    // First, fetch initial data (using legacy for backward compatibility)
    getRTGsLegacy(projectId).then(data => {
        callback(data);
    });

    // Then subscribe to changes
    const channel = supabase
        .channel(`rtgs-changes-${projectId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'rtgs' },
            async (payload) => {
                // Refetch all RTGs on any change (using legacy for backward compatibility)
                const data = await getRTGsLegacy(projectId);
                callback(data);
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        channel.unsubscribe();
    };
};

// ============== Work Orders ==============

// Get work orders (filtered by RTG or Project, with optional pagination)
export const getWorkOrders = async (rtgId = null, projectId = null, options = {}) => {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, paginate = false } = options;
    
    try {
        let query = supabase
            .from('work_orders')
            .select('*, rtg:rtgs!inner(project_id)', { count: paginate ? 'exact' : undefined })
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('rtg.project_id', projectId);
        }

        if (rtgId) {
            query = query.eq('rtg_id', rtgId);
        }

        // Apply pagination if requested
        if (paginate) {
            const { from, to } = getPaginationRange(page, pageSize);
            query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        
        // Return with pagination metadata if paginate=true
        if (paginate) {
            return {
                data: data || [],
                pagination: {
                    page,
                    pageSize,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / pageSize)
                }
            };
        }
        
        return data || [];
    } catch (error) {
        console.error('Error fetching work orders:', error);
        return paginate ? { data: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } } : [];
    }
};

// Get single work order by ID
export const getWorkOrder = async (id) => {
    try {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching work order:', error);
        return null;
    }
};

// Create work order
export const createWorkOrder = async (workOrderData) => {
    try {
        const { data, error } = await supabase
            .from('work_orders')
            .insert({
                rtg_id: workOrderData.rtgId || workOrderData.rtg_id,
                title: workOrderData.title,
                description: workOrderData.description,
                status: workOrderData.status || 'pending',
                priority: workOrderData.priority || 'medium',
                assigned_to: workOrderData.assignedTo || workOrderData.assigned_to,
                due_date: workOrderData.dueDate || workOrderData.due_date,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating work order:', error);
        throw error;
    }
};

// Update work order
export const updateWorkOrder = async (id, updates) => {
    try {
        // Convert camelCase to snake_case for database
        const dbUpdates = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        if (updates.rtgId) {
            dbUpdates.rtg_id = updates.rtgId;
            delete dbUpdates.rtgId;
        }
        if (updates.assignedTo) {
            dbUpdates.assigned_to = updates.assignedTo;
            delete dbUpdates.assignedTo;
        }
        if (updates.dueDate) {
            dbUpdates.due_date = updates.dueDate;
            delete dbUpdates.dueDate;
        }

        const { data, error } = await supabase
            .from('work_orders')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating work order:', error);
        throw error;
    }
};

// Delete work order
export const deleteWorkOrder = async (id) => {
    try {
        const { error } = await supabase
            .from('work_orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting work order:', error);
        throw error;
    }
};

// Subscribe to work orders (real-time)
// Subscribe to work orders (real-time)
export const subscribeToWorkOrders = (rtgId, projectId, callback) => {
    // First, fetch initial data
    getWorkOrders(rtgId, projectId).then(data => {
        callback(data);
    });

    // Then subscribe to changes
    const channelName = rtgId ? `work-orders-${rtgId}` : (projectId ? `work-orders-project-${projectId}` : 'work-orders-all');

    const subscription = supabase
        .channel(channelName)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'work_orders' },
            async (payload) => {
                // Refetch work orders on any change
                const data = await getWorkOrders(rtgId, projectId);
                callback(data);
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        subscription.unsubscribe();
    };
};

// ============== Users ==============

// Get all users
export const getAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// Get user by ID
export const getUser = async (id) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

// Update user
export const updateUser = async (id, updates) => {
    try {
        // Convert camelCase to snake_case
        const dbUpdates = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        if (updates.displayName) {
            dbUpdates.display_name = updates.displayName;
            delete dbUpdates.displayName;
        }

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Delete user via Edge Function (secure server-side deletion)
// Falls back to direct DB delete if Edge Function not available
export const deleteUser = async (id) => {
    try {
        // Try Edge Function first (handles both DB and Auth deletion)
        const session = await supabase.auth.getSession();
        const accessToken = session?.data?.session?.access_token;

        if (accessToken) {
            const functionsUrl = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/functions/v1');
            
            if (functionsUrl) {
                try {
                    const response = await fetch(`${functionsUrl}/delete-user`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: id }),
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        return true;
                    }

                    // If Edge Function returns a specific error, throw it
                    if (result.error) {
                        throw new Error(result.error);
                    }
                } catch (fetchError) {
                    // Edge Function not deployed yet, fall through to direct delete
                    console.warn('Edge Function not available, trying direct delete:', fetchError.message);
                }
            }
        }

        // Fallback: Direct database delete (may be blocked by RLS)
        // First, delete user_customers assignments
        const { error: customerError } = await supabase
            .from('user_customers')
            .delete()
            .eq('user_id', id);

        if (customerError) {
            console.warn('Error deleting user customer assignments:', customerError);
        }

        // Then delete the user record
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === '42501' || error.message?.includes('policy')) {
                throw new Error('Permission denied. Please use the admin script: node scripts/delete-user.js <email>');
            }
            throw error;
        }

        // Note: This only deletes from users table, not auth.users
        // User may still be able to log in. For complete deletion, deploy the Edge Function.
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// ============== Inspections ==============

// Get inspections for an RTG
export const getInspections = async (rtgId) => {
    try {
        let query = supabase
            .from('inspections')
            .select('*');

        if (rtgId) {
            query = query.eq('rtg_id', rtgId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching inspections:', error);
        if (error.details || error.message || error.hint) {
            console.error('Error details:', JSON.stringify(error, null, 2));
        }
        return [];
    }
};

// Create inspection
export const createInspection = async (inspectionData) => {
    try {
        const { data, error } = await supabase
            .from('inspections')
            .insert({
                rtg_id: inspectionData.rtgId || inspectionData.rtg_id,
                type: inspectionData.type,
                status: inspectionData.status || 'pending',
                findings: inspectionData.findings,
                inspector_id: inspectionData.inspectorId || inspectionData.inspector_id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating inspection:', error);
        throw error;
    }
};

// Update inspection
export const updateInspection = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('inspections')
            .update({
                ...updates
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating inspection:', error);
        throw error;
    }
};

// ============== Corrosion Points (stored in Inspections) ==============

export const saveCorrosionPoints = async (rtgId, zoneId, zoneData) => {
    try {
        // Extract points from zoneData (support both old and new format)
        const points = zoneData.points || zoneData;
        const imageUrl = zoneData.imageUrl || null;
        const validated_at = zoneData.validated_at || null;

        // 1. Find active inspection for this RTG
        let { data: inspection, error } = await supabase
            .from('inspections')
            .select('*')
            .eq('rtg_id', rtgId)
            .eq('status', 'in_progress')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw error;
        }

        // 2. If no active inspection, create one
        if (!inspection) {
            const { data: newInspection, error: createError } = await supabase
                .from('inspections')
                .insert({
                    rtg_id: rtgId,
                    type: 'Corrosion',
                    status: 'in_progress',
                    findings: {} // Initialize empty findings
                })
                .select()
                .single();

            if (createError) throw createError;
            inspection = newInspection;
        }

        // 3. Update findings with new data for the zone
        const currentFindings = inspection.findings || {};
        const updatedFindings = {
            ...currentFindings,
            [zoneId]: {
                points: points,
                imageUrl: imageUrl,
                validated_at: validated_at
            }
        };

        const { data: updatedInspection, error: updateError } = await supabase
            .from('inspections')
            .update({
                findings: updatedFindings
            })
            .eq('id', inspection.id)
            .select()
            .single();

        if (updateError) throw updateError;
        return updatedInspection;

    } catch (error) {
        console.error('Error saving corrosion points:', error);
        throw error;
    }
};

export const getCorrosionPoints = async (rtgId) => {
    try {
        const { data: inspection, error } = await supabase
            .from('inspections')
            .select('findings')
            .eq('rtg_id', rtgId)
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return {}; // No inspection found
            throw error;
        }

        return inspection.findings || {};
    } catch (error) {
        console.error('Error fetching corrosion points:', error);
        return {};
    }
};

// ============== Reports ==============

// Get reports
export const getReports = async (rtgId = null) => {
    try {
        let query = supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (rtgId) {
            query = query.eq('rtg_id', rtgId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
};

// Create report
export const createReport = async (reportData) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .insert({
                rtg_id: reportData.rtgId || reportData.rtg_id,
                title: reportData.title,
                type: reportData.type,
                content: reportData.content,
                status: reportData.status || 'draft',
                created_by: reportData.createdBy || reportData.created_by,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
};

// ============== Zones ==============

// Get zones
export const getZones = async () => {
    try {
        const { data, error } = await supabase
            .from('zones')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching zones:', error);
        return [];
    }
};

// Create zone
export const createZone = async (zoneData) => {
    try {
        const { data, error } = await supabase
            .from('zones')
            .insert({
                name: zoneData.name,
                description: zoneData.description,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating zone:', error);
        throw error;
    }
};

// Update zone
export const updateZone = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('zones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating zone:', error);
        throw error;
    }
};

// ============== Painting Systems ==============

export const getPaintingSystems = async (rtgId = null) => {
    try {
        let query = supabase.from('painting_systems').select('*');
        if (rtgId) query = query.eq('rtg_id', rtgId);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching painting systems:', error);
        return [];
    }
};

export const createPaintingSystem = async (systemData) => {
    try {
        const { data, error } = await supabase
            .from('painting_systems')
            .insert(systemData)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating painting system:', error);
        throw error;
    }
};

export const updatePaintingSystem = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('painting_systems')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating painting system:', error);
        throw error;
    }
};

// ============== Coating Control ==============

export const getCoatingControls = async (rtgId = null) => {
    try {
        let query = supabase.from('coating_control').select('*');
        if (rtgId) query = query.eq('rtg_id', rtgId);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching coating controls:', error);
        return [];
    }
};

export const createCoatingControl = async (controlData) => {
    try {
        const { data, error } = await supabase
            .from('coating_control')
            .insert(controlData)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating coating control:', error);
        throw error;
    }
};

export const updateCoatingControl = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('coating_control')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating coating control:', error);
        throw error;
    }
};

export const deleteCoatingControl = async (id) => {
    try {
        const { error } = await supabase
            .from('coating_control')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting coating control:', error);
        throw error;
    }
};

// Subscriptions
export const subscribeToPaintingSystems = (rtgId, callback) => {
    getPaintingSystems(rtgId).then(callback);
    const channel = supabase
        .channel('painting-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'painting_systems' },
            async () => callback(await getPaintingSystems(rtgId))
        )
        .subscribe();
    return () => channel.unsubscribe();
};

export const subscribeToCoatingControls = (rtgId, callback) => {
    getCoatingControls(rtgId).then(callback);
    const channel = supabase
        .channel('coating-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'coating_control' },
            async () => callback(await getCoatingControls(rtgId))
        )
        .subscribe();
    return () => channel.unsubscribe();
};

export const subscribeToZones = (callback) => {
    getZones().then(callback);
    const channel = supabase
        .channel('zones-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' },
            async () => callback(await getZones())
        )
        .subscribe();
    return () => channel.unsubscribe();
};

// ============== CUSTOMERS ==============

export const getCustomers = async () => {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl}/rest/v1/customers?select=*&order=name.asc`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
};

export const getCustomer = async (id) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .insert({
                id: customerData.id || customerData.name.toLowerCase().replace(/\s+/g, '-'),
                name: customerData.name,
                type: customerData.type || 'Client',
                color: customerData.color || '#0055aa',
                logo_url: customerData.logo_url || null,
                locations: customerData.locations || [],
                status: customerData.status || 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

export const updateCustomer = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

export const deleteCustomer = async (id) => {
    try {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
};

export const subscribeToCustomers = (callback) => {
    getCustomers().then(callback);
    const channel = supabase
        .channel('customers-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' },
            async () => callback(await getCustomers())
        )
        .subscribe();
    return () => channel.unsubscribe();
};

// ============== PROJECTS ==============

export const getAllProjects = async () => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching all projects:', error);
        return [];
    }
};

export const getCustomerProjects = async (customerId) => {
    if (!customerId) {
        console.warn('getCustomerProjects called without customerId - returning empty to prevent data leak');
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching customer projects:', error);
        return [];
    }
};

export const getProject = async (id) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
};

export const createProject = async (projectData) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('projects')
            .insert({
                customer_id: projectData.customer_id,
                name: projectData.name,
                type: projectData.type || 'RTG',
                status: projectData.status || 'Active',
                description: projectData.description || null,
                created_by: user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const updateProject = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

export const deleteProject = async (id) => {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

// Kept for backward compatibility but deprecated - prefer specific functions
export const getProjects = async (customerId = null) => {
    return customerId ? getCustomerProjects(customerId) : getAllProjects();
};

export const subscribeToAllProjects = (callback) => {
    getAllProjects().then(callback);
    const channel = supabase
        .channel('all-projects-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
            async () => callback(await getAllProjects())
        )
        .subscribe();
    return () => channel.unsubscribe();
};

export const subscribeToCustomerProjects = (callback, customerId) => {
    if (!customerId) {
        console.error('Cannot subscribe to customer projects without ID');
        return () => { };
    }

    getCustomerProjects(customerId).then(callback);

    const channel = supabase
        .channel(`projects-changes-${customerId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, // Filter logic handled by re-fetch
            async (payload) => {
                // We could verify payload here, but re-fetching is safer for now
                callback(await getCustomerProjects(customerId));
            }
        )
        .subscribe();
    return () => channel.unsubscribe();
};

// Deprecated wrapper
export const subscribeToProjects = (callback, customerId = null) => {
    if (customerId) return subscribeToCustomerProjects(callback, customerId);
    return subscribeToAllProjects(callback);
};

// ============== USER CUSTOMERS ==============

export const getUserCustomers = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_customers')
            .select('*, customers(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching user customers:', error);
        return [];
    }
};

export const assignUserToCustomer = async (userId, customerId, role = 'viewer') => {
    try {
        const { data, error } = await supabase
            .from('user_customers')
            .insert({
                user_id: userId,
                customer_id: customerId,
                role: role
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error assigning user to customer:', error);
        throw error;
    }
};

export const removeUserFromCustomer = async (userId, customerId) => {
    try {
        const { error } = await supabase
            .from('user_customers')
            .delete()
            .eq('user_id', userId)
            .eq('customer_id', customerId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing user from customer:', error);
        throw error;
    }
};
