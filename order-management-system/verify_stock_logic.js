const BASE = 'http://localhost:9090/api/v1';

async function login(username, password) {
    const res = await fetch(`${BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    return data.token;
}

async function verifyBackend() {
    console.log('--- Verifying Backend Changes ---');

    try {
        const token = await login('admin', 'admin123');
        if (!token) {
            console.error('Login failed');
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 1. Verify Product Add Stock
        console.log('\n1. Verifying Add Stock...');
        const productRes = await fetch(`${BASE}/products/active`, { headers });
        const products = await productRes.json();

        if (!Array.isArray(products) || products.length === 0) {
            console.error('No products found to test stock management.');
            console.log('API Response:', products);
        } else {
            const product = products[0];
            const initialQty = product.quantity;
            console.log(`Initial Quantity for "${product.name}": ${initialQty}`);

            const addRes = await fetch(`${BASE}/products/${product.id}/add-stock`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(10)
            });

            if (addRes.ok) {
                const updatedProduct = await addRes.json();
                console.log(`Updated Quantity: ${updatedProduct.quantity}`);
                if (updatedProduct.quantity === initialQty + 10) {
                    console.log('✅ Add Stock SUCCESS');
                } else {
                    console.error('❌ Add Stock FAILED: Incorrect final quantity');
                }
            } else {
                console.error(`❌ Add Stock FAILED: ${addRes.status} ${await addRes.text()}`);
            }
        }

        // 2. Verify Customer Order History
        console.log('\n2. Verifying Customer Order History...');
        const customerRes = await fetch(`${BASE}/customers/active`, { headers });
        const customers = await customerRes.json();

        if (!Array.isArray(customers) || customers.length === 0) {
            console.error('No customers found to test order history.');
            console.log('API Response:', customers);
        } else {
            const customer = customers[0];
            console.log(`Testing history for customer: ${customer.shopName} (ID: ${customer.id})`);

            const historyRes = await fetch(`${BASE}/orders/customer/${customer.id}`, { headers });
            if (historyRes.ok) {
                const orders = await historyRes.json();
                console.log(`✅ Order history fetch SUCCESS. Found ${orders.length} orders.`);
            } else {
                console.error(`❌ Order history fetch FAILED: ${historyRes.status}`);
            }
        }

    } catch (err) {
        console.error('ERROR during verification:', err);
    }
}

verifyBackend();
