const http = require('http');

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': data.length })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`\n${method} ${path}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Erro: ${error.message}`);
      resolve();
    });

    if (data) req.write(data);
    req.end();
  });
}

async function debug() {
  console.log('🔍 Testando endpoints...\n');
  
  await testEndpoint('/api/categorias', 'GET');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testEndpoint('/api/marcas', 'GET');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testEndpoint('/api/categorias', 'POST', { nome: 'Test Categoria' });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testEndpoint('/api/marcas', 'POST', { nome: 'Test Marca' });
}

debug();
