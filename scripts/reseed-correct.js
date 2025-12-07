import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getDemoState } from '../src/utils/demoData.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const reseedWithCorrectData = async () => {
    console.log('🗑️  Clearing existing data...');

    // Delete all data
    await supabase.from('work_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rtgs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('zones').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Data cleared\n');
    console.log('🌱 Seeding with correct RTG data from demoData.js...\n');

    const demoData = getDemoState();
    const rtgIdMap = {};

    // Seed RTGs with correct names
    console.log('Seeding RTGs...');
    for (const rtg of demoData.rtgs) {
        const { data, error } = await supabase.from('rtgs').insert({
            name: rtg.name,
            status: rtg.status,
            location: rtg.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).select().single();

        if (error) {
            console.error(`❌ ${rtg.name}: ${error.message}`);
        } else {
            console.log(`✅ ${rtg.name} -> ${data.id}`);
            rtgIdMap[rtg.id] = data.id;
        }
    }

    // Seed Zones
    console.log('\nSeeding Zones...');
    for (const zone of demoData.zones) {
        const { error } = await supabase.from('zones').insert({
            name: zone.name,
            created_at: new Date().toISOString()
        });

        if (error) console.error(`❌ ${zone.name}: ${error.message}`);
        else console.log(`✅ ${zone.name}`);
    }

    // Seed Work Orders
    console.log('\nSeeding Work Orders...');
    for (const wo of demoData.workOrders) {
        const realRtgId = rtgIdMap[wo.rtgId];
        if (!realRtgId) {
            console.warn(`⚠️  Skipping ${wo.title} - RTG ${wo.rtgId} not found`);
            continue;
        }

        const { error } = await supabase.from('work_orders').insert({
            rtg_id: realRtgId,
            title: wo.title,
            description: `${wo.title} for ${wo.rtgId}`,
            status: wo.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (error) console.error(`❌ ${wo.title} for ${wo.rtgId}: ${error.message}`);
    }

    console.log('\n✨ Seeding Complete!');
    console.log('\n📊 Summary:');
    console.log(`   RTGs: ${demoData.rtgs.length}`);
    console.log(`   Zones: ${demoData.zones.length}`);
    console.log(`   Work Orders: ${demoData.workOrders.length}`);
    console.log('\n📋 RTG Names:');
    demoData.rtgs.forEach(rtg => console.log(`   - ${rtg.name} (${rtg.status})`));
};

reseedWithCorrectData().catch(console.error);
