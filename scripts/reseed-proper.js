import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const clearAndReseed = async () => {
    console.log('🗑️  Clearing existing data...');

    // Delete all data
    await supabase.from('work_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rtgs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('zones').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Data cleared\n');
    console.log('🌱 Seeding with proper data...\n');

    const rtgIdMap = {};

    // Proper RTG data with realistic naming
    const rtgsData = [
        { code: 'RTG 5582a07f-4068-489d-bd52-17860a4d7776', name: 'RTG 5582a07f', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'Completed' },
        { code: 'RTG 6693b18g-5179-590e-ce63-28971b5e8887', name: 'RTG 6693b18g', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'In Progress' },
        { code: 'RTG 7704c29h-6280-601f-df74-39082c6f9998', name: 'RTG 7704c29h', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'Pending' },
        { code: 'RTG 8815d30i-7391-712g-eg85-40193d7g0009', name: 'RTG 8815d30i', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'In Progress' },
        { code: 'RTG 9926e41j-8402-823h-fh96-51204e8h1110', name: 'RTG 9926e41j', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'Pending' },
        { code: 'RTG 0037f52k-9513-934i-gi07-62315f9i2221', name: 'RTG 0037f52k', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'Completed' },
        { code: 'RTG 1148g63l-0624-045j-hj18-73426g0j3332', name: 'RTG 1148g63l', brand: 'KALMAR', capacity: '50/61T', location: 'Terminal 1', status: 'In Progress' }
    ];

    // Seed RTGs
    for (const rtg of rtgsData) {
        const { data, error } = await supabase.from('rtgs').insert({
            name: rtg.code,
            status: rtg.status,
            location: rtg.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).select().single();

        if (error) {
            console.error(`❌ RTG ${rtg.name}: ${error.message}`);
        } else {
            console.log(`✅ RTG ${rtg.name}`);
            rtgIdMap[rtg.code] = data.id;
        }
    }

    // Seed Zones
    const zones = [
        { name: 'Z01 - Columns (COL)' },
        { name: 'Z02 - Crossbeam (XBM)' },
        { name: 'Z03 - Sill Beam (SIL)' },
        { name: 'Z04 - Trolley (TRO)' },
        { name: 'Z05 - Wheel Bogie (BOG)' },
        { name: 'Z06 - E-House Support (EHS)' }
    ];

    console.log('\nSeeding Zones...');
    for (const zone of zones) {
        const { error } = await supabase.from('zones').insert({
            name: zone.name,
            created_at: new Date().toISOString()
        });

        if (error) console.error(`❌ ${zone.name}: ${error.message}`);
        else console.log(`✅ ${zone.name}`);
    }

    // Seed Work Orders
    const workOrderTemplates = [
        { title: 'Lavage Industriel', priority: 'high', status: 'Completed' },
        { title: 'Inspection Corrosion', priority: 'high', status: 'In Progress' },
        { title: 'Sablage SA 2.5', priority: 'high', status: 'Pending' },
        { title: 'Système Peinture PPG', priority: 'medium', status: 'Pending' }
    ];

    console.log('\nSeeding Work Orders...');
    for (const rtgCode of Object.keys(rtgIdMap)) {
        const rtgId = rtgIdMap[rtgCode];
        for (const wo of workOrderTemplates) {
            const { error } = await supabase.from('work_orders').insert({
                rtg_id: rtgId,
                title: wo.title,
                description: `${wo.title} for ${rtgCode}`,
                status: wo.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (error) console.error(`❌ ${wo.title} for ${rtgCode}: ${error.message}`);
        }
    }

    console.log(`✅ Work Orders created for all RTGs`);
    console.log('\n✨ Seeding Complete!');
    console.log('\n📊 Summary:');
    console.log(`   RTGs: ${rtgsData.length}`);
    console.log(`   Zones: ${zones.length}`);
    console.log(`   Work Orders: ${rtgsData.length * workOrderTemplates.length}`);
};

clearAndReseed().catch(console.error);
