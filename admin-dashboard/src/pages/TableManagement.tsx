import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Users, 
  RefreshCw,
  LayoutGrid,
  Search,
  Calendar
} from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 4 });
  const [searchTerm, setSearchTerm] = useState('');

  // Removed restaurantId for single-restaurant model

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    }
  };

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tables', newTable);
      setShowAddModal(false);
      setNewTable({ tableNumber: '', capacity: 4 });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Delete this table and its QR code?')) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTables = tables.filter(t => 
    t.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTableReservation = (tableId: string) => {
    return reservations.find(r => r.tableId === tableId && (r.status === 'CONFIRMED' || r.status === 'PENDING'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Table Management</h1>
          <p className="text-gray-400 text-sm mt-1">Generate QR codes and manage physical dining tables.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-500 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition shadow-lg shadow-red-200 flex items-center gap-2 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add New Table
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tables..."
            className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 bg-gray-50/50 text-sm transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading && <RefreshCw className="animate-spin h-4 w-4 text-gray-400" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all p-6 relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  table.status === 'AVAILABLE' ? (getTableReservation(table.id) ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600') : 'bg-orange-50 text-orange-600'
                }`}>
                  {table.status === 'AVAILABLE' && getTableReservation(table.id) ? 'RESERVED' : table.status}
                </span>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Table {table.tableNumber}</h3>
                <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {table.capacity} Seats</span>
                  {getTableReservation(table.id) && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <Calendar className="h-3 w-3" /> 
                      {getTableReservation(table.id)?.time}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDeleteTable(table.id)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 aspect-square bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center group-hover:bg-white transition relative overflow-hidden">
              {table.qrCode ? (
                <img src={table.qrCode} alt="QR Code" className="w-4/5 h-4/5 object-contain" />
              ) : (
                <QrCode className="h-12 w-12 text-gray-200" />
              )}
              <div className="absolute inset-0 bg-red-500/90 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button className="bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95">
                  <QrCode className="h-4 w-4" /> Download QR
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
               <button className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition">History</button>
               <button className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition">Details</button>
            </div>
          </div>
        ))}

        {filteredTables.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-200 text-gray-400">
            <LayoutGrid className="h-16 w-16 mb-4 opacity-10" />
            <p className="font-black text-lg">No tables found</p>
            <p className="text-sm">Click "Add New Table" to start your setup.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in fade-in duration-300 border border-gray-100 shadow-2xl">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">New Dining Table</h3>
            <p className="text-gray-400 text-sm mb-8 font-bold">Set up a new physical table location.</p>
            
            <form onSubmit={handleAddTable} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Table Identifier</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. 01, T-05, VIP-1"
                  className="w-full px-6 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-gray-50 font-bold"
                  value={newTable.tableNumber}
                  onChange={e => setNewTable({...newTable, tableNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seating Capacity</label>
                <input
                  required
                  type="number"
                  placeholder="4"
                  className="w-full px-6 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-gray-50 font-bold"
                  value={newTable.capacity}
                  onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Finalize Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
