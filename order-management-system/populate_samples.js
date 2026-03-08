// script to add sample orders for admin and rep
const BASE = 'http://localhost:9090/api/v1';

async function login(username, password) {
    const res = await fetch(`${BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

async function run() {
    console.log('Logging in as admin...');
    const admin = await login('admin', 'password');
    const adminToken = admin.token;
    const adminId = admin.userId;

    console.log('Logging in as rep...');
    const rep = await login('test_agent', 'testPassword');
    const repToken = rep.token;
    const repId = rep.userId;

    const authHeader = (token) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    // Get customers and products
    const customersRes = await fetch(`${BASE}/customers`, { headers: authHeader(adminToken) });
    const customers = await customersRes.json();
    const activeCustomers = customers.filter(c => c.active);

    const productsRes = await fetch(`${BASE}/products/active`, { headers: authHeader(adminToken) });
    const products = await productsRes.json();

    if (activeCustomers.length < 1 || products.length < 2) {
        console.log('Not enough data to create samples');
        return;
    }

    // Create an order for Admin
    console.log('Creating sample order for Admin...');
    await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: authHeader(adminToken),
        body: JSON.stringify({
            orderNo: 'ORD-ADMIN-001',
            status: 'CONFIRM',
            user: { id: adminId },
            customer: { id: activeCustomers[0].id },
            orderItems: [
                { product: { id: products[0].id }, quantity: 5, price: products[0].price }
            ]
        })
    });

    // Create an order for Rep
    console.log('Creating sample order for Rep...');
    await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: authHeader(repToken),
        body: JSON.stringify({
            orderNo: 'ORD-REP-001',
            status: 'PENDING',
            user: { id: repId },
            customer: { id: activeCustomers[0].id },
            orderItems: [
                { product: { id: products[1].id }, quantity: 10, price: products[1].price }
            ]
        })
    });

    console.log('Sample orders created successfully!');
}

run().catch(console.error);
