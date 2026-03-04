import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CustomerModule = ({ isAdmin }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        shopName: '',
        ownerName: '',
        phoneNo: '',
        email: '',
        city: '',
        address: '',
        image: '',
        latitude: '',
        longitude: '',
        googleMapLink: ''
    });
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [showInactive]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const endpoint = showInactive ? '/customers/inactive' : '/customers';
            const response = await api.get(endpoint);
            setCustomers(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCustomer(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchGPSLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setNewCustomer(prev => ({
                    ...prev,
                    latitude: latitude.toString(),
                    longitude: longitude.toString()
                }));
                setFetchingLocation(false);
            },
            (error) => {
                console.error('Error fetching location:', error);
                alert('Failed to get location. Please ensure location services are enabled.');
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomerId) {
                await api.put(`/customers/${editingCustomerId}`, newCustomer);
            } else {
                await api.post('/customers', newCustomer);
            }
            setShowAddForm(false);
            setEditingCustomerId(null);
            setNewCustomer({
                shopName: '',
                ownerName: '',
                phoneNo: '',
                email: '',
                city: '',
                address: '',
                image: '',
                latitude: '',
                longitude: '',
                googleMapLink: ''
            });
            fetchCustomers();
        } catch (err) {
            console.error('Error saving customer:', err);
            alert('Failed to save customer');
        }
    };

    const handleEditClick = (customer) => {
        setNewCustomer(customer);
        setEditingCustomerId(customer.id);
        setShowAddForm(true);
    };

    const handleReactivateCustomer = async (id) => {
        try {
            await api.put(`/customers/${id}/reactivate`);
            fetchCustomers();
        } catch (err) {
            console.error('Error reactivating customer:', err);
            alert('Failed to reactivate customer');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
        try {
            await api.put(`/customers/${id}/deactivate`);
            fetchCustomers();
        } catch (err) {
            console.error('Error deactivating customer:', err);
            alert('Failed to deactivate customer');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading customers...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition font-medium ${showInactive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {showInactive ? 'Showing Deactivated' : 'Show Deactivated'}
                    </button>
                </div>
                {!showInactive && (
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                setShowAddForm(false);
                            } else {
                                setEditingCustomerId(null);
                                setNewCustomer({ shopName: '', ownerName: '', phoneNo: '', email: '', city: '', address: '', image: '', latitude: '', longitude: '', googleMapLink: '' });
                                setShowAddForm(true);
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Customer'}
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {showAddForm && !showInactive && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">{editingCustomerId ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Shop Name</label>
                            <input
                                type="text"
                                name="shopName"
                                placeholder="e.g. Super Mart"
                                value={newCustomer.shopName || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="e.g. John Doe"
                                value={newCustomer.ownerName || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNo"
                                placeholder="e.g. +94..."
                                value={newCustomer.phoneNo || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. customer@example.com"
                                value={newCustomer.email || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">City</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="e.g. Colombo"
                                value={newCustomer.city || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Address</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Enter full address"
                                value={newCustomer.address || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Shop Image</label>
                                <div className="flex items-center gap-4">
                                    {newCustomer.image ? (
                                        <>
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                                <img src={newCustomer.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <label className="cursor-pointer text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition">
                                                Change Image
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setNewCustomer(prev => ({ ...prev, image: '' }))}
                                                className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                                            >
                                                Remove Image
                                            </button>
                                        </>
                                    ) : (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Location Details</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-500">Latitude</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            placeholder="Latitude"
                                            value={newCustomer.latitude || ''}
                                            onChange={handleInputChange}
                                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-500">Longitude</label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            placeholder="Longitude"
                                            value={newCustomer.longitude || ''}
                                            onChange={handleInputChange}
                                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchGPSLocation}
                                    disabled={fetchingLocation}
                                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center gap-2 mt-2 border border-indigo-100"
                                >
                                    {fetchingLocation ? (
                                        <span className="inline-block animate-spin h-4 w-4 border-2 border-indigo-700 border-t-transparent rounded-full"></span>
                                    ) : '📍 Get Device Location'}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Google Map Link</label>
                            <input
                                type="text"
                                name="googleMapLink"
                                placeholder="Paste Google Maps Link here"
                                value={newCustomer.googleMapLink || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                            />
                        </div>

                        <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-bold md:col-span-2 mt-2 shadow-md">
                            {editingCustomerId ? 'Update Customer' : 'Save Customer'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Shop</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Owner</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">City</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {customers.map(customer => (
                            <tr key={customer.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 shadow-sm">
                                            {customer.image ? (
                                                <img src={customer.image} alt={customer.shopName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-slate-400 text-lg font-bold">{customer.shopName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="font-medium text-slate-800 text-base">{customer.shopName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{customer.ownerName}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.city}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.phoneNo}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3 items-center">
                                        {showInactive ? (
                                            <button onClick={() => handleReactivateCustomer(customer.id)} className="text-emerald-600 hover:text-emerald-800 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-md transition hover:bg-emerald-100 shadow-sm border border-emerald-100 inline-flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                Restore
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(customer)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Edit</button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteCustomer(customer.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-bold ml-2"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                    {showInactive ? 'No deactivated customers found.' : 'No customers found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerModule;
