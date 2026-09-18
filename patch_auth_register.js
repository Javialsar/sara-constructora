const fs = require('fs');

let c = fs.readFileSync('src/app/actions/auth.ts', 'utf8');

const regex = /\/\/ 2\. Insert into clientes table using admin client \(bypass RLS\)[\s\S]*?return \{ success: true \}/;

const replacement = `// 2. Insert is now handled automatically by the Supabase Postgres Trigger on_auth_user_created
  // No need to manually insert into clientes here.

  return { success: true }`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/app/actions/auth.ts', c);
console.log('Fixed auth.ts');
