import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerModule from './CustomerModule';
import ProductModule from './ProductModule';
import OrderModule from './OrderModule';
import api from '../services/api';


const RepDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        navigate('/login');
    };

    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        activeOrders: 0,
        revenue: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    React.useEffect(() => {
        if (activeView === 'dashboard') {
            fetchStats();
        }
    }, [activeView]);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const userId = localStorage.getItem('userId');
            const response = await api.get(`/dashboard/stats?userId=${userId}`);
            setStats({
                totalCustomers: response.data.totalCustomers,
                totalProducts: response.data.totalProducts,
                activeOrders: response.data.activeOrders,
                revenue: response.data.revenue
            });
        } catch (error) {
            console.error('Error fetching rep dashboard stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'customers':
                return <CustomerModule isAdmin={false} />;
            case 'products':
                return <ProductModule isAdmin={false} />;
            case 'orders':
                return <OrderModule isAdmin={false} />;
            default:
                return (
                    <main className="p-4 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Active Customers</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? '...' : stats.totalCustomers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-400">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Active Products</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? '...' : stats.totalProducts}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Active Orders</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? '...' : stats.activeOrders}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">${loadingStats ? '...' : Number(stats.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                            <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="h-screen overflow-hidden bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-indigo-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Simple Sidebar for Rep */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">OMS Rep</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-indigo-300 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex-1 mt-6 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard' },
                        { id: 'customers', label: 'Customers' },
                        { id: 'products', label: 'Products' },
                        { id: 'orders', label: 'Orders' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                            className={`w-full text-left py-3 px-6 transition flex items-center gap-3 ${activeView === item.id ? 'bg-indigo-800 border-l-4 border-white' : 'hover:bg-indigo-800'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white shadow-sm px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-indigo-600 transition p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-base sm:text-xl font-semibold text-gray-800 capitalize truncate max-w-[150px] sm:max-w-none">
                            {activeView === 'dashboard' ? 'Overview' : `${activeView}`}
                        </h2>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-100 sm:bg-transparent text-gray-600 px-3 py-1.5 sm:px-0 sm:py-0 rounded-md sm:rounded-none hover:text-red-500 transition font-medium text-xs sm:text-base"
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
