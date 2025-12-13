/**
 * Script to check users in Supabase database
 * Run with: node scripts/check-users.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('\n🔍 Checking Supabase Users Table...\n');
    console.log('Supabase URL:', supabaseUrl);
    console.log('─'.repeat(60));

    try {
        // Get all users from the users table
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, display_name, role, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching users:', error.message);
            console.log('\nPossible causes:');
            console.log('  - RLS policies blocking read access');
            console.log('  - Table "users" does not exist');
            console.log('  - Invalid Supabase credentials');
            return;
        }

        if (!users || users.length === 0) {
            console.log('📭 No users found in the database.');
            return;
        }

        console.log(`\n✅ Found ${users.length} user(s) in database:\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.display_name || 'No Name'}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role || 'No role'}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
            console.log('');
        });

        // Check for specific test user
        const testUser = users.find(u => u.email === 'test@tawzer.com');
        if (testUser) {
            console.log('⚠️  User "test@tawzer.com" still exists in database!');
            console.log('   This means deletion is being blocked by RLS policies.');
        } else {
            console.log('✅ User "test@tawzer.com" is NOT in the database (already deleted or never existed).');
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

// Also check user_customers table
async function checkUserCustomers() {
    console.log('\n🔍 Checking User-Customer Assignments...\n');
    console.log('─'.repeat(60));

    try {
        const { data, error } = await supabase
            .from('user_customers')
            .select(`
                user_id,
                customer_id,
                users(email, display_name),
                customers(name)
            `);

        if (error) {
            console.error('❌ Error fetching user_customers:', error.message);
            return;
        }

        if (!data || data.length === 0) {
            console.log('📭 No user-customer assignments found.');
            return;
        }

        console.log(`\n✅ Found ${data.length} assignment(s):\n`);
        data.forEach((assignment, index) => {
            const userName = assignment.users?.display_name || assignment.users?.email || assignment.user_id;
            const customerName = assignment.customers?.name || assignment.customer_id;
            console.log(`${index + 1}. ${userName} → ${customerName}`);
        });

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

// Run checks
checkUsers().then(() => checkUserCustomers()).then(() => {
    console.log('\n' + '─'.repeat(60));
    console.log('Done.');
    process.exit(0);
});

