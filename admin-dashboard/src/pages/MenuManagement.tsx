import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { formatINR } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';

const MenuManagement = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isVeg: true,
    availability: true,
    image: '',
    preparationTime: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [itemsRes, catRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/menu', config),
        axios.get('http://localhost:5000/api/admin/categories', config)
      ]);
      setItems(itemsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    setIsLoading(true);

    try {
      if (editingItem) {
        if (user?.role === 'CHEF') {
          // Chef can only update preparationTime and availability
          await axios.patch(`http://localhost:5000/api/admin/menu/${editingId || editingItem.id}/status`, {
            preparationTime: formData.preparationTime,
            availability: formData.availability
          }, config);
        } else {
          await axios.put(`http://localhost:5000/api/admin/menu/${editingId || editingItem.id}`, formData, config);
        }
      } else {
        await axios.post('http://localhost:5000/api/admin/menu', formData, config);
      }
      fetchData();
      setIsModalOpen(false);
      setEditingItem(null);
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', categoryId: '', isVeg: true, availability: true, image: '', preparationTime: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to save dish');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.delete(`http://localhost:5000/api/admin/menu/${id}`, config);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item. It might be linked to existing orders.');
    }
  };

  const filteredItems = items.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Menu Management</h1>
          <p className="text-gray-400 text-sm mt-1">Add, edit or remove dishes from your menu.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #ff4d4d, #e63946)' }}
        >
          <Plus className="h-4 w-4" /> Add New Dish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search dishes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Dish Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 relative">
            {isLoading && !items.length ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading dishes...</p>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="mb-4 flex justify-center"><Search className="h-12 w-12 text-gray-200" /></div>
                  <p className="text-gray-500">No dishes found matching your search.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={getImageUrl(item.image) || 'https://via.placeholder.com/100'} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className={`text-xs ${item.isVeg ? 'text-green-600' : 'text-red-600'}`}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatINR(item.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.availability ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingItem(item); setFormData({ ...item, preparationTime: item.preparationTime || '' }); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user?.role !== 'CHEF' && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                  <input type="text" required disabled={user?.role === 'CHEF'} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required disabled={user?.role === 'CHEF'} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" step="0.01" required disabled={user?.role === 'CHEF'} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (mins)</label>
                  <input type="number" required className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary" value={formData.preparationTime} onChange={(e) => setFormData({...formData, preparationTime: e.target.value})} />
                </div>
              </div>
                <div className={user?.role === 'CHEF' ? 'hidden' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dish Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <img src={getImageUrl(formData.image)} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                    )}
                    <label className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
                      <Plus className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center">Click to upload dish image</span>
                      <input 
                        type="file" className="hidden" accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fmData = new FormData();
                          fmData.append('image', file);
                          const token = localStorage.getItem('token');
                          try {
                            setIsLoading(true);
                            const res = await axios.post('http://localhost:5000/api/upload', fmData, {
                              headers: { 
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${token}` 
                              }
                            });
                            setFormData({...formData, image: res.data.imageUrl});
                          } catch (err) {
                            console.error('Upload failed', err);
                            alert('Image upload failed');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea disabled={user?.role === 'CHEF'} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary h-24 disabled:bg-gray-50" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" disabled={user?.role === 'CHEF'} checked={formData.isVeg} onChange={(e) => setFormData({...formData, isVeg: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.checked})} />
                  <span className="text-sm font-medium text-gray-700">Available to Order</span>
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Saving...' : editingItem ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
