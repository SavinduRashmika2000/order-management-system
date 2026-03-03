import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerModule from './CustomerModule';

const RepDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeView) {
            case 'customers':
                return <CustomerModule isAdmin={false} />;
            case 'orders':
                return <div className="p-8"><h2 className="text-2xl font-bold mb-4">Orders Management</h2><p className="text-slate-500">Orders module coming soon...</p></div>;
            default:
                return (
                    <main className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">My Customers</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Orders Today</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">4</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Total Sales</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">$1,240</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveView('customers')}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
                                >
                                    + New Customer
                                </button>
                                <button
                                    onClick={() => setActiveView('orders')}
                                    className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition font-bold"
                                >
                                    Create New Order
                                </button>
                            </div>
                        </div>
                    </main>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Simple Sidebar for Rep */}
            <aside className="w-64 bg-indigo-900 text-white flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">OMS Rep</h1>
                </div>
                <nav className="mt-6">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`w-full text-left py-3 px-6 transition ${activeView === 'dashboard' ? 'bg-indigo-800 border-l-4 border-white' : 'hover:bg-indigo-800'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('customers')}
                        className={`w-full text-left py-3 px-6 transition ${activeView === 'customers' ? 'bg-indigo-800 border-l-4 border-white' : 'hover:bg-indigo-800'}`}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveView('orders')}
                        className={`w-full text-left py-3 px-6 transition ${activeView === 'orders' ? 'bg-indigo-800 border-l-4 border-white' : 'hover:bg-indigo-800'}`}
                    >
                        Orders
                    </button>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                        {activeView === 'dashboard' ? 'Sales Representative Dashboard' : `${activeView} Management`}
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-red-500 transition font-medium"
                    >
                        Logout
                    </button>
                </header>

                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default RepDashboard;
