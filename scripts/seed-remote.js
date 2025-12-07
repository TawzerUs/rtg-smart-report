import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getDemoState } from '../src/utils/demoData.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    console.error('Please create a .env file with:');
    console.error('VITE_SUPABASE_URL=your_project_url');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const seed = async () => {
    console.log('🌱 Starting remote seeding...');

    const demoData = getDemoState();
    const rtgIdMap = {};

    // 1. Zones
    console.log(`\nProcessing ${demoData.zones.length} Zones...`);
    for (const zone of demoData.zones) {
        // Check if exists
        const { data: existing } = await supabase.from('zones').select('id').eq('name', zone.name).single();

        if (existing) {
            console.log(`✅ Zone ${zone.name} (already exists)`);
        } else {
            const { error } = await supabase.from('zones').insert({
                name: zone.name,
                description: zone.description,
                created_at: new Date().toISOString()
            });
            if (error) console.error(`❌ Zone ${zone.name}: ${error.message}`);
            else console.log(`✅ Zone ${zone.name} (created)`);
        }
    }

    // 2. RTGs
    console.log(`\nProcessing ${demoData.rtgs.length} RTGs...`);
    for (const rtg of demoData.rtgs) {
        // Check if exists
        let { data: existing } = await supabase.from('rtgs').select('id').eq('name', rtg.name).single();
        let rtgId = existing?.id;

        if (rtgId) {
            console.log(`✅ RTG ${rtg.name} (already exists) -> ${rtgId}`);
            // Optional: Update status if needed
            await supabase.from('rtgs').update({
                status: rtg.status,
                location: rtg.location,
                updated_at: new Date().toISOString()
            }).eq('id', rtgId);
        } else {
            const { data, error } = await supabase.from('rtgs').insert({
                name: rtg.name,
                status: rtg.status,
                location: rtg.location,
                // description: `${rtg.brand} ${rtg.capacity}`, // Column missing
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).select().single();

            if (error) {
                console.error(`❌ RTG ${rtg.name}: ${error.message}`);
            } else {
                console.log(`✅ RTG ${rtg.name} (created) -> ${data.id}`);
                rtgId = data.id;
            }
        }

        if (rtgId) {
            rtgIdMap[rtg.id] = rtgId;
        }
    }

    // 3. Work Orders
    console.log(`\nProcessing ${demoData.workOrders.length} Work Orders...`);
    for (const wo of demoData.workOrders) {
        const realRtgId = rtgIdMap[wo.rtgId];
        if (!realRtgId) {
            console.warn(`⚠️ Skipping WO ${wo.title}: RTG ${wo.rtgId} not found.`);
            continue;
        }

        const { error } = await supabase.from('work_orders').insert({
            rtg_id: realRtgId,
            title: wo.title,
            description: `Priority: ${wo.priority}`,
            status: wo.status,
            priority: wo.priority,
            // due_date: wo.deadline, // Column missing in DB
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (error) console.error(`❌ WO ${wo.title}: ${error.message}`);
        else console.log(`✅ WO ${wo.title}`);
    }

    // 4. Reports (basic seeding)
    console.log(`\nProcessing Reports...`);
    for (const rtgId of Object.keys(rtgIdMap)) {
        const realRtgId = rtgIdMap[rtgId];
        const { error } = await supabase.from('reports').insert({
            rtg_id: realRtgId,
            title: `Rapport ${rtgId}`,
            type: 'inspection',
            status: 'draft'
        });

        if (error) console.error(`❌ Report for ${rtgId}: ${error.message}`);
        else console.log(`✅ Report for ${rtgId}`);
    }

    // 5. Inspections (basic seeding)
    console.log(`\nProcessing Inspections...`);
    for (const rtgId of Object.keys(rtgIdMap)) {
        const realRtgId = rtgIdMap[rtgId];
        const { error } = await supabase.from('inspections').insert({
            rtg_id: realRtgId,
            inspector: 'Admin User',
            status: 'pending',
            notes: `Inspection initiale pour ${rtgId}`
        });

        if (error) console.error(`❌ Inspection for ${rtgId}: ${error.message}`);
        else console.log(`✅ Inspection for ${rtgId}`);
    }

    console.log('\n✨ Seeding Complete!');
};

seed().catch(console.error);
