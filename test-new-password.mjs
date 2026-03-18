const API_URL = 'http://localhost:3000/api/trpc';

async function testLogin() {
  try {
    console.log('🔐 Testando login com nova senha...\n');
    
    // Testar login
    const loginRes = await fetch(`${API_URL}/auth.loginWithPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          email: 'clovisart@hotmail.com',
          password: 'cVSt5wjYU*EV'
        }
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Resposta:', JSON.stringify(loginData, null, 2));
    
    if (loginData.result?.data?.success) {
      console.log('\n✅ ✅ ✅ LOGIN FUNCIONANDO! ✅ ✅ ✅');
      console.log('Usuário conseguiu fazer login!');
    } else {
      console.error('\n❌ Login falhou');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testLogin();
