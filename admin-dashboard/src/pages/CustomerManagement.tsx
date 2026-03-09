import { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, Calendar, Users } from 'lucide-react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data.filter((u: any) => u.role === 'CUSTOMER'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-500">View and manage your registered customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Name</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Contact</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Joined Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && !customers.length ? (
               <tr>
                 <td colSpan={4} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading customers...</p>
                 </td>
               </tr>
            ) : customers.length === 0 ? (
               <tr>
                 <td colSpan={4} className="py-20 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    No customers registered yet.
                 </td>
               </tr>
            ) : (
              customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{c.name || 'Anonymous'}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                        <span className="flex items-center gap-1 text-gray-500"><Phone className="h-3 w-3" /> {c.phone}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                     <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-green-600 text-xs font-bold uppercase bg-green-50 px-2 py-1 rounded">Active</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerManagement;
