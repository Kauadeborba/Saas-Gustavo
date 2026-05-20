// Script para inspecionar a estrutura das tabelas no Supabase
// Execute este script para descobrir os nomes reais das colunas

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Ler .env.local manualmente
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTables() {
  console.log('🔍 Inspecionando tabelas do Supabase...\n');

  try {
    // Tentar listar dados de categorias
    console.log('📋 Tabela: categorias');
    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .select('*')
      .limit(1);
    
    if (catError) {
      console.log(`   ❌ Erro: ${catError.message}`);
    } else {
      if (categorias && categorias.length > 0) {
        console.log(`   ✅ Colunas encontradas:`, Object.keys(categorias[0]));
      } else {
        console.log(`   ℹ️  Tabela vazia (estrutura não pode ser inspecionada)`);
      }
    }

    // Tentar listar dados de marcas
    console.log('\n📋 Tabela: marcas');
    const { data: marcas, error: marcError } = await supabase
      .from('marcas')
      .select('*')
      .limit(1);
    
    if (marcError) {
      console.log(`   ❌ Erro: ${marcError.message}`);
    } else {
      if (marcas && marcas.length > 0) {
        console.log(`   ✅ Colunas encontradas:`, Object.keys(marcas[0]));
      } else {
        console.log(`   ℹ️  Tabela vazia (estrutura não pode ser inspecionada)`);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

inspectTables();
