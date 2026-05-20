const http = require('http');

const categorias = [
  'Notebooks',
  'Desktops',
  'Tablets',
  'Smartphones',
  'Periféricos',
  'Acessórios',
  'Monitores',
  'Impressoras',
  'Outros'
];

const marcas = [
  'Dell',
  'HP',
  'Lenovo',
  'ASUS',
  'Acer',
  'Apple',
  'Samsung',
  'LG',
  'Intel',
  'AMD'
];

async function seed() {
  console.log('🌱 Iniciando seed de categorias e marcas...\n');
  
  // Verificar se o servidor está rodando
  console.log('🔍 Verificando conexão com o servidor...');
  const serverRunning = await new Promise((resolve) => {
    const testReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, () => {
      console.log('✅ Servidor detectado\n');
      resolve(true);
    });
    
    testReq.on('error', () => {
      console.log('❌ ERRO: Servidor não está rodando!\n');
      console.log('Execute em outro terminal: pnpm dev\n');
      resolve(false);
    });
    
    testReq.end();
    setTimeout(() => resolve(false), 2000);
  });
  
  if (!serverRunning) {
    return;
  }

  for (const categoria of categorias) {
    await createCategoria(categoria);
  }

  console.log('');

  for (const marca of marcas) {
    await createMarca(marca);
  }

  console.log('\n✅ Seed concluído!');
}

function createCategoria(nome) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ nome });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/categorias',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      console.log(`   📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`   📦 Resposta: ${body || '(vazio)'}`);
        try {
          if (!body) {
            console.log(`⚠️  Categoria "${nome}": resposta vazia do servidor`);
            resolve();
            return;
          }
          
          const json = JSON.parse(body);
          if (json.sucesso) {
            console.log(`✅ Categoria "${nome}" criada\n`);
          } else {
            console.log(`⚠️  Categoria "${nome}": ${json.erro || json.detalhe || 'erro desconhecido'}\n`);
          }
        } catch (e) {
          console.log(`⚠️  Categoria "${nome}": erro ao fazer parse - ${e.message}\n`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro de conexão ao criar categoria "${nome}":`, error.message);
      console.error('   Certifique-se de que o servidor está rodando: pnpm dev\n');
      resolve();
    });

    req.write(data);
    req.end();

    setTimeout(() => resolve(), 1000);
  });
}

function createMarca(nome) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ nome });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/marcas',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      console.log(`   📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`   📦 Resposta: ${body || '(vazio)'}`);
        try {
          if (!body) {
            console.log(`⚠️  Marca "${nome}": resposta vazia do servidor`);
            resolve();
            return;
          }
          
          const json = JSON.parse(body);
          if (json.sucesso) {
            console.log(`✅ Marca "${nome}" criada\n`);
          } else {
            console.log(`⚠️  Marca "${nome}": ${json.erro || json.detalhe || 'erro desconhecido'}\n`);
          }
        } catch (e) {
          console.log(`⚠️  Marca "${nome}": erro ao fazer parse - ${e.message}\n`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro de conexão ao criar marca "${nome}":`, error.message);
      console.error('   Certifique-se de que o servidor está rodando: pnpm dev\n');
      resolve();
    });

    req.write(data);
    req.end();

    setTimeout(() => resolve(), 1000);
  });
}

seed().catch(console.error);
