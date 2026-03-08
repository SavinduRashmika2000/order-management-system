// script to verify filtered stats and revenue logic
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

    console.log('Logging in as rep...');
    const rep = await login('test_agent', 'testPassword');
    const repToken = rep.token;
    const repId = rep.userId;

    const authHeader = (token) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    // 1. Get Admin Stats
    console.log('\n--- Admin Stats (Global) ---');
    const adminStatsRes = await fetch(`${BASE}/dashboard/stats`, { headers: authHeader(adminToken) });
    const adminStats = await adminStatsRes.json();
    console.log('Admin Stats:', JSON.stringify(adminStats));

    // 2. Get Rep Stats
    console.log('\n--- Rep Stats (Filtered by ID) ---');
    const repStatsRes = await fetch(`${BASE}/dashboard/stats?userId=${repId}`, { headers: authHeader(repToken) });
    const repStats = await repStatsRes.json();
    console.log('Rep Stats:', JSON.stringify(repStats));

    // 3. Verification
    console.log('\n--- Verification ---');
    console.log('Rep Revenue should only include CONFIRM orders for that Rep.');
    console.log('Admin Revenue should include all CONFIRM orders from all users.');

    // Create a new order for Admin and set to CONFIRM to see revenue change
    const custRes = await fetch(`${BASE}/customers`, { headers: authHeader(adminToken) });
    const customers = await custRes.json();
    const prodRes = await fetch(`${BASE}/products/active`, { headers: authHeader(adminToken) });
    const products = await prodRes.json();

    console.log('\nCreating a CONFIRM order for Admin to test revenue...');
    const createOrderRes = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: authHeader(adminToken),
        body: JSON.stringify({
            orderNo: 'VERIFY-REV-' + Date.now(),
            status: 'CONFIRM',
            user: { id: admin.userId },
            customer: { id: customers[0].id },
            orderItems: [{ product: { id: products[0].id }, quantity: 1, price: 1000 }]
        })
    });
    const newOrder = await createOrderRes.json();
    console.log('Order created with ID:', newOrder.id, 'Status:', newOrder.status, 'Price:', newOrder.totalPrice);

    // Get Admin Stats again
    const adminStats2Res = await fetch(`${BASE}/dashboard/stats`, { headers: authHeader(adminToken) });
    const adminStats2 = await adminStats2Res.json();
    console.log('New Admin Revenue:', adminStats2.revenue);

    if (adminStats2.revenue > adminStats.revenue) {
        console.log('SUCCESS: Admin revenue increased with a new CONFIRM order!');
    } else {
        console.log('FAILURE: Admin revenue did not increase.');
    }

    // Check Rep stats again (should NOT have changed)
    const repStats2Res = await fetch(`${BASE}/dashboard/stats?userId=${repId}`, { headers: authHeader(repToken) });
    const repStats2 = await repStats2Res.json();
    console.log('New Rep Revenue:', repStats2.revenue);

    if (repStats2.revenue === repStats.revenue) {
        console.log('SUCCESS: Rep revenue stayed the same (order was for Admin)!');
    } else {
        console.log('FAILURE: Rep revenue changed incorrectly.');
    }
}

run().catch(console.error);
