const API_URL = 'http://localhost:3000/api/trpc';

async function testLogin() {
  try {
    console.log('🔐 Testando login com R2PB...\n');
    
    // Testar login
    const loginRes = await fetch(`${API_URL}/auth.loginWithPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          email: 'clovisart@hotmail.com',
          password: 'PG13Ek9FTaG5'
        }
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Resposta de login:', JSON.stringify(loginData, null, 2));
    
    if (loginData.result?.data?.success) {
      console.log('\n✅ ✅ ✅ LOGIN FUNCIONANDO! ✅ ✅ ✅');
      console.log('Usuário conseguiu fazer login!');
      console.log('Dados do usuário:', loginData.result.data.user);
    } else {
      console.error('\n❌ Login falhou:', loginData.result?.data?.error || loginData.error);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testLogin();
