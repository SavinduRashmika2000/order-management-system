async function testUsers() {
    try {
        console.log('1. Logging in as admin...');
        const loginRes = await fetch('http://localhost:9090/api/v1/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful! Token:', token.substring(0, 15) + '...');

        console.log('\n2. Creating a test user...');
        const createRes = await fetch('http://localhost:9090/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Agent',
                username: 'test_agent',
                password: 'testPassword',
                role: 'REP'
            })
        });
        const createData = await createRes.json();
        const userId = createData.id;
        console.log('User created:', createData.username, 'ID:', userId);

        console.log('\n3. Logging in as the new test user...');
        const testLogin1 = await fetch('http://localhost:9090/api/v1/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test_agent', password: 'testPassword' })
        });
        console.log('Test user login status:', testLogin1.status === 200 ? 'SUCCESS' : 'FAILED');

        console.log('\n4. Deactivating test user...');
        const deactivateRes = await fetch(`http://localhost:9090/api/v1/users/${userId}/status?status=false`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const deactivateData = await deactivateRes.json();
        console.log('Deactivated user status:', deactivateData.activeStatus);

        console.log('\n5. Attempting to log in as deactivated test user...');
        const testLogin2 = await fetch('http://localhost:9090/api/v1/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test_agent', password: 'testPassword' })
        });
        console.log('Login failed as expected! HTTP Status:', testLogin2.status);
        const errorData = await testLogin2.json();
        console.log('Error Message:', JSON.stringify(errorData));

        console.log('\n6. Reactivating test user...');
        await fetch(`http://localhost:9090/api/v1/users/${userId}/status?status=true`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('User reactivated.');

        console.log('\n7. Attempting to log in as reactivated test user...');
        const testLogin3 = await fetch('http://localhost:9090/api/v1/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test_agent', password: 'testPassword' })
        });
        console.log('Test user login status:', testLogin3.status === 200 ? 'SUCCESS' : 'FAILED');

    } catch (e) {
        console.error('Test Execution Failed:', e);
    }
}

testUsers();
