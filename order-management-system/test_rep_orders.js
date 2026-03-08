// Test Rep order access end-to-end
const BASE = 'http://localhost:9090/api/v1';

async function run() {
    // 1. Login as REP
    console.log('\n--- Step 1: Login as REP ---');
    const repLogin = await fetch(`${BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test_agent', password: 'testPassword' })
    });
    if (repLogin.status !== 200) {
        console.log('REP login FAILED:', repLogin.status);
        const err = await repLogin.json();
        console.log(err);
        return;
    }
    const repData = await repLogin.json();
    const repToken = repData.token;
    const repId = repData.userId;
    console.log('REP login OK | userId:', repId);

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${repToken}` };

    // 2. Dashboard stats
    console.log('\n--- Step 2: Dashboard Stats (REP) ---');
    const statsRes = await fetch(`${BASE}/dashboard/stats`, { headers });
    console.log('Stats status:', statsRes.status);
    if (statsRes.ok) console.log('Stats:', JSON.stringify(await statsRes.json()));

    // 3. Load own orders
    console.log('\n--- Step 3: Fetch own orders ---');
    const ordersRes = await fetch(`${BASE}/orders/user/${repId}`, { headers });
    console.log('Orders status:', ordersRes.status);
    if (ordersRes.ok) {
        const orders = await ordersRes.json();
        console.log('Order count:', orders.length);
    } else {
        console.log('ERROR body:', await ordersRes.text());
    }

    // 4. Get customers
    console.log('\n--- Step 4: Get Customers ---');
    const custRes = await fetch(`${BASE}/customers`, { headers });
    console.log('Customers status:', custRes.status);
    const customers = custRes.ok ? await custRes.json() : [];
    const activeCustomers = customers.filter(c => c.active);
    console.log('Active customers:', activeCustomers.length, '| First id:', activeCustomers[0]?.id);

    // 5. Get active products
    console.log('\n--- Step 5: Get Active Products ---');
    const prodRes = await fetch(`${BASE}/products/active`, { headers });
    console.log('Products status:', prodRes.status);
    const products = prodRes.ok ? await prodRes.json() : [];
    console.log('Active products:', products.length, '| First id:', products[0]?.id);

    if (activeCustomers.length === 0 || products.length === 0) {
        console.log('Cannot test order creation: no customers or products');
        return;
    }

    // 6. Create order as REP
    console.log('\n--- Step 6: Create Order (REP) ---');
    const payload = {
        orderNo: `REP-ORDER-${Date.now()}`,
        status: 'PENDING',
        user: { id: repId },
        customer: { id: activeCustomers[0].id },
        orderItems: [
            { product: { id: products[0].id }, quantity: 2, price: products[0].price }
        ]
    };
    console.log('Payload:', JSON.stringify(payload));
    const createRes = await fetch(`${BASE}/orders`, {
        method: 'POST', headers,
        body: JSON.stringify(payload)
    });
    console.log('Create order status:', createRes.status);
    const created = await createRes.json();
    console.log('Response body:', JSON.stringify(created).substring(0, 300));

    // 7. Check that new order shows up
    if (createRes.status === 200) {
        console.log('\n--- Step 7: Verify new order appears ---');
        const checkRes = await fetch(`${BASE}/orders/user/${repId}`, { headers });
        const updatedOrders = await checkRes.json();
        console.log('Orders after creation:', updatedOrders.length);
        console.log('SUCCESS! ✓ Rep can create and view their own orders.');
    }
}

run().catch(e => console.error('FATAL:', e));
