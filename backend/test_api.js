async function test() {
  try {
    console.log("Pinging health...");
    const healthReq = await fetch('http://localhost:5000/health');
    const health = await healthReq.json();
    console.log("Health OK:", health);

    console.log("Testing Login...");
    let loginReq = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@restaurant.com', password: '123456' })
    });
    
    if (loginReq.status !== 200) {
      loginReq = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@restaurant.com', password: '123456' })
      });
    }

    const loginRes = await loginReq.json();
    console.log("Login Status:", loginReq.status === 200 ? 'OK' : 'Failed', loginRes.token ? 'Token Received' : '');
    
    if (!loginRes.token) {
        console.error("Login completely failed, cannot test Settings", loginRes);
        process.exit(1);
    }

    console.log("Testing Settings fetch...");
    const settingsReq = await fetch('http://localhost:5000/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${loginRes.token}` }
    });
    
    const settingsRes = await settingsReq.json();
    console.log("Settings Fetched (Name):", settingsRes.restaurantName);
    
    console.log("Tests Passed!");
    process.exit(0);
  } catch(e) {
    console.error("Test failed:", e.message);
    process.exit(1);
  }
}

test();
