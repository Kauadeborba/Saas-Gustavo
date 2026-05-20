const fs = require('fs');
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

async function discoverSchema() {
  console.log('🔍 Descobrindo schema da tabela produtos...\n');
  
  // Tentar vários nomes de coluna possíveis
  const possibleColumns = [
    'nome', 'name', 'product_name', 'titulo', 'title',
    'descricao', 'description', 'desc',
    'preco', 'price', 'valor',
    'quantidade', 'quantity', 'qtd',
    'categoria', 'category', 'categoria_id', 'category_id',
    'marca', 'brand', 'marca_id', 'brand_id',
    'condicao', 'condition',
    'status',
    'publicado', 'published', 'is_published',
    'especificacoes', 'specifications',
    'modelo', 'model',
    'preco_custo', 'cost_price', 'costPrice',
    'observacoes_internas', 'internal_notes', 'internalNotes',
    'imagem_url', 'image_url', 'imageUrl'
  ];

  console.log('Testando colunas na tabela produtos:\n');
  
  const foundColumns = [];
  
  for (const col of possibleColumns) {
    const { data, error } = await supabase
      .from('produtos')
      .select(col)
      .limit(1);
    
    if (!error) {
      foundColumns.push(col);
      console.log(`✅ ${col}`);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`Colunas encontradas (${foundColumns.length}):`, foundColumns.join(', '));
}

discoverSchema();
