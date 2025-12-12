import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Fallback if .env is not loaded automatically
if (!process.env.VITE_SUPABASE_URL) {
    try {
        const envConfig = dotenv.parse(fs.readFileSync('.env'));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } catch (e) {
        console.warn('Could not load .env file directly', e);
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EMAIL = 'Jalal.Lemoukh@eurogate-tanger.com';
const PASSWORD = 'Eurogate2025!';
const CUSTOMER_NAME_QUERY = 'Eurogate'; // Search for Eurogate

async function main() {
    console.log(`🚀 Starting account creation for ${EMAIL}...`);

    // 1. Find Eurogate Customer ID
    console.log(`\n🔍 Finding customer "${CUSTOMER_NAME_QUERY}"...`);
    const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .ilike('name', `%${CUSTOMER_NAME_QUERY}%`);

    if (customerError) {
        console.error('❌ Error fetching customers:', customerError.message);
        return;
    }

    if (!customers || customers.length === 0) {
        console.error(`❌ Customer matching "${CUSTOMER_NAME_QUERY}" not found.`);
        return;
    }

    const eurogate = customers[0];
    console.log(`✅ Found Customer: ${eurogate.name} (${eurogate.id})`);

    // 2. Create User (Sign Up)
    console.log(`\n👤 Creating user account...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: EMAIL,
        password: PASSWORD,
    });

    if (authError) {
        console.error('❌ Error creating user:', authError.message);
        // Continue if user already exists to ensure assignment?
        // If "User already registered", we might want to just proceed to assignment.
        if (!authError.message.includes('already registered')) {
            return;
        }
        console.log('⚠️ User might already exist, attempting to fetch user ID...');
    }

    // If signup successful, authData.user is populated.
    // If user already exists, we might need to sign in to get the ID, or just fail instructions.
    // Since I don't have the user's password if they already exist, I can't easily get their ID unless I'm admin.
    // But let's assume this is a new user or I just created them.

    let userId = authData?.user?.id;
    let userEmail = authData?.user?.email;

    if (!userId) {
        // Attempt sign in to get ID (if we just created it or know the password)
        console.log('🔄 Attempting to sign in to get User ID...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: EMAIL,
            password: PASSWORD,
        });

        if (signInError) {
            console.error('❌ Could not sign in to retrieve User ID:', signInError.message);
            return;
        }
        userId = signInData.user.id;
        userEmail = signInData.user.email;
    }

    console.log(`✅ User ID: ${userId}`);

    // 3. Create/Update User Profile in 'users' table
    console.log(`\n📝 Updating user profile...`);
    const { error: profileError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: userEmail,
            display_name: 'Jalal Lemoukh',
            role: 'viewer', // Start as viewer, assignment gives access
            created_at: new Date().toISOString()
        });

    if (profileError) {
        console.error('❌ Error updating user profile:', profileError.message);
        // Not fatal, might exist
    } else {
        console.log('✅ User profile updated.');
    }

    // 4. Assign to Customer
    console.log(`\n🔗 Assigning user to ${eurogate.name}...`);

    // Check if assignment exists
    const { data: existingAssignment } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', userId)
        .eq('customer_id', eurogate.id)
        .single();

    if (existingAssignment) {
        console.log('⚠️ User is already assigned to this customer.');
    } else {
        const { error: assignError } = await supabase
            .from('user_customers')
            .insert({
                user_id: userId,
                customer_id: eurogate.id,
                role: 'viewer' // Can be viewer or operator
            });

        if (assignError) {
            console.error('❌ Error assigning user to customer:', assignError.message);
        } else {
            console.log(`✅ Successfully assigned ${EMAIL} to ${eurogate.name}!`);
        }
    }

    console.log('\n🎉 Done!');
    console.log(`📧 Email: ${EMAIL}`);
    console.log(`🔑 Password: ${PASSWORD}`);
}

main();
