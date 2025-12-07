import React, { useState } from 'react';
import { getDemoState } from '../utils/demoData';
import { createRTG, createWorkOrder, createZone } from '../services/supabaseDb';
import { createUserDocument } from '../services/supabaseAuth';

const SeedData = () => {
    const [status, setStatus] = useState([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg) => setStatus(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const handleSeed = async () => {
        if (!confirm('This will add demo data to your database. Continue?')) return;

        setLoading(true);
        setStatus([]);
        addLog('Starting seeding process...');

        try {
            const demoData = getDemoState();
            const rtgIdMap = {}; // Map 'RTG12' -> UUID

            // 1. Seed Zones
            addLog('Seeding Zones...');
            for (const zone of demoData.zones) {
                try {
                    await createZone({
                        name: zone.name,
                        description: zone.description
                    });
                    addLog(`Created Zone: ${zone.name}`);
                } catch (e) {
                    addLog(`Skipped Zone ${zone.name} (might exist)`);
                }
            }

            // 2. Seed RTGs
            addLog('Seeding RTGs...');
            for (const rtg of demoData.rtgs) {
                try {
                    const newRtg = await createRTG({
                        name: rtg.name, // 'RTG12'
                        status: rtg.status,
                        location: rtg.location,
                        description: rtg.description || `${rtg.name} Equipment`
                    });
                    if (newRtg) {
                        rtgIdMap[rtg.id] = newRtg.id; // Map 'RTG12' -> 'uuid-123'
                        addLog(`Created RTG: ${rtg.name} -> ${newRtg.id}`);
                    }
                } catch (e) {
                    addLog(`Error creating RTG ${rtg.name}: ${e.message}`);
                }
            }

            // 3. Seed Work Orders
            addLog('Seeding Work Orders...');
            for (const wo of demoData.workOrders) {
                const realRtgId = rtgIdMap[wo.rtgId];
                if (!realRtgId) {
                    addLog(`Skipping WO ${wo.title} - RTG ${wo.rtgId} not found in map`);
                    continue;
                }

                try {
                    await createWorkOrder({
                        rtgId: realRtgId,
                        title: wo.title,
                        description: `Priority: ${wo.priority}`,
                        status: wo.status,
                        priority: wo.priority,
                        dueDate: wo.deadline,
                        assignedTo: 'user-id-placeholder' // We don't have real user IDs here easily
                    });
                    addLog(`Created WO: ${wo.title} for ${wo.rtgId}`);
                } catch (e) {
                    addLog(`Error creating WO ${wo.title}: ${e.message}`);
                }
            }

            // 4. Seed Users (Optional - just entries in 'users' table)
            addLog('Seeding Users...');
            for (const user of demoData.users) {
                // We can't create Auth users easily without admin API, 
                // but we can try to create public.users entries if IDs were known.
                // Since demo users have int IDs (1, 2), and Supabase uses UUIDs, 
                // we might skip this or create dummy UUIDs if allowed.
                // For now, let's skip to avoid foreign key issues with auth.users
                addLog(`Skipping User ${user.name} (Auth managed)`);
            }

            addLog('Seeding Complete!');

        } catch (error) {
            console.error(error);
            addLog(`CRITICAL ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-2xl w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Seed Database</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Populate Supabase with demo data</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 px-4 py-3 rounded-lg">
                    <p className="font-medium">⚠️ Warning</p>
                    <p className="text-sm mt-1">This will create demo data in your Supabase database. Only run this once.</p>
                </div>

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Seeding...' : 'Seed Database with Demo Data'}
                </button>

                {status.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto">
                        {status.map((msg, i) => (
                            <div key={i} className={`text-sm py-1 ${msg.startsWith('✅') ? 'text-green-600 dark:text-green-400' :
                                msg.startsWith('❌') ? 'text-red-600 dark:text-red-400' :
                                    msg.startsWith('⚠️') ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-gray-900 dark:text-gray-100'
                                }`}>
                                {msg}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeedData;
