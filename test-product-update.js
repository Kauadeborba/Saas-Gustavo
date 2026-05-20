// Teste de atualização de produto
const API_URL = 'http://localhost:3000/api';

async function testUpdateProduct() {
  // Usar o ID do produto que acabamos de criar
  const productId = '24382980-cab3-46f0-922c-fec252cebabf';
  
  const updateData = {
    preco: 2750.50, // Alterar o preço com vírgula
  };

  console.log('📤 Enviando PATCH /api/produtos/' + productId);
  console.log('📦 Dados:', updateData);

  try {
    const response = await fetch(`${API_URL}/produtos/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('📥 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUpdateProduct();
