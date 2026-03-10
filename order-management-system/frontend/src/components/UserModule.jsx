import React, { useEffect, useState } from 'react';
import api from '../services/api';

const UserModule = ({ isAdmin }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        username: '',
        password: '',
        role: 'REP'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [showInactive]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            // Filter users based on showInactive toggle
            const filteredUsers = response.data.filter(u => showInactive ? !u.activeStatus : u.activeStatus);
            setUsers(filteredUsers);
            setError('');
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingUserId) {
                // If password is not changed, we don't send it, or we send it empty and backend ignores it.
                await api.put(`/users/${editingUserId}`, newUser);
            } else {
                await api.post('/users', newUser);
            }
            setShowAddForm(false);
            setEditingUserId(null);
            setNewUser({
                name: '',
                username: '',
                password: '',
                role: 'REP'
            });
            fetchUsers();
        } catch (err) {
            console.error('Error saving user:', err);
            alert('Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (user) => {
        setNewUser({
            name: user.name,
            username: user.username,
            role: user.role,
            password: '' // empty password so we don't overwrite if they don't type anything new
        });
        setEditingUserId(user.id);
        setShowAddForm(true);
    };

    const handleReactivateUser = async (id) => {
        try {
            await api.patch(`/users/${id}/status?status=true`);
            fetchUsers();
        } catch (err) {
            console.error('Error reactivating user:', err);
            alert('Failed to reactivate user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await api.patch(`/users/${id}/status?status=false`);
            fetchUsers();
        } catch (err) {
            console.error('Error deactivating user:', err);
            alert('Failed to deactivate user');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition font-medium w-full sm:w-auto text-center ${showInactive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {showInactive ? 'Showing Deactivated' : 'Show Deactivated'}
                    </button>
                </div>
                {!showInactive && isAdmin && (
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                setShowAddForm(false);
                            } else {
                                setEditingUserId(null);
                                setNewUser({ name: '', username: '', password: '', role: 'REP' });
                                setShowAddForm(true);
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium w-full sm:w-auto text-center"
                    >
                        {showAddForm ? 'Cancel' : '+ Add User'}
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {showAddForm && !showInactive && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
                    onClick={() => setShowAddForm(false)}
                >
                    <div
                        className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full cursor-default relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full hover:rotate-90 transition transform duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-bold mb-8 text-slate-800 border-b pb-4">{editingUserId ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={handleAddUser} className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={newUser.name || ''}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Choose a username"
                                    value={newUser.username || ''}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{editingUserId ? 'New Password (Optional)' : 'Password'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder={editingUserId ? "Leave blank to keep current" : "Enter password"}
                                    value={newUser.password || ''}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required={!editingUserId}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Access Role</label>
                                <select
                                    name="role"
                                    value={newUser.role || 'REP'}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    required
                                >
                                    <option value="ADMIN">ADMIN (Full Access)</option>
                                    <option value="REP">REP (Limited Access)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-indigo-600 text-white w-full py-4 rounded-2xl hover:bg-indigo-700 transition font-bold mt-4 shadow-lg shadow-indigo-200 tracking-wide uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>{editingUserId ? 'Updating...' : 'Registering...'}</span>
                                    </>
                                ) : (
                                    <span>{editingUserId ? 'Update User Account' : 'Register User'}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Username</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-800 text-sm sm:text-base">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm sm:text-base">@{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 sm:gap-3 items-center">
                                                {showInactive ? (
                                                    <button onClick={() => handleReactivateUser(user.id)} className="text-emerald-600 hover:text-emerald-800 text-xs sm:text-sm font-bold bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition hover:bg-emerald-100 shadow-sm border border-emerald-100 inline-flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Edit</button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-bold ml-1 sm:ml-2"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? "4" : "3"} className="px-6 py-10 text-center text-slate-400">
                                        {showInactive ? 'No deactivated users found.' : 'No active users found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserModule;
