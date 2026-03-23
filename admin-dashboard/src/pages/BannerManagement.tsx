import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit2 } from 'lucide-react';
import { getImageUrl, onImageError } from '../utils/imageUtils';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState<any>({ title: '', image: '', link: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/banners');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/banners/${editingId}`, newBanner);
      } else {
        await api.post('/admin/banners', newBanner);
      }
      setIsModalOpen(false);
      setNewBanner({ title: '', image: '', link: '' });
      setEditingId(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Failed to save banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (banner: any) => {
    setEditingId(banner.id);
    setNewBanner({
      title: banner.title,
      image: banner.image || '',
      link: banner.link || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
          <p className="text-gray-500">Manage promotional banners for the mobile app home screen.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setNewBanner({ title: '', image: '', link: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition"
        >
          <Plus className="h-5 w-5" /> Add Banner
        </button>
      </div>

      {isLoading && !banners.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <ImageIcon className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No banners active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner: any) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
                <img src={getImageUrl(banner.image)} alt={banner.title} onError={onImageError} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{banner.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <LinkIcon className="h-3 w-3" /> <span className="truncate max-w-[150px]">{banner.link || 'No link'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <div className="flex items-center gap-4">
                  {newBanner.image && (
                    <img src={getImageUrl(newBanner.image)} onError={onImageError} className="h-16 w-16 object-cover rounded-lg border" />
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
                          setNewBanner({ ...newBanner, image: res.data.imageUrl });
                        } catch (err) {
                          console.error('Upload failed', err);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deep Link / URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. /menu/items/123"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
