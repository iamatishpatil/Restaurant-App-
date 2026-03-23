import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Image as ImageIcon, X, ArrowRight, Eye, ClipboardList } from 'lucide-react';
import { getImageUrl, onImageError } from '../utils/imageUtils';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/formatCurrency';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<any>({ name: '', image: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryItems, setCategoryItems] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewItems = async (cat: any) => {
    setSelectedCategory(cat);
    setIsDrawerOpen(true);
    setIsLoadingItems(true);
    try {
      const res = await api.get(`/admin/menu?categoryId=${cat.id}`);
      setCategoryItems(res.data);
    } catch (err) {
      console.error('Failed to fetch category items', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, newCategory);
      } else {
        await api.post('/admin/categories', newCategory);
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
    try {
      await api.delete(`/admin/categories/${id}`);
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
          className="bg-primary text-white flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
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
                    <img src={getImageUrl(cat.image)} alt={cat.name} onError={onImageError} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  )}
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                 <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{cat.description || 'No description provided.'}</p>
                 <div className="flex items-center justify-between mt-4">
                    <button 
                       onClick={() => handleViewItems(cat)}
                       className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-700 transition"
                    >
                       <Eye className="h-4 w-4" /> View Items
                    </button>
                    <div className="flex gap-2">
                       <button onClick={() => openEditModal(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="h-4 w-4" /></button>
                       <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
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
                    <img src={getImageUrl(newCategory.image)} onError={onImageError} className="h-16 w-16 object-cover rounded-lg border" />
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
                        try {
                          const res = await api.post('/upload', formData, {
                            headers: { 
                              'Content-Type': 'multipart/form-data'
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

      {/* Side Drawer for Category Items */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div 
            className="absolute inset-0 bg-gray-900/10 transition-opacity" 
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md animate-in slide-in-from-right duration-300">
              <div className="h-full flex flex-col bg-white shadow-2xl">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{selectedCategory?.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Showing all items in this category</p>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition shadow-sm">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {isLoadingItems ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                      <p className="text-sm text-gray-400">Fetching items...</p>
                    </div>
                  ) : categoryItems.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="bg-gray-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No items in this category yet.</p>
                      <Link 
                        to="/menu" 
                        className="mt-4 inline-flex items-center gap-2 text-primary font-bold hover:underline py-2"
                      >
                        Go to Menu Management <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="group bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-red-100 hover:shadow-md transition-all duration-300">
                          <div className="h-16 w-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-50">
                             <img 
                               src={getImageUrl(item.image)} 
                               onError={onImageError} 
                               alt={item.name} 
                               className="h-full w-full object-cover group-hover:scale-110 transition duration-500" 
                             />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                               <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isVeg ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                 {item.isVeg ? 'VEG' : 'NON-VEG'}
                               </span>
                             </div>
                             <p className="text-xs font-bold text-gray-900 mt-1">{formatINR(item.price)}</p>
                             <div className="flex items-center justify-between mt-3">
                                <span className={`text-[10px] font-medium ${item.availability ? 'text-green-500' : 'text-red-400'}`}>
                                  {item.availability ? '• Available' : '• Sold Out'}
                                </span>
                                <Link 
                                  to="/menu"
                                  className="text-[10px] font-bold text-gray-400 hover:text-primary flex items-center gap-1 transition-colors"
                                >
                                  Edit in Menu <ArrowRight className="h-3 w-3" />
                                </Link>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                  <Link 
                    to="/menu"
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:border-red-200 hover:text-primary transition shadow-sm"
                  >
                    <ClipboardList className="h-4 w-4" /> Manage All Menu Items
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
