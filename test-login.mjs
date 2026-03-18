const API_URL = 'http://localhost:3000/api/trpc';

async function createUserAndTest() {
  try {
    console.log('1️⃣ Criando novo usuário R2PB...');
    
    // Criar usuário via API
    const createRes = await fetch(`${API_URL}/admin.createUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          nome: 'Clovis Art',
          email: 'clovisart@hotmail.com',
          tenantId: 1,
          role: 'admin'
        }
      })
    });
    
    const createData = await createRes.json();
    console.log('Resposta de criação:', JSON.stringify(createData, null, 2));
    
    if (!createData.result?.data?.password) {
      console.error('❌ Erro: Senha não foi retornada!');
      return;
    }
    
    const tempPassword = createData.result.data.password;
    console.log(`✅ Usuário criado! Senha: ${tempPassword}`);
    
    // Aguardar um pouco para garantir que foi salvo no banco
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\n2️⃣ Testando login com a senha...');
    
    // Testar login
    const loginRes = await fetch(`${API_URL}/auth.loginWithPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          email: 'clovisart@hotmail.com',
          password: tempPassword
        }
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Resposta de login:', JSON.stringify(loginData, null, 2));
    
    if (loginData.result?.data?.success) {
      console.log('✅ LOGIN FUNCIONANDO! Usuário conseguiu fazer login!');
      console.log('Usuário:', loginData.result.data.user);
    } else {
      console.error('❌ Login falhou:', loginData.result?.data?.error);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

createUserAndTest();
