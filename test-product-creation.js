const http = require('http');

const produtoData = {
  nome: 'Test Notebook',
  descricao: 'Notebook de teste',
  especificacoes: 'Intel i5, 8GB RAM',
  categoria: 'Notebooks',
  brand: 'Dell',
  modelo: 'Inspiron 15',
  preco: 2500,
  preco_custo: 1500,
  condicao: 'novo',
  status: 'disponivel',
  quantidade: 5,
  publicado: true,
  observacoes_internas: 'Teste',
  imagem_url: 'https://example.com/image.jpg'
};

const data = JSON.stringify(produtoData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/produtos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('📤 Enviando POST /api/produtos');
console.log('📦 Dados:', JSON.stringify(produtoData, null, 2));
console.log('');

const req = http.request(options, (res) => {
  let body = '';
  console.log(`Status: ${res.statusCode}\n`);
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('📥 Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('📥 Response (raw):', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro:', error.message);
});

req.write(data);
req.end();
