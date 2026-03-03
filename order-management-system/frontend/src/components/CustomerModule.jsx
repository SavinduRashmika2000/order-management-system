import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CustomerModule = ({ isAdmin }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
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
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers');
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
            await api.post('/customers', newCustomer);
            setShowAddForm(false);
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
            console.error('Error adding customer:', err);
            alert('Failed to add customer');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (err) {
            console.error('Error deleting customer:', err);
            alert('Failed to delete customer');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading customers...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    {showAddForm ? 'Cancel' : '+ Add Customer'}
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Add New Customer</h3>
                    <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="shopName"
                            placeholder="Shop Name"
                            value={newCustomer.shopName}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <input
                            type="text"
                            name="ownerName"
                            placeholder="Owner Name"
                            value={newCustomer.ownerName}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <input
                            type="text"
                            name="phoneNo"
                            placeholder="Phone Number"
                            value={newCustomer.phoneNo}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={newCustomer.email}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={newCustomer.city}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={newCustomer.address}
                            onChange={handleInputChange}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none col-span-2"
                            required
                        />
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-600">Shop Image</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {newCustomer.image && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={newCustomer.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-600">Location Details</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-500">Latitude</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            placeholder="Latitude"
                                            value={newCustomer.latitude}
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
                                            value={newCustomer.longitude}
                                            onChange={handleInputChange}
                                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchGPSLocation}
                                    disabled={fetchingLocation}
                                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center gap-2 mt-2"
                                >
                                    {fetchingLocation ? (
                                        <span className="inline-block animate-spin h-4 w-4 border-2 border-indigo-700 border-t-transparent rounded-full"></span>
                                    ) : '📍 Get Device Location'}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 mb-2 block">Google Map Link</label>
                            <input
                                type="text"
                                name="googleMapLink"
                                placeholder="Paste Google Maps Link here"
                                value={newCustomer.googleMapLink}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                            />
                        </div>

                        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition font-bold md:col-span-2">
                            Save Customer
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Shop Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Owner</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">City</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {customers.map(customer => (
                            <tr key={customer.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-800">{customer.shopName}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.ownerName}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.city}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.phoneNo}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Details</button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-bold"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerModule;
