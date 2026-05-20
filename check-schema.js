// Inspecionar schema das tabelas
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Verificando schema das tabelas...\n');

  try {
    // Tentar vários nomes de coluna para marcar
    const testColumns = ['nome', 'name', 'marca', 'titulo', 'title'];
    
    for (const col of testColumns) {
      console.log(`Testando coluna "${col}" em marcas...`);
      const { data, error } = await supabase
        .from('marcas')
        .select(col)
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${error.message}`);
      } else {
        console.log(`  ✅ Coluna "${col}" existe! Dados:`, data);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

checkSchema();
