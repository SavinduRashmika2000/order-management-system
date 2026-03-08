// script to verify sequential numbering and filtering
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

    const authHeader = (token) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    // 1. Create a few orders to check sequential numbering
    console.log('\n--- Testing Sequential Numbering ---');

    // Get a customer and product
    const custRes = await fetch(`${BASE}/customers`, { headers: authHeader(adminToken) });
    const customers = await custRes.json();
    const prodRes = await fetch(`${BASE}/products/active`, { headers: authHeader(adminToken) });
    const products = await prodRes.json();

    const createOrder = async (name) => {
        const res = await fetch(`${BASE}/orders`, {
            method: 'POST',
            headers: authHeader(adminToken),
            body: JSON.stringify({
                status: 'PENDING',
                user: { id: admin.userId },
                customer: { id: customers[0].id },
                orderItems: [{ product: { id: products[0].id }, quantity: 1, price: 10 }]
            })
        });
        const order = await res.json();
        console.log(`Created order: ${order.orderNo}`);
        return order;
    };

    const o1 = await createOrder();
    const o2 = await createOrder();

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (o1.orderNo.startsWith(todayStr) && o2.orderNo.endsWith((parseInt(o1.orderNo.split('-')[1]) + 1).toString())) {
        console.log('SUCCESS: Order numbering is sequential and follows YYYYMMDD-SEQ format.');
    } else {
        console.log(`FAILURE: Order numbering issues. O1: ${o1.orderNo}, O2: ${o2.orderNo}`);
    }

    // 2. Test Sorting (ASC)
    console.log('\n--- Testing Sorting (Oldest First) ---');
    const ordersRes = await fetch(`${BASE}/orders`, { headers: authHeader(adminToken) });
    const orders = await ordersRes.json();

    let sorted = true;
    for (let i = 1; i < orders.length; i++) {
        if (new Date(orders[i].date) < new Date(orders[i - 1].date)) {
            sorted = false;
            break;
        }
    }

    if (sorted) {
        console.log('SUCCESS: Orders are sorted by date in ascending order (oldest first).');
    } else {
        console.log('FAILURE: Orders are not sorted correctly.');
    }

    // 3. Test Filtering
    console.log('\n--- Testing Filtering ---');

    // Filter by Date (today)
    const dateStr = new Date().toISOString().slice(0, 10);
    console.log(`Filtering by date: ${dateStr}`);
    const filteredByDateRes = await fetch(`${BASE}/orders?date=${dateStr}`, { headers: authHeader(adminToken) });
    const ordersToday = await filteredByDateRes.json();
    console.log(`Total orders found for today: ${ordersToday.length}`);

    const allToday = ordersToday.every(o => o.date.startsWith(dateStr));
    if (allToday && ordersToday.length >= 2) {
        console.log('SUCCESS: Date filtering works correctly.');
    } else {
        console.log('FAILURE: Date filtering issues.');
    }

    // Filter by Admin User ID
    console.log(`Filtering by Admin User ID: ${admin.userId}`);
    const filteredByUserRes = await fetch(`${BASE}/orders?userId=${admin.userId}`, { headers: authHeader(adminToken) });
    const adminOrders = await filteredByUserRes.json();
    console.log(`Total orders found for Admin: ${adminOrders.length}`);

    const allAdmin = adminOrders.every(o => o.user.id === admin.userId);
    if (allAdmin && adminOrders.length >= 2) {
        console.log('SUCCESS: User ID filtering works correctly.');
    } else {
        console.log('FAILURE: User ID filtering issues.');
    }
}

run().catch(console.error);
