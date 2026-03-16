import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Tag, Calendar, Edit } from 'lucide-react';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', minOrderAmount: '', expiryDate: '' });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data);
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
      const payload = {
        ...newCoupon,
        type: 'PERCENTAGE',
        discount: parseFloat(newCoupon.discountPercent),
        minOrderAmount: parseFloat(newCoupon.minOrderAmount) || 0
      };

      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      setIsModalOpen(false);
      setNewCoupon({ code: '', discountPercent: '', minOrderAmount: '', expiryDate: '' });
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('Failed to save coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('Failed to delete coupon');
    }
  };

  const openEditModal = (coupon: any) => {
    setEditingId(coupon.id);
    setNewCoupon({
      code: coupon.code,
      discountPercent: coupon.discount?.toString() || coupon.discountPercent?.toString() || '',
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
          <p className="text-gray-500">Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewCoupon({ code: '', discountPercent: '', minOrderAmount: '', expiryDate: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition font-bold"
        >
          <Plus className="h-5 w-5" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Code</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Discount</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Min. Order</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Expiry</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && !coupons.length ? (
               <tr>
                 <td colSpan={5} className="py-20 text-center">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                   <p className="text-gray-500">Loading coupons...</p>
                 </td>
               </tr>
            ) : coupons.length === 0 ? (
               <tr>
                 <td colSpan={5} className="py-20 text-center">
                    <Tag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No active coupons found.</p>
                 </td>
               </tr>
            ) : (
              coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Tag className="h-4 w-4" /> {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{coupon.discount || coupon.discountPercent}% OFF</td>
                  <td className="px-6 py-4 font-medium">₹{coupon.minOrderAmount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" /> {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition transform hover:scale-110">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition transform hover:scale-110">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input 
                  type="text" required placeholder="OFF50"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary uppercase"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({...newCoupon, discountPercent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order (₹)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
