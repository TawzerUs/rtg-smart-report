/**
 * Script to check painting systems data in Supabase
 * Run with: node scripts/check-painting-data.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkData() {
    console.log('\n🔍 Checking Painting Data...\n');
    console.log('─'.repeat(60));

    // Check RTGs
    console.log('\n📋 RTGs:');
    const { data: rtgs, error: rtgError } = await supabase
        .from('rtgs')
        .select('id, name, status, project_id')
        .order('name');

    if (rtgError) {
        console.error('   ❌ Error:', rtgError.message);
    } else if (!rtgs || rtgs.length === 0) {
        console.log('   📭 No RTGs found');
    } else {
        console.log(`   ✅ Found ${rtgs.length} RTG(s):`);
        rtgs.forEach(r => console.log(`      - ${r.name} (ID: ${r.id.substring(0,8)}...)`));
    }

    // Check painting_systems table
    console.log('\n📋 Painting Systems:');
    const { data: painting, error: paintError } = await supabase
        .from('painting_systems')
        .select('*');

    if (paintError) {
        console.error('   ❌ Error:', paintError.message);
    } else if (!painting || painting.length === 0) {
        console.log('   📭 No painting systems found - TABLE IS EMPTY');
    } else {
        console.log(`   ✅ Found ${painting.length} painting system(s):`);
        painting.forEach(p => {
            console.log(`      - RTG: ${p.rtg_id?.substring(0,8) || 'N/A'}, Zone: ${p.zone_code}, Type: ${p.type}`);
        });
    }

    // Check zones table
    console.log('\n📋 Zones:');
    const { data: zones, error: zoneError } = await supabase
        .from('zones')
        .select('id, code, name, type');

    if (zoneError) {
        console.error('   ❌ Error:', zoneError.message);
    } else if (!zones || zones.length === 0) {
        console.log('   📭 No zones found');
    } else {
        console.log(`   ✅ Found ${zones.length} zone(s):`);
        zones.slice(0, 10).forEach(z => console.log(`      - ${z.code}: ${z.name} (${z.type})`));
        if (zones.length > 10) console.log(`      ... and ${zones.length - 10} more`);
    }

    // List all tables to see what exists
    console.log('\n📋 Available Tables:');
    const { data: tables, error: tableError } = await supabase
        .rpc('get_tables')
        .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

    if (tableError || !tables) {
        // Fallback: try to query known tables
        const knownTables = ['rtgs', 'painting_systems', 'zones', 'work_orders', 'coating_controls', 'inspections'];
        for (const table of knownTables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (!error) {
                console.log(`   - ${table}: ${count || 0} rows`);
            } else {
                console.log(`   - ${table}: ❌ ${error.message}`);
            }
        }
    }

    console.log('\n' + '─'.repeat(60));
}

checkData().then(() => {
    console.log('Done.\n');
    process.exit(0);
});

