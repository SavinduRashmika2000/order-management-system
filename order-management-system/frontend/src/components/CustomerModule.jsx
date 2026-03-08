import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../services/api';

const CustomerModule = ({ isAdmin }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const [viewingCustomer, setViewingCustomer] = useState(null);


    useEffect(() => {
        fetchCustomers();
    }, [showInactive]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get(showInactive ? '/customers/inactive' : '/customers/active');
            setCustomers(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch customers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    const convertToJpeg = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = () => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
            if (isHeic) {
                try {
                    const jpeg = await convertToJpeg(file);
                    setNewCustomer(prev => ({ ...prev, image: jpeg }));
                } catch {
                    alert('Could not preview this HEIC image.');
                }
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewCustomer(prev => ({ ...prev, image: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleViewCustomer = (customer) => {
        setViewingCustomer(customer);
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
                    longitude: longitude.toString(),
                    googleMapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                }));
                setFetchingLocation(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Could not get your location. Please enter it manually.');
                setFetchingLocation(false);
            }
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
            setNewCustomer({ shopName: '', ownerName: '', phoneNo: '', email: '', city: '', address: '', image: '', latitude: '', longitude: '', googleMapLink: '' });
            fetchCustomers();
        } catch (err) {
            console.error('Error saving customer:', err);
            alert('Failed to save customer');
        }
    };

    const handleEditClick = (customer) => {
        setEditingCustomerId(customer.id);
        setNewCustomer({
            shopName: customer.shopName,
            ownerName: customer.ownerName,
            phoneNo: customer.phoneNo,
            email: customer.email,
            city: customer.city,
            address: customer.address,
            image: customer.image, // Keep existing image path
            latitude: customer.latitude || '',
            longitude: customer.longitude || '',
            googleMapLink: customer.googleMapLink || ''
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Removed local getImageUrl, using imported one

    if (loading) return <div className="p-8 text-center text-slate-500">Loading customers...</div>;

    return (
        <div className="p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Customer Network</h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-full border transition-all w-full sm:w-auto text-center ${showInactive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                        >
                            {showInactive ? 'Showing Deactivated' : 'Show Deactivated'}
                        </button>
                    )}
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
                        className="premium-button bg-indigo-600 text-white w-full sm:w-auto text-center"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Customer'}
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold border border-red-100">{error}</div>}

            {showAddForm && !showInactive && (
                <div className="glass-card p-4 sm:p-8 mb-10 staggered-list">
                    <h3 className="text-xl font-black mb-8 text-slate-800 border-b border-slate-100 pb-4">{editingCustomerId ? 'Edit Profile' : 'New Customer Profile'}</h3>
                    <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                            <input
                                type="text"
                                name="shopName"
                                placeholder="e.g. Super Mart"
                                value={newCustomer.shopName || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="e.g. John Doe"
                                value={newCustomer.ownerName || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNo"
                                placeholder="e.g. +94..."
                                value={newCustomer.phoneNo || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. customer@example.com"
                                value={newCustomer.email || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="e.g. Colombo"
                                value={newCustomer.city || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Enter full address"
                                value={newCustomer.address || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Shop Photo</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    {newCustomer.image ? (
                                        <>
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-100 flex-shrink-0 shadow-lg shadow-indigo-500/5">
                                                <img src={getImageUrl(newCustomer.image)} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="cursor-pointer text-xs font-black uppercase tracking-tighter text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition whitespace-nowrap">
                                                    Change Image
                                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewCustomer(prev => ({ ...prev, image: '' }))}
                                                    className="text-[10px] font-black uppercase tracking-tighter text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full">
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition cursor-pointer group">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                <span className="mt-2 text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition">Drop an image here or click to browse</span>
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precise Location (GPS)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="latitude"
                                        placeholder="Latitude"
                                        value={newCustomer.latitude || ''}
                                        onChange={handleInputChange}
                                        className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="longitude"
                                        placeholder="Longitude"
                                        value={newCustomer.longitude || ''}
                                        onChange={handleInputChange}
                                        className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchGPSLocation}
                                    disabled={fetchingLocation}
                                    className="bg-white text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-50 transition font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                                >
                                    {fetchingLocation ? (
                                        <span className="inline-block animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                    Auto-detect Location
                                </button>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Google Maps Deep Link</label>
                                    <input
                                        type="text"
                                        name="googleMapLink"
                                        placeholder="Paste share link from Maps"
                                        value={newCustomer.googleMapLink || ''}
                                        onChange={handleInputChange}
                                        className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="premium-button bg-indigo-600 text-white md:col-span-2 py-4">
                            {editingCustomerId ? 'Update Profile' : 'Registry Customer'}
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 hidden sm:table-header-group">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Establishment</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Director</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">HQ City</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registry Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map(customer => (
                                <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-all transform active:scale-95 ring-offset-4 ring-indigo-500/0 hover:ring-2 hover:ring-indigo-500/20"
                                                onClick={() => handleViewCustomer(customer)}
                                            >
                                                {customer.image ? (
                                                    <img src={getImageUrl(customer.image)} alt={customer.shopName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-400 text-sm sm:text-xl font-black">{customer.shopName.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span
                                                    className="font-black text-slate-800 text-sm sm:text-base tracking-tight cursor-pointer hover:text-indigo-600 transition truncate max-w-[120px] sm:max-w-none"
                                                    onClick={() => handleViewCustomer(customer)}
                                                >
                                                    {customer.shopName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 sm:hidden">{customer.ownerName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-bold hidden lg:table-cell">{customer.ownerName}</td>
                                    <td className="px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest">{customer.city}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm tracking-tighter hidden md:table-cell">{customer.phoneNo}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {showInactive ? (
                                                <button onClick={() => handleReactivateCustomer(customer.id)} className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                    Restore
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(customer)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteCustomer(customer.id)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detailed View Modal */}
            {viewingCustomer && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
                    onClick={() => setViewingCustomer(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in premium-shadow cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Customer Dossier</h3>
                            <button onClick={() => setViewingCustomer(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:rotate-90 transition transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {/* Sidebar: Photo and Key Info */}
                                <div className="space-y-8">
                                    <div className="aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100 ring-1 ring-slate-200 relative group">
                                        {viewingCustomer.image ? (
                                            <img src={getImageUrl(viewingCustomer.image)} alt={viewingCustomer.shopName} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-500/5">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            Geolocation Trace
                                        </h4>
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lat / Long</p>
                                                <p className="text-sm font-bold text-indigo-900 font-mono">{viewingCustomer.latitude || 'N/A'}, {viewingCustomer.longitude || 'N/A'}</p>
                                            </div>
                                            {viewingCustomer.googleMapLink && (
                                                <a
                                                    href={viewingCustomer.googleMapLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-95"
                                                >
                                                    Open Maps View
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content: Details only */}
                                <div className="md:col-span-2 space-y-10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="sm:col-span-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                Establishment Identity
                                            </h4>
                                            <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{viewingCustomer.shopName}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authorized Principal</h4>
                                            <p className="text-xl font-bold text-slate-700">{viewingCustomer.ownerName}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Regional Territory</h4>
                                            <p className="text-xl font-bold text-slate-700">{viewingCustomer.city}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Communication Line</h4>
                                            <p className="text-xl font-bold text-slate-700 font-mono tracking-tighter">{viewingCustomer.phoneNo}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Direct Correspondence</h4>
                                            <p className="text-xl font-bold text-slate-700 underline decoration-indigo-200 underline-offset-4 decoration-2">{viewingCustomer.email}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Physical Address Registry</h4>
                                            <p className="text-xl font-bold text-slate-700 leading-relaxed">{viewingCustomer.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerModule;
