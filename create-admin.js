const http = require('http');

const data = JSON.stringify({
  nome: "Kauã pereira",
  email: "kaua.b.pereira2006@gmail.com",
  senha: "Kaua2006@",
  tipo: "admin"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/usuarios',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', body);
  });
});

req.on('error', (error) => {
  console.error('Erro de conexão:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Timeout na requisição');
  req.destroy();
  process.exit(1);
});

req.write(data);
req.end();

setTimeout(() => {
  console.log('Timeout: nenhuma resposta');
  process.exit(1);
}, 5000);
