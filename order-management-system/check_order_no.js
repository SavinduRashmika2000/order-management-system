
const BASE = 'http://localhost:9090/api/v1';

async function checkOrderNumber() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE}/auth/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        const adminData = await loginRes.json();
        const token = adminData.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Creating a new order to trigger numbering logic...');
        // Need a customer and product first
        const custRes = await fetch(`${BASE}/customers`, config);
        const customers = await custRes.json();
        console.log('Customers found:', customers.length);

        const prodRes = await fetch(`${BASE}/products/active`, config);
        const products = await prodRes.json();
        console.log('Products found:', products.length);

        if (customers.length === 0 || products.length === 0) {
            throw new Error('No customers or products available to create an order.');
        }

        const createRes = await fetch(`${BASE}/orders`, {
            method: 'POST',
            headers: { ...config.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'PENDING',
                user: { id: adminData.userId },
                customer: { id: customers[0].id },
                orderItems: [{ product: { id: products[0].id }, quantity: 1 }]
            })
        });
        const order = await createRes.json();
        console.log('Created order number:', order.orderNo);

        const expectedPattern = /^\d{8}\d{4}$/;
        if (expectedPattern.test(order.orderNo)) {
            console.log('SUCCESS: Order number matches pattern YYYYMMDDXXXX');
        } else {
            console.log('FAILURE: Order number does not match pattern. Got:', order.orderNo);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOrderNumber();
