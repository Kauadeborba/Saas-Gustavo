const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function testCategorias() {
  console.log('Testando colunas em categorias...\n');
  
  const testColumns = ['nome', 'name', 'categoria', 'titulo', 'title'];
  
  for (const col of testColumns) {
    const { data, error } = await supabase
      .from('categorias')
      .select(col)
      .limit(1);
    
    if (!error) {
      console.log(`✅ Coluna em categorias: "${col}"`);
      process.exit(0);
    }
  }
  
  console.log('❌ Nenhuma coluna encontrada');
}

testCategorias();
