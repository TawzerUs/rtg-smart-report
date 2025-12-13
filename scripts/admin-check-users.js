/**
 * Admin script to check and manage users using SERVICE ROLE key
 * This bypasses RLS policies
 * Run with: node scripts/admin-check-users.js
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

// Create admin client with service role (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUsers() {
    console.log('\n🔐 ADMIN CHECK - Using Service Role Key (Bypasses RLS)\n');
    console.log('Supabase URL:', supabaseUrl);
    console.log('─'.repeat(60));

    try {
        // Check users table
        console.log('\n📋 Users Table:');
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.error('❌ Error:', usersError.message);
        } else if (!users || users.length === 0) {
            console.log('   📭 Table is EMPTY - No users exist');
        } else {
            console.log(`   ✅ Found ${users.length} user(s):`);
            users.forEach((u, i) => {
                console.log(`   ${i+1}. ${u.email} (${u.role || 'no role'}) - ID: ${u.id.substring(0,8)}...`);
            });
        }

        // Check Auth users (if admin API available)
        console.log('\n📋 Auth Users (from auth.users):');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.log('   ⚠️ Cannot list auth users:', authError.message);
        } else if (!authData?.users || authData.users.length === 0) {
            console.log('   📭 No Auth users found');
        } else {
            console.log(`   ✅ Found ${authData.users.length} auth user(s):`);
            authData.users.forEach((u, i) => {
                console.log(`   ${i+1}. ${u.email} - Created: ${new Date(u.created_at).toLocaleDateString()}`);
            });
        }

        // Check user_customers
        console.log('\n📋 User-Customer Assignments:');
        const { data: assignments, error: assignError } = await supabaseAdmin
            .from('user_customers')
            .select('*');

        if (assignError) {
            console.log('   ⚠️ Error:', assignError.message);
        } else if (!assignments || assignments.length === 0) {
            console.log('   📭 No assignments found');
        } else {
            console.log(`   ✅ Found ${assignments.length} assignment(s)`);
        }

        // Check customers
        console.log('\n📋 Customers Table:');
        const { data: customers, error: custError } = await supabaseAdmin
            .from('customers')
            .select('id, name')
            .order('name');

        if (custError) {
            console.log('   ⚠️ Error:', custError.message);
        } else if (!customers || customers.length === 0) {
            console.log('   📭 No customers found');
        } else {
            console.log(`   ✅ Found ${customers.length} customer(s):`);
            customers.forEach((c, i) => {
                console.log(`   ${i+1}. ${c.name}`);
            });
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkUsers().then(() => {
    console.log('\n' + '─'.repeat(60));
    console.log('Done.\n');
    process.exit(0);
});

