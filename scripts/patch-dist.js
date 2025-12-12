import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distFile = path.join(__dirname, '../dist/assets/index-ChJD29WZ.js');

console.log('Reading file...');
let content = fs.readFileSync(distFile, 'utf8');

// Find the patched Br function that uses import.meta.env
const startPattern = 'Br=async()=>{try{const t=import.meta.env.VITE_SUPABASE_URL';
const startIndex = content.indexOf(startPattern);

if (startIndex === -1) {
    console.log('❌ Could not find patched Br function');
    process.exit(1);
}

console.log('✅ Found patched Br function at index:', startIndex);

// Find the end
let braceCount = 0;
let inFunction = false;
let endIndex = startIndex;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        inFunction = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }
}

const originalFunction = content.substring(startIndex, endIndex);
console.log('Original function length:', originalFunction.length);

// Hardcode the credentials
const supabaseUrl = 'https://jzpnkvngfxlxklmnmvgk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cG5rdm5nZnhseGtsbW5tdmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjc1MTMsImV4cCI6MjA3OTY0MzUxM30.pOUzUZH9O76_a1aQASDtXUWjQAK_38z2sNcLiXw1z_I';

const replacement = `Br=async()=>{try{const t="${supabaseUrl}",e="${supabaseKey}",r=await fetch(\`\${t}/rest/v1/customers?select=*&order=name.asc\`,{headers:{apikey:e,Authorization:\`Bearer \${e}\`,"Content-Type":"application/json"}});if(!r.ok)throw new Error(\`HTTP error! status: \${r.status}\`);return(await r.json())||[]}catch(t){return console.error("Error fetching customers:",t),[]}}`;

console.log('Replacement function length:', replacement.length);

// Replace
const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

// Write
fs.writeFileSync(distFile, newContent, 'utf8');
console.log('✅ Hardcoded credentials patch applied!');
console.log('File size before:', content.length);
console.log('File size after:', newContent.length);
