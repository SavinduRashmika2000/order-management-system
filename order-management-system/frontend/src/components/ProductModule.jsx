import React, { useEffect, useState } from 'react';
import api, { getImageUrl } from '../services/api';

const ProductModule = ({ isAdmin }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showHidden, setShowHidden] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [showStockModal, setShowStockModal] = useState(null); // stores productId
    const [stockToAdd, setStockToAdd] = useState(1);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        status: 'ACTIVE',
        image: '',
        quantity: '',
        price: '',
        discount: '0'
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [showHidden]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const endpoint = showHidden ? '/products/inactive' : '/products/active';
            const response = await api.get(endpoint);
            setProducts(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: newCategoryName });
            setNewCategoryName('');
            setShowCategoryModal(false);
            fetchCategories();
        } catch (err) {
            console.error('Error adding category:', err);
            alert('Failed to add category');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
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
                // Fallback: just read as data url
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
                // Convert HEIC to JPEG for browser preview
                try {
                    const jpeg = await convertToJpeg(file);
                    setNewProduct(prev => ({ ...prev, image: jpeg }));
                } catch {
                    alert('Could not preview this HEIC image. It will still upload correctly.');
                }
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewProduct(prev => ({ ...prev, image: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const productData = {
            ...newProduct,
            quantity: parseInt(newProduct.quantity) || 0,
            price: parseFloat(newProduct.price) || 0,
            discount: parseFloat(newProduct.discount) || 0,
            status: newProduct.status || 'ACTIVE'
        };

        try {
            if (editingProductId) {
                await api.put(`/products/${editingProductId}`, productData);
            } else {
                await api.post('/products', productData);
            }
            setShowAddForm(false);
            setEditingProductId(null);
            setNewProduct({
                name: '',
                category: '',
                status: 'ACTIVE',
                image: '',
                quantity: '',
                price: '',
                discount: '0'
            });
            fetchProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Failed to save product');
        }
    };

    const handleEditClick = (product) => {
        setNewProduct(product);
        setEditingProductId(product.id);
        setShowAddForm(true);
        setViewingProduct(null);
    };

    const handleHideProduct = async (id) => {
        if (!window.confirm('Are you sure you want to hide this product?')) return;
        try {
            await api.put(`/products/${id}/deactivate`);
            fetchProducts();
        } catch (err) {
            console.error('Error hiding product:', err);
            alert('Failed to hide product');
        }
    };

    const handleAddStockSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${showStockModal}/add-stock`, parseInt(stockToAdd), {
                headers: { 'Content-Type': 'application/json' }
            });
            setShowStockModal(null);
            setStockToAdd(1);
            fetchProducts();
        } catch (err) {
            console.error('Error adding stock:', err);
            alert('Failed to add stock');
        }
    };

    const handleReactivateProduct = async (id) => {
        try {
            await api.put(`/products/${id}/reactivate`);
            fetchProducts();
        } catch (err) {
            console.error('Error reactivating product:', err);
            alert('Failed to reactivate product');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading products...</div>;

    return (
        <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <h2 className="text-2xl font-bold text-slate-800">Product Management</h2>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => setShowHidden(!showHidden)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium w-full sm:w-auto text-center ${showHidden ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                            >
                                {showHidden ? 'Showing Hidden' : 'Show Hidden Products'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-1 w-full lg:w-auto items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-none sm:max-w-sm">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {isAdmin && !showHidden && (
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                setShowAddForm(false);
                            } else {
                                setEditingProductId(null);
                                setViewingProduct(null);
                                setNewProduct({ name: '', category: '', status: 'ACTIVE', image: '', quantity: '', price: '', discount: '0' });
                                setShowAddForm(true);
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium whitespace-nowrap w-full lg:w-auto text-center"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Product'}
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {showAddForm && !showHidden && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                value={newProduct.name || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                            <div className="flex gap-2">
                                <select
                                    name="category"
                                    value={newProduct.category || ''}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(true)}
                                    className="bg-indigo-50 text-indigo-700 px-3 rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
                                    title="Add New Category"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Stock Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="0"
                                value={newProduct.quantity || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                placeholder="0.00"
                                value={newProduct.price || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Discount (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                name="discount"
                                placeholder="0.0"
                                value={newProduct.discount || ''}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Product Image</label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {newProduct.image ? (
                                    <>
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                            <img src={getImageUrl(newProduct.image)} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                                            <label className="cursor-pointer text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition text-center">
                                                Change
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
                                                className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition text-center"
                                            >
                                                Remove
                                            </button>
                                        </div>
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
                        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition font-bold md:col-span-2 mt-4">
                            {editingProductId ? 'Update Product' : 'Save Product'}
                        </button>
                    </form>
                </div>
            )}

            {showCategoryModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer" onClick={() => setShowCategoryModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-slate-700">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Beverages"
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-bold"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingProduct && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer" onClick={() => setViewingProduct(null)}>
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden cursor-default" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Product Details</h3>
                            <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 shadow-inner">
                                {viewingProduct.image ? (
                                    <img src={getImageUrl(viewingProduct.image)} alt={viewingProduct.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Name</h4>
                                    <p className="text-2xl font-bold text-slate-800">{viewingProduct.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</h4>
                                        <p className="text-lg text-slate-700 font-medium">{viewingProduct.category}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</h4>
                                        <p className="text-lg text-slate-700 font-medium">{viewingProduct.quantity} units</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing</h4>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-indigo-600">
                                            ${(viewingProduct.price * (1 - viewingProduct.discount / 100)).toFixed(2)}
                                        </p>
                                        {viewingProduct.discount > 0 && (
                                            <div className="flex flex-col">
                                                <p className="text-sm text-slate-400 line-through">${parseFloat(viewingProduct.price).toFixed(2)}</p>
                                                <p className="text-xs font-bold text-emerald-600">-{viewingProduct.discount}% Off</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 hidden sm:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setViewingProduct(product)}>
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 shadow-sm transition transform hover:scale-105">
                                                {product.image ? (
                                                    <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-400 text-sm sm:text-lg font-bold">{product.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                                                <span className="text-[10px] text-slate-400 sm:hidden">{product.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-indigo-600 font-bold">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                                            {product.discount > 0 && (
                                                <span className="text-[10px] text-slate-400 line-through">${parseFloat(product.price).toFixed(2)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.quantity > 0 ? (
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.quantity > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {product.quantity} in stock
                                            </span>
                                        ) : (
                                            <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded text-xs font-black uppercase tracking-tighter">
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${product.status === 'ACTIVE' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-400 text-white border-slate-400'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-4 items-center justify-end">
                                            {isAdmin ? (
                                                showHidden ? (
                                                    <button onClick={() => handleReactivateProduct(product.id)} className="text-emerald-600 hover:text-emerald-800 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-md transition hover:bg-emerald-100 shadow-sm border border-emerald-100 inline-flex items-center gap-1">
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setShowStockModal(product.id);
                                                                setStockToAdd(1);
                                                            }}
                                                            className="text-emerald-600 hover:text-emerald-800 text-sm font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                                                        >
                                                            + Stock
                                                        </button>
                                                        <button onClick={() => handleEditClick(product)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Edit</button>
                                                        <button
                                                            onClick={() => handleHideProduct(product.id)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                        >
                                                            Hide
                                                        </button>
                                                    </>
                                                )
                                            ) : (
                                                <button onClick={() => setViewingProduct(product)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">View Details</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                        {showHidden ? 'No hidden products found.' : 'No active products found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Stock Modal */}
                {showStockModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70] cursor-pointer" onClick={() => setShowStockModal(null)}>
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xs w-full p-6 animate-fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Stock</h3>
                            <form onSubmit={handleAddStockSubmit} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-slate-700">Amount to Add</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={stockToAdd}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '' || raw === '0') {
                                                setStockToAdd('');
                                            } else {
                                                setStockToAdd(raw);
                                            }
                                        }}
                                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowStockModal(null)}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-bold"
                                    >
                                        Add Stock
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductModule;
