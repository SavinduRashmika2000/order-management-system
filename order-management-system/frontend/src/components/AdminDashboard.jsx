import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerModule from './CustomerModule';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeView) {
            case 'customers':
                return <CustomerModule isAdmin={true} />;
            case 'users':
                return <div className="p-8"><h2 className="text-2xl font-bold mb-4">Users Management</h2><p className="text-slate-500">Users module coming soon...</p></div>;
            case 'products':
                return <div className="p-8"><h2 className="text-2xl font-bold mb-4">Products Management</h2><p className="text-slate-500">Products module coming soon...</p></div>;
            case 'orders':
                return <div className="p-8"><h2 className="text-2xl font-bold mb-4">Orders Management</h2><p className="text-slate-500">Orders module coming soon...</p></div>;
            default:
                return (
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">42</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">156</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">12</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">$14,580</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Recent System Activity</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-500 text-sm">System is fully operational. All modules are synchronized.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0">
                <div className="p-8">
                    <h1 className="text-white text-2xl font-bold tracking-tight">OMS Admin</h1>
                </div>
                <nav className="px-4 space-y-2">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`w-full text-left py-2.5 px-4 rounded transition ${activeView === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('users')}
                        className={`w-full text-left py-2.5 px-4 rounded transition ${activeView === 'users' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveView('products')}
                        className={`w-full text-left py-2.5 px-4 rounded transition ${activeView === 'products' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveView('customers')}
                        className={`w-full text-left py-2.5 px-4 rounded transition ${activeView === 'customers' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveView('orders')}
                        className={`w-full text-left py-2.5 px-4 rounded transition ${activeView === 'orders' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        Orders
                    </button>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">
                        {activeView === 'dashboard' ? 'System Overview' : `${activeView} Management`}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Welcome, Administrator</span>
                        <button
                            onClick={handleLogout}
                            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
