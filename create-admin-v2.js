const http = require('http');

// Credenciais do admin
const email = "admin@saas.com";
const senha = "Admin@2024";
const nome = "Administrador";

const data = JSON.stringify({
  nome: nome,
  email: email,
  senha: senha,
  tipo: "admin"
});

console.log('📝 Criando usuário admin:');
console.log('   Email:', email);
console.log('   Senha:', senha);
console.log('   Nome:', nome);
console.log('');

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
  console.log(`📨 Status da resposta: ${res.statusCode}`);
  console.log(`📦 Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('');
    console.log('📥 Resposta completa:');
    console.log(body);
    
    try {
      const json = JSON.parse(body);
      if (json.sucesso) {
        console.log('');
        console.log('✅ SUCESSO! Usuário admin criado!');
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('📧 EMAIL:', email);
        console.log('🔐 SENHA:', senha);
        console.log('═══════════════════════════════════════');
      } else {
        console.log('');
        console.log('❌ Erro:', json.erro);
        console.log('   Detalhe:', json.detalhe);
      }
    } catch (e) {
      console.log('⚠️  Não foi possível fazer parse da resposta');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
  console.log('');
  console.log('💡 Certifique-se de que o servidor está rodando: pnpm dev');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Timeout na requisição');
  req.destroy();
  process.exit(1);
});

req.write(data);
req.end();

setTimeout(() => {
  console.log('❌ Timeout: nenhuma resposta após 5 segundos');
  process.exit(1);
}, 5000);
