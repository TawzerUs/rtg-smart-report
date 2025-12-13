/**
 * Script to check RTG 21 painting data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    console.log('\n🔍 Checking RTG 21 Painting Data...\n');

    // Get RTG 21
    const { data: rtg21, error: rtgError } = await supabase
        .from('rtgs')
        .select('*')
        .eq('name', 'RTG 21')
        .single();

    if (rtgError) {
        console.error('❌ RTG 21 not found:', rtgError.message);
        return;
    }

    console.log('✅ RTG 21 found:');
    console.log('   ID:', rtg21.id);
    console.log('   Name:', rtg21.name);
    console.log('   Status:', rtg21.status);

    // Get painting systems for RTG 21
    console.log('\n📋 Painting Systems for RTG 21:');
    const { data: painting, error: paintError } = await supabase
        .from('painting_systems')
        .select('*')
        .eq('rtg_id', rtg21.id);

    if (paintError) {
        console.error('❌ Error:', paintError.message);
        return;
    }

    if (!painting || painting.length === 0) {
        console.log('   📭 No painting systems found for RTG 21');
    } else {
        console.log(`   ✅ Found ${painting.length} system(s):`);
        painting.forEach((p, i) => {
            console.log(`\n   System ${i + 1}:`);
            Object.entries(p).forEach(([key, value]) => {
                console.log(`      ${key}: ${JSON.stringify(value)}`);
            });
        });
    }

    // Check table structure
    console.log('\n📋 Painting Systems Table Columns:');
    const { data: sample } = await supabase
        .from('painting_systems')
        .select('*')
        .limit(1);

    if (sample && sample[0]) {
        console.log('   Columns:', Object.keys(sample[0]).join(', '));
    }
}

check().then(() => {
    console.log('\nDone.\n');
    process.exit(0);
});

