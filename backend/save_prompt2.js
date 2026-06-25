require('dotenv').config({ path: 'E:\\automation\\backend\\.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const c = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const prompt = fs.readFileSync('C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\samit_prompt_v2.txt', 'utf8');
c.from('users').update({ ai_prompt: prompt }).eq('id', 'f74b7cb7-52a2-4e83-8ec2-cc933072ec9f')
  .then(({ error }) => { if (error) console.error('Error:', error.message); else console.log('V2 prompt saved!'); });
