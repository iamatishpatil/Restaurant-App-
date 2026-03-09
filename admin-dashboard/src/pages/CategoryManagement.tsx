import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<any>({ name: '', image: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/categories/${editingId}`, newCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/categories', newCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setNewCategory({ name: '', image: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setNewCategory({
      name: cat.name,
      image: cat.image || '',
      description: cat.description || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
          <p className="text-gray-500">Organize your menu into logical groups.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewCategory({ name: '', image: '', description: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition"
        >
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      {isLoading && !categories.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <ImageIcon className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No categories found.</p>
          <button 
            onClick={() => { setEditingId(null); setNewCategory({ name: '', image: '', description: '' }); setIsModalOpen(true); }}
            className="mt-4 text-primary font-bold hover:underline"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
               <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  )}
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                 <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{cat.description || 'No description provided.'}</p>
                 <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                <div className="flex items-center gap-4">
                  {newCategory.image && (
                    <img src={getImageUrl(newCategory.image)} className="h-16 w-16 object-cover rounded-lg border" />
                  )}
                  <label className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
                    <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Click to upload image</span>
                    <input 
                      type="file" className="hidden" accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('image', file);
                        const token = localStorage.getItem('token');
                        try {
                          const res = await axios.post('http://localhost:5000/api/upload', formData, {
                            headers: { 
                              'Content-Type': 'multipart/form-data',
                              Authorization: `Bearer ${token}` 
                            }
                          });
                          setNewCategory({...newCategory, image: res.data.imageUrl});
                        } catch (err) {
                          console.error('Upload failed', err);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary h-24"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Saving...' : editingId ? 'Update Detail' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
