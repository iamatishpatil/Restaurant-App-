import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, XCircle } from 'lucide-react';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [showRejectModal, setShowRejectModal] = useState<{id: string, name: string} | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resData, tablesData] = await Promise.all([
        axios.get('http://localhost:5000/api/reservations', config),
        axios.get('http://localhost:5000/api/tables', config)
      ]);
      
      setReservations(resData.data);
      setTables(tablesData.data);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, tableId?: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/reservations/${id}/status`, {
        status,
        tableId,
        rejectionReason: reason
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      console.error('Failed to update reservation', err);
      alert('Failed to update reservation status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reservations</h1>
        <p className="text-gray-400 text-sm mt-1">Manage incoming table bookings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="p-20 text-center text-gray-400">No reservations found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Party Size</th>
                <th className="px-6 py-4 font-medium">Status & Table</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((res: any) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{res.user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{res.user?.phone}</p>
                    {res.specialRequest && (
                      <p className="text-xs text-orange-600 mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded">
                        Note: {res.specialRequest}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400"/> {new Date(res.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 mt-1"><Clock className="h-4 w-4 text-gray-400"/> {res.time}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary"/> {res.partySize} guests</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      res.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {res.status}
                    </span>
                    {res.tableId && <p className="text-xs font-semibold text-gray-600 mt-2">Table: {res.table?.tableNumber}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {res.status === 'PENDING' && (
                      <div className="flex justify-end gap-2 items-center">
                        <select 
                          className="text-xs border rounded p-1 outline-none focus:border-primary"
                          onChange={(e) => {
                            if(e.target.value) updateStatus(res.id, 'CONFIRMED', e.target.value);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign Table & Accept</option>
                          {tables.filter(t => t.status !== 'OCCUPIED' && t.capacity >= res.partySize).map(t => (
                            <option key={t.id} value={t.id}>{t.tableNumber} (Caps: {t.capacity})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => setShowRejectModal({id: res.id, name: res.user?.name || 'Guest'})}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Reject Reservation"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => updateStatus(res.id, 'COMPLETED')}
                          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          Mark Completed
                        </button>
                        <button 
                          onClick={() => setShowRejectModal({id: res.id, name: res.user?.name || 'Guest'})}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Cancel Reservation"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 animate-in zoom-in fade-in duration-300">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Reject Reservation</h3>
            <p className="text-gray-400 text-sm mb-6 font-bold">Rejecting booking for <span className="text-red-500">{showRejectModal.name}</span></p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-gray-50 font-medium text-sm"
                  placeholder="e.g. Table fully booked, Private event, etc."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(showRejectModal.id, 'CANCELLED', undefined, rejectReason)}
                  disabled={!rejectReason.trim()}
                  className="flex-[2] py-3 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
