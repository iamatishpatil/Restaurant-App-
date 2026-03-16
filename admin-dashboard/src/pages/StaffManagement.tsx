import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, User, Shield, Mail, Trash2 } from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'CHEF' });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/admin/staff', newStaff);
      setIsModalOpen(false);
      setNewStaff({ name: '', email: '', password: '', role: 'CHEF' });
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Failed to add staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Failed to remove staff member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500">Manage your restaurant team and their roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition"
        >
          <Plus className="h-5 w-5" /> Add Staff
        </button>
      </div>

      {isLoading && !staff.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm w-full min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading team members...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm w-full min-h-[300px]">
          <User className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No staff members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s: any) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
               <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-full border border-gray-100">
                     <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{s.name}</h3>
                    <span className="text-[10px] font-black text-primary uppercase bg-red-50 px-2 py-0.5 rounded tracking-wider border border-red-100">{s.role}</span>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                     <Mail className="h-4 w-4 text-gray-400" /> {s.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                     <Shield className="h-4 w-4 text-gray-400" /> <span className="font-medium">Role:</span> {s.role.charAt(0) + s.role.slice(1).toLowerCase()}
                  </div>
               </div>
               <div className="mt-6 flex justify-end border-t border-gray-50 pt-4">
                  <button 
                    onClick={() => handleDelete(s.id)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-bold"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                <input 
                  type="password" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="CHEF">Chef</option>
                  <option value="MANAGER">Manager</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
