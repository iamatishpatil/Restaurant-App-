import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, Edit3, Plus, Trash2 } from 'lucide-react';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', quantity: '', unit: '' });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/admin/inventory/${editingItem.id}`, {
        quantity: parseFloat(editingItem.quantity)
      });
      setIsModalOpen(false);
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to update inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/admin/inventory', {
        ...newItem,
        quantity: parseFloat(newItem.quantity)
      });
      setIsModalOpen(false);
      setNewItem({ itemName: '', quantity: '', unit: '' });
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to add inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await api.delete(`/admin/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete inventory item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500">Track stock levels for your ingredients and supplies.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition font-bold"
        >
          <Plus className="h-5 w-5" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Item Name</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Stock Level</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && !inventory.length ? (
               <tr>
                 <td colSpan={4} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading inventory...</p>
                 </td>
               </tr>
            ) : inventory.length === 0 ? (
               <tr>
                 <td colSpan={4} className="py-20 text-center text-gray-500">
                    <AlertTriangle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    No inventory records found.
                 </td>
               </tr>
            ) : (
              inventory.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.itemName}</td>
                  <td className="px-6 py-4 font-medium">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.quantity < 10 ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase">
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-bold uppercase">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
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
            <h2 className="text-xl font-bold mb-4">{editingItem ? `Update Stock: ${editingItem.itemName}` : 'Add New Inventory Item'}</h2>
            <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-4">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                      value={newItem.itemName}
                      onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit (e.g. kg, L, units)</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity {editingItem && `(${editingItem.unit})`}</label>
                <input 
                  type="number" step="0.1" required
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  value={editingItem ? editingItem.quantity : newItem.quantity}
                  onChange={(e) => editingItem ? setEditingItem({...editingItem, quantity: e.target.value}) : setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="flex-1 px-4 py-2 border rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isLoading ? 'Processing...' : editingItem ? 'Update Stock' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
