import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerModule from './CustomerModule';
import UserModule from './UserModule';
import ProductModule from './ProductModule';
import OrderModule from './OrderModule';
import api from '../services/api';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalCustomers: 0,
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
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'customers':
                return <CustomerModule isAdmin={true} />;
            case 'users':
                return <UserModule isAdmin={true} />;
            case 'products':
                return <ProductModule isAdmin={true} />;
            case 'orders':
                return <OrderModule isAdmin={true} />;
            default:
                return (
                    <div className="p-4 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{loadingStats ? '...' : stats.totalUsers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{loadingStats ? '...' : stats.totalProducts}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Customers</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{loadingStats ? '...' : stats.totalCustomers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{loadingStats ? '...' : stats.activeOrders}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</h3>
                                <p className="text-2xl font-bold text-slate-800 mt-1">${loadingStats ? '...' : stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Admin Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex justify-between items-center">
                    <h1 className="text-white text-2xl font-bold tracking-tight">OMS Admin</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard' },
                        { id: 'users', label: 'Users' },
                        { id: 'products', label: 'Products' },
                        { id: 'customers', label: 'Customers' },
                        { id: 'orders', label: 'Orders' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                            className={`w-full text-left py-2.5 px-4 rounded transition flex items-center gap-3 ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-indigo-600 transition p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-sm sm:text-lg font-semibold text-slate-800 uppercase tracking-wide truncate max-w-[150px] sm:max-w-none">
                            {activeView === 'dashboard' ? 'Overview' : `${activeView}`}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm text-slate-500 hidden xs:block">Admin</span>
                        <button
                            onClick={handleLogout}
                            className="bg-slate-100 text-slate-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-red-50 hover:text-red-600 transition"
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
