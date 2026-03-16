import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Wifi, 
  Usb, 
  Save,
  Network
} from 'lucide-react';

const PrinterSettings = () => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    type: 'LAN',
    connection: '',
    usage: 'KITCHEN'
  });

  const fetchPrinters = async () => {
    try {
      const res = await api.get('/admin/printers');
      setPrinters(res.data);
    } catch (err) {
      console.error('Failed to fetch printers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleAddPrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/printers', newPrinter);
      setShowAddModal(false);
      setNewPrinter({ name: '', type: 'LAN', connection: '', usage: 'KITCHEN' });
      fetchPrinters();
    } catch (err) {
      console.error('Failed to add printer:', err);
    }
  };

  const deletePrinter = async (id: string) => {
    if (!window.confirm('Delete this printer configuration?')) return;
    try {
      await api.delete(`/admin/printers/${id}`);
      fetchPrinters();
    } catch (err) {
      console.error('Failed to delete printer:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Hardware Setup</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configure Thermal Printers & KOT Routing</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-red-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Printer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {printers.map((p) => (
          <div key={p.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${p.usage === 'KITCHEN' ? 'bg-orange-500' : 'bg-blue-500'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-red-50 transition duration-300">
                <Printer className="h-6 w-6 text-gray-400 group-hover:text-red-500" />
              </div>
              <button 
                onClick={() => deletePrinter(p.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-1">{p.name}</h3>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 uppercase">{p.usage}</span>
               <span className="text-[10px] font-black bg-red-100 px-2 py-0.5 rounded-full text-red-600 uppercase">{p.type}</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
               {p.type === 'LAN' ? <Wifi className="h-4 w-4 text-blue-500" /> : <Usb className="h-4 w-4 text-gray-500" />}
               <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Connection</p>
                  <p className="text-sm font-bold text-gray-700">{p.connection}</p>
               </div>
               <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            </div>
          </div>
        ))}

        {printers.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
             <div className="p-8 bg-white rounded-full shadow-inner mb-6">
                <Network className="h-16 w-16 text-gray-200" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">No Hardware Linked</h2>
             <p className="text-gray-400 text-sm font-bold max-w-xs mt-2 uppercase tracking-widest leading-tight">Add your first thermal printer to start generating KOTs automatically.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">New Printer</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">Hardware Configuration details</p>
            
            <form onSubmit={handleAddPrinter} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Printer Nickname</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Kitchen Main (Mains)"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition outline-none font-bold"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Interface</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-red-500 outline-none font-bold uppercase text-xs"
                      value={newPrinter.type}
                      onChange={(e) => setNewPrinter({...newPrinter, type: e.target.value})}
                    >
                      <option value="LAN">LAN / Network</option>
                      <option value="USB">USB (Local)</option>
                      <option value="BT">Bluetooth</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Usage</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-red-500 outline-none font-bold uppercase text-xs"
                      value={newPrinter.usage}
                      onChange={(e) => setNewPrinter({...newPrinter, usage: e.target.value})}
                    >
                      <option value="KITCHEN">Kitchen KOT</option>
                      <option value="BILLING">Billing Recap</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Connection Entry</label>
                <div className="relative">
                   <input 
                    type="text"
                    required
                    placeholder={newPrinter.type === 'LAN' ? '192.168.1.100:9100' : '/dev/usb/lp0'}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition outline-none font-bold"
                    value={newPrinter.connection}
                    onChange={(e) => setNewPrinter({...newPrinter, connection: e.target.value})}
                  />
                  <div className="absolute right-4 top-4">
                     {newPrinter.type === 'LAN' ? <Wifi className="h-5 w-5 text-gray-300" /> : <Usb className="h-5 w-5 text-gray-300" />}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-4 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-xl shadow-black/20 flex items-center justify-center gap-2 px-10"
                >
                  <Save className="h-4 w-4" /> Link Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterSettings;
