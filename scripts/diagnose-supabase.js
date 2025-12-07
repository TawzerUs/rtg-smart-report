import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('🔍 Starting Supabase Diagnosis...');
    console.log('--------------------------------');

    // 1. Check Storage Bucket
    console.log('\n📦 Checking Storage Bucket "photos"...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError.message);
    } else {
        const photosBucket = buckets.find(b => b.name === 'photos');
        if (photosBucket) {
            console.log('✅ Bucket "photos" exists.');
            console.log('   Public:', photosBucket.public);
        } else {
            console.error('❌ Bucket "photos" NOT found!');
            console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
        }
    }

    // 2. Check Zones Table Schema (by trying to select image_url)
    console.log('\n📊 Checking "zones" table schema...');
    // We can't directly query schema via JS client easily without admin, 
    // but we can try to select the column from a row.
    const { data: zones, error: zoneError } = await supabase
        .from('zones')
        .select('id, image_url')
        .limit(1);

    if (zoneError) {
        console.error('❌ Error querying "zones":', zoneError.message);
        if (zoneError.message.includes('column "image_url" does not exist')) {
            console.error('   👉 CAUSE: The "image_url" column is missing in the "zones" table.');
        }
    } else {
        console.log('✅ Column "image_url" seems to exist in "zones".');
    }

    // 3. Check Coating Control Table Schema
    console.log('\n📊 Checking "coating_control" table schema...');
    const { data: coating, error: coatingError } = await supabase
        .from('coating_control')
        .select('id, images')
        .limit(1);

    if (coatingError) {
        console.error('❌ Error querying "coating_control":', coatingError.message);
        if (coatingError.message.includes('relation "coating_control" does not exist')) {
            console.error('   👉 CAUSE: The "coating_control" table is missing.');
        } else if (coatingError.message.includes('column "images" does not exist')) {
            console.error('   👉 CAUSE: The "images" column is missing in "coating_control".');
        }
    } else {
        console.log('✅ Column "images" seems to exist in "coating_control".');
    }

    console.log('\n--------------------------------');
    console.log('Diagnosis Complete.');
}

diagnose();
