/**
 * Admin script to properly delete a user
 * Deletes from both 'users' table AND auth.users (prevents login)
 * 
 * Usage: node scripts/delete-user.js <email>
 * Example: node scripts/delete-user.js test@tawzer.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials in .env file');
    console.log('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/delete-user.js <email>');
    console.log('Example: node scripts/delete-user.js test@tawzer.com');
    process.exit(1);
}

// Create admin client with service role (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function deleteUser(email) {
    console.log(`\n🗑️  Deleting user: ${email}\n`);
    console.log('─'.repeat(60));

    try {
        // Step 1: Find the user in auth.users
        const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
            throw new Error(`Failed to list auth users: ${listError.message}`);
        }

        const authUser = authData?.users?.find(u => u.email === email);
        
        if (!authUser) {
            console.log(`⚠️  User ${email} not found in auth.users`);
        } else {
            console.log(`✅ Found auth user: ${authUser.id}`);
        }

        // Step 2: Find user in users table
        const { data: dbUser, error: dbFindError } = await supabaseAdmin
            .from('users')
            .select('id, email, display_name')
            .eq('email', email)
            .single();

        if (dbFindError && dbFindError.code !== 'PGRST116') {
            console.log(`⚠️  Error finding user in DB: ${dbFindError.message}`);
        } else if (!dbUser) {
            console.log(`⚠️  User ${email} not found in users table`);
        } else {
            console.log(`✅ Found DB user: ${dbUser.id} (${dbUser.display_name || 'no name'})`);
        }

        const userId = authUser?.id || dbUser?.id;

        if (!userId) {
            console.log(`\n❌ User ${email} does not exist in either table.`);
            return;
        }

        // Step 3: Delete user_customers assignments
        console.log('\n🔄 Deleting user-customer assignments...');
        const { error: assignError } = await supabaseAdmin
            .from('user_customers')
            .delete()
            .eq('user_id', userId);

        if (assignError) {
            console.log(`   ⚠️  ${assignError.message}`);
        } else {
            console.log('   ✅ Assignments deleted');
        }

        // Step 4: Delete from users table
        console.log('🔄 Deleting from users table...');
        const { error: dbDeleteError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbDeleteError) {
            console.log(`   ⚠️  ${dbDeleteError.message}`);
        } else {
            console.log('   ✅ Deleted from users table');
        }

        // Step 5: Delete from auth.users (this prevents login!)
        if (authUser) {
            console.log('🔄 Deleting from auth.users (prevents login)...');
            const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);

            if (authDeleteError) {
                console.log(`   ❌ ${authDeleteError.message}`);
            } else {
                console.log('   ✅ Deleted from auth.users - User can no longer log in!');
            }
        }

        console.log('\n' + '─'.repeat(60));
        console.log(`✅ User ${email} has been completely deleted.`);
        console.log('   - Removed from users table');
        console.log('   - Removed from auth.users (cannot login)');
        console.log('   - Removed customer assignments');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }
}

deleteUser(email).then(() => {
    console.log('\nDone.\n');
    process.exit(0);
});

