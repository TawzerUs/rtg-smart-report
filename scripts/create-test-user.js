import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const createTestUser = async () => {
    console.log('Creating test user...');

    const email = 'test@tawzer.com';
    const password = 'test123456';

    // 1. Delete existing user if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find(u => u.email === email);

    if (existingUser) {
        console.log('Deleting existing test user...');
        await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // 2. Create new user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            display_name: 'Test User'
        }
    });

    if (authError) {
        console.error('❌ Auth Error:', authError.message);
        return;
    }

    console.log('✅ User created in Auth:', authData.user.id);

    // 3. Create user document in users table
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            id: authData.user.id,
            email,
            display_name: 'Test User',
            role: 'admin',
            created_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (dbError) {
        console.error('❌ DB Error:', dbError.message);
    } else {
        console.log('✅ User document created in database');
        console.log('\n📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Role: admin');
        console.log('\n🌐 Login at: https://yooryka.web.app/login');
    }
};

createTestUser().catch(console.error);
