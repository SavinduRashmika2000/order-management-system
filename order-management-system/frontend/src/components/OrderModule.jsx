import React, { useEffect, useState } from 'react';
import api from '../services/api';

const OrderModule = ({ isAdmin }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // For Creating Order (Rep only)
    const [showAddForm, setShowAddForm] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [newOrder, setNewOrder] = useState({ customerId: '', orderItems: [] });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pendingStatuses, setPendingStatuses] = useState({});
    const [reps, setReps] = useState([]);
    const [selectedRepFilter, setSelectedRepFilter] = useState('');
    const [selectedDateFilter, setSelectedDateFilter] = useState('');
    const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchOrders();
        if (isAdmin) {
            fetchReps();
            fetchCustomers(); // Also need customers for filtering
        }
        // Always load products for reps (needed for create form)
        if (!isAdmin) {
            fetchCustomers();
            fetchProducts();
        }
    }, [isAdmin, selectedRepFilter, selectedDateFilter, selectedCustomerFilter]);

    const fetchReps = async () => {
        try {
            const response = await api.get('/users');
            setReps(response.data.filter(u => u.role === 'REP'));
        } catch (err) {
            console.error('Error fetching reps:', err);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            let endpoint = '/orders';
            const params = new URLSearchParams();

            if (!isAdmin) {
                if (!userId) {
                    setError('User ID not found. Please log in again.');
                    setLoading(false);
                    return;
                }
                endpoint = `/orders/user/${userId}`;
            } else {
                if (selectedRepFilter) params.append('userId', selectedRepFilter);
                if (selectedDateFilter) params.append('date', selectedDateFilter);
                if (selectedCustomerFilter) params.append('customerId', selectedCustomerFilter);
            }

            const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
            const response = await api.get(url);
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to load orders';
            setError(`Error loading orders: ${msg} (Status: ${err.response?.status})`);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            // Only active customers
            setCustomers(response.data.filter(c => c.active));
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/active');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || selectedQuantity < 1) return;
        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (!product) return;

        const existingIdx = newOrder.orderItems.findIndex(i => i.productId === product.id);
        const currentInCart = existingIdx >= 0 ? newOrder.orderItems[existingIdx].quantity : 0;
        const requestedTotal = currentInCart + parseInt(selectedQuantity);

        if (requestedTotal > product.quantity) {
            alert(`Cannot add ${selectedQuantity} more. You already have ${currentInCart} in the order, and only ${product.quantity} are in stock.`);
            return;
        }

        let updatedItems = [...newOrder.orderItems];
        if (existingIdx >= 0) {
            updatedItems[existingIdx] = {
                ...updatedItems[existingIdx],
                quantity: requestedTotal
            };
        } else {
            const discountedPrice = parseFloat(product.price) * (1 - parseFloat(product.discount || 0) / 100);
            updatedItems.push({
                productId: product.id,
                productName: product.name,
                price: discountedPrice,
                quantity: parseInt(selectedQuantity),
            });
        }
        setNewOrder({ ...newOrder, orderItems: updatedItems });
        setSelectedProduct('');
        setSelectedQuantity(1);
    };

    const handleRemoveItem = (index) => {
        setNewOrder({ ...newOrder, orderItems: newOrder.orderItems.filter((_, i) => i !== index) });
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!newOrder.customerId) { alert('Please select a customer'); return; }
        if (newOrder.orderItems.length === 0) { alert('Please add at least one item'); return; }

        setSubmitting(true);
        try {
            const orderPayload = {
                status: 'PENDING',
                user: { id: parseInt(userId) },
                customer: { id: parseInt(newOrder.customerId) },
                orderItems: newOrder.orderItems.map(item => ({
                    product: { id: item.productId },
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            await api.post('/orders', orderPayload);
            setShowAddForm(false);
            setNewOrder({ customerId: '', orderItems: [] });
            fetchOrders();
            fetchProducts(); // Refresh stock
        } catch (err) {
            console.error('Create order error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to create order';
            alert(`Error: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusSave = async (orderId) => {
        const newStatus = pendingStatuses[orderId];
        if (!newStatus) return;
        try {
            await api.put(`/orders/${orderId}/status?status=${newStatus}`);
            // Clear pending status after success
            const updatedPending = { ...pendingStatuses };
            delete updatedPending[orderId];
            setPendingStatuses(updatedPending);
            fetchOrders();
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update status. ' + (err.response?.data?.message || err.message));
        }
    };

    const statusBadge = (status) => {
        const colors = {
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            CONFIRM: 'bg-blue-100 text-blue-700 border-blue-200',
            DISPATCHED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            CANCELED: 'bg-red-100 text-red-700 border-red-200',
        };
        return `px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`;
    };

    const calcTotal = (items) => {
        if (!items || items.length === 0) return '0.00';
        return items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0).toFixed(2);
    };

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isAdmin ? 'All system orders' : 'Your orders'} — {orders.length} total
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {!isAdmin && !showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-semibold w-full sm:w-auto text-center"
                        >
                            + New Order
                        </button>
                    )}
                    {!isAdmin && showAddForm && (
                        <button
                            onClick={() => { setShowAddForm(false); setNewOrder({ customerId: '', orderItems: [] }); }}
                            className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-300 transition font-semibold w-full sm:w-auto text-center"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                        <p className="font-semibold">Failed to load orders</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={fetchOrders} className="mt-2 text-sm text-red-600 underline hover:text-red-800">Retry</button>
                    </div>
                </div>
            )}

            {/* Create Order Form (Rep only) */}
            {showAddForm && !isAdmin && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="text-lg font-bold mb-5 text-slate-800 border-b pb-3">Create New Order</h3>
                    <form onSubmit={handleCreateOrder} className="space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Customer</label>
                            <select
                                value={newOrder.customerId}
                                onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-1/2"
                                required
                            >
                                <option value="">-- Choose Customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.shopName} ({c.ownerName})</option>
                                ))}
                            </select>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                            <h4 className="font-semibold text-slate-700 mb-3">Add Products</h4>
                            <div className="flex flex-col sm:flex-row gap-3 items-end mb-4">
                                <div className="w-full sm:flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => {
                                            setSelectedProduct(e.target.value);
                                            setSelectedQuantity('');
                                        }}
                                        className="bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm"
                                    >
                                        <option value="">-- Choose Product --</option>
                                        {products.map(p => (
                                            <option
                                                key={p.id}
                                                value={p.id}
                                                disabled={p.quantity <= 0}
                                            >
                                                {p.name} — ${parseFloat(p.price).toFixed(2)} ({p.quantity > 0 ? `${p.quantity} in stock` : 'Out of Stock'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-24">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Qty</label>
                                    <input
                                        type="number" min="1"
                                        placeholder="1"
                                        value={selectedQuantity}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '' || raw === '0') {
                                                setSelectedQuantity('');
                                                return;
                                            }
                                            let val = parseInt(raw);
                                            if (isNaN(val) || val < 1) val = 1;
                                            if (selectedProduct) {
                                                const prod = products.find(p => p.id === parseInt(selectedProduct));
                                                if (prod && val > prod.quantity) val = prod.quantity;
                                            }
                                            setSelectedQuantity(val);
                                        }}
                                        className="bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                    />
                                </div>
                                <button type="button" onClick={handleAddItem}
                                    className="bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-lg hover:bg-indigo-200 transition font-semibold w-full sm:w-auto"
                                >
                                    Add Item
                                </button>
                            </div>

                            {newOrder.orderItems.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left bg-white rounded-lg overflow-hidden border border-slate-200 min-w-[500px]">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-2 text-xs font-bold text-slate-500">Product</th>
                                                <th className="px-4 py-2 text-xs font-bold text-slate-500">Price</th>
                                                <th className="px-4 py-2 text-xs font-bold text-slate-500">Qty</th>
                                                <th className="px-4 py-2 text-xs font-bold text-slate-500 text-right">Total</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {newOrder.orderItems.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-3 font-medium text-slate-700">{item.productName}</td>
                                                    <td className="px-4 py-3 text-slate-500">${item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
                                                    <td className="px-4 py-3 font-bold text-indigo-600 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button type="button" onClick={() => handleRemoveItem(i)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600">Order Total:</td>
                                                <td className="px-4 py-3 font-bold text-indigo-700 text-right text-lg">${calcTotal(newOrder.orderItems)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                'Submit Order'
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Admin Filter Bar */}
            {isAdmin && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Rep</label>
                        <select
                            value={selectedRepFilter}
                            onChange={(e) => setSelectedRepFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Reps</option>
                            {reps.map(rep => (
                                <option key={rep.id} value={rep.id}>{rep.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Date</label>
                        <input
                            type="date"
                            value={selectedDateFilter}
                            onChange={(e) => setSelectedDateFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Customer</label>
                        <select
                            value={selectedCustomerFilter}
                            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Customers</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.shopName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => { setSelectedRepFilter(''); setSelectedDateFilter(''); setSelectedCustomerFilter(''); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition text-center"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center items-center py-16 text-slate-400">
                    <span className="text-lg">Loading orders...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center text-slate-400">
                            <p className="text-lg">No orders found.</p>
                            {!isAdmin && <p className="text-sm mt-2">Click "Create New Order" to place your first order.</p>}
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                                {/* Left panel - Order info */}
                                <div className="p-5 md:w-72 bg-slate-50 border-r border-slate-200 flex flex-col justify-between flex-shrink-0">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-800 text-base">{order.orderNo}</h3>
                                            <span className={statusBadge(order.status)}>{order.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4">
                                            {order.date ? new Date(order.date).toLocaleString() : 'N/A'}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
                                        <p className="text-sm font-semibold text-slate-700 mb-2">
                                            {order.customer?.shopName || `ID: ${order.customer?.id || 'N/A'}`}
                                        </p>
                                        {isAdmin && (
                                            <>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Sales Rep</p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {order.user?.name || `ID: ${order.user?.id || 'N/A'}`}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {/* Only admin can change status */}
                                    {isAdmin && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Update Status</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={pendingStatuses[order.id] || order.status}
                                                    onChange={(e) => setPendingStatuses({ ...pendingStatuses, [order.id]: e.target.value })}
                                                    className="flex-1 bg-white border border-slate-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="CONFIRM">CONFIRM</option>
                                                    <option value="DISPATCHED">DISPATCHED</option>
                                                    <option value="CANCELED">CANCELED</option>
                                                </select>
                                                {pendingStatuses[order.id] && pendingStatuses[order.id] !== order.status && (
                                                    <button
                                                        onClick={() => handleStatusSave(order.id)}
                                                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                                    >
                                                        Save
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right panel - Order items */}
                                <div className="p-5 flex-1">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {order.orderItems?.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div>
                                                    <span className="font-semibold text-slate-700">
                                                        {item.product?.name || `Product #${item.product?.id}`}
                                                    </span>
                                                    <span className="text-slate-400 text-sm ml-3">× {item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-indigo-600">
                                                    ${(parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                        <span className="text-sm font-bold text-slate-500 mr-3">Total:</span>
                                        <span className="text-xl font-bold text-indigo-700">
                                            ${order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : calcTotal(order.orderItems || [])}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderModule;
