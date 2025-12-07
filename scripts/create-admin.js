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

const createAdmin = async () => {
    console.log('Creating admin user...');

    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@tawzer.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
            display_name: 'Admin User'
        }
    });

    if (authError) {
        console.error('Auth Error:', authError.message);
        // If user exists, try to get their ID
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === 'admin@tawzer.com');
        if (existingUser) {
            console.log('User already exists:', existingUser.id);
            // Update user document
            const { error: updateError } = await supabase
                .from('users')
                .upsert({
                    id: existingUser.id,
                    email: 'admin@tawzer.com',
                    display_name: 'Admin User',
                    role: 'admin',
                    created_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (updateError) console.error('Update Error:', updateError.message);
            else console.log('✅ Admin role updated successfully!');
        }
        return;
    }

    console.log('✅ User created:', authData.user.id);

    // 2. Create/Update user document in users table
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            id: authData.user.id,
            email: 'admin@tawzer.com',
            display_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (dbError) {
        console.error('DB Error:', dbError.message);
    } else {
        console.log('✅ Admin user created successfully!');
    }
};

createAdmin().catch(console.error);
