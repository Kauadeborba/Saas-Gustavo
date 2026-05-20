// Script para verificar quais tabelas existem no Supabase
const API_URL = 'http://localhost:3000/api';

async function checkTables() {
  console.log('🔍 Verificando tabelas no banco de dados...\n');

  const endpoints = [
    { name: 'Produtos', url: '/api/produtos' },
    { name: 'Categorias', url: '/api/categorias' },
    { name: 'Marcas', url: '/api/marcas' },
    { name: 'Usuários', url: '/api/usuarios' },
    { name: 'Logs de Ações', url: '/api/logs-acoes' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.url}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const status = response.status;
      const data = await response.json();
      
      if (response.ok) {
        const count = data.dados?.length ?? 0;
        console.log(`✅ ${endpoint.name.padEnd(15)} - Status: ${status} - Registros: ${count}`);
      } else {
        console.log(`❌ ${endpoint.name.padEnd(15)} - Status: ${status} - Erro: ${data.erro}`);
      }
    } catch (error) {
      console.log(`⚠️ ${endpoint.name.padEnd(15)} - Erro de conexão: ${error.message}`);
    }
  }
}

checkTables();
