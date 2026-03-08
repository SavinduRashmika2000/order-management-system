// Run with: node test_orders.js
const BASE = 'http://localhost:9090/api/v1';

async function run() {
    // 1. Login as admin
    console.log('\n--- Step 1: Login as admin ---');
    const adminLogin = await fetch(`${BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password' })
    });
    const adminData = await adminLogin.json();
    const adminToken = adminData.token;
    const adminId = adminData.userId;
    console.log('Admin login status:', adminLogin.status, '| userId:', adminId);

    // 2. Get dashboard stats
    console.log('\n--- Step 2: Dashboard Stats ---');
    const statsRes = await fetch(`${BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = await statsRes.json();
    console.log('Dashboard stats:', JSON.stringify(stats));

    // 3. Get all orders as admin
    console.log('\n--- Step 3: Get all orders (admin) ---');
    const ordersRes = await fetch(`${BASE}/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Orders GET status:', ordersRes.status);
    const orders = await ordersRes.json();
    console.log('Total orders:', orders.length);

    // 4. Get customers
    console.log('\n--- Step 4: Get active customers ---');
    const custRes = await fetch(`${BASE}/customers`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const customers = await custRes.json();
    console.log('Total customers:', customers.length, '| First customer id:', customers[0]?.id);

    // 5. Get active products
    console.log('\n--- Step 5: Get active products ---');
    const prodRes = await fetch(`${BASE}/products/active`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const products = await prodRes.json();
    console.log('Total active products:', products.length, '| First product id:', products[0]?.id);

    if (customers.length === 0 || products.length === 0) {
        console.log('ERROR: No customers or products to create order with!');
        return;
    }

    // 6. Create an order
    console.log('\n--- Step 6: Create Order ---');
    const orderPayload = {
        orderNo: 'TEST-' + Date.now(),
        status: 'PENDING',
        user: { id: adminId },
        customer: { id: customers[0].id },
        orderItems: [
            { product: { id: products[0].id }, quantity: 1, price: products[0].price }
        ]
    };
    console.log('Payload:', JSON.stringify(orderPayload));
    const createRes = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(orderPayload)
    });
    const createdOrder = await createRes.json();
    console.log('Create order status:', createRes.status);
    console.log('Created order:', JSON.stringify(createdOrder));

    if (createRes.status === 200 && createdOrder.id) {
        // 7. Update order status
        console.log('\n--- Step 7: Update order status ---');
        const updateRes = await fetch(`${BASE}/orders/${createdOrder.id}/status?status=CONFIRM`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Update status result:', updateRes.status);
        const updated = await updateRes.json();
        console.log('Updated order status:', updated.status);
    }

    // 8. Login as REP and test
    console.log('\n--- Step 8: Test REP login and fetch own orders ---');
    const repLogin = await fetch(`${BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test_agent', password: 'testPassword' })
    });
    console.log('REP login status:', repLogin.status);
    if (repLogin.status === 200) {
        const repData = await repLogin.json();
        const repToken = repData.token;
        const repId = repData.userId;
        console.log('REP userId:', repId);

        const repOrdersRes = await fetch(`${BASE}/orders/user/${repId}`, {
            headers: { Authorization: `Bearer ${repToken}` }
        });
        console.log('Rep orders status:', repOrdersRes.status);
        const repOrders = await repOrdersRes.json();
        console.log('Rep orders count:', repOrders.length);
    } else {
        console.log('REP login failed (account may be deactivated). Skipping rep test.');
    }
}

run().catch(console.error);
