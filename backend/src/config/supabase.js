const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

const usingServiceRole = !!supabaseServiceKey;
console.log(`Supabase client: ${usingServiceRole ? 'service_role' : 'anon'} key`);

const adminClient = usingServiceRole
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : anonClient;

module.exports = adminClient;
