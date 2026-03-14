import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Bell, 
  CheckCircle2, 
  Utensils,
  RefreshCw,
  Navigation,
  Receipt,
  ShoppingCart,
  PlusCircle,
  QrCode,
  X as CloseIcon
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

const WaiterDashboard = () => {
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  
  const [newOrder, setNewOrder] = useState({
    tableId: '',
    items: [] as any[]
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [tableBill, setTableBill] = useState<any>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordersRes, menuRes, tablesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', config),
        axios.get('http://localhost:5000/api/admin/menu', config),
        axios.get('http://localhost:5000/api/tables', config)
      ]);
      
      setAllOrders(ordersRes.data.filter((o: any) => o.status !== 'COMPLETED'));
      const readyOnly = ordersRes.data.filter((o: any) => o.status === 'READY');
      setReadyOrders(readyOnly);
      setMenuItems(menuRes.data);
      setTables(tablesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const printBill = async (orderId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/bill`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Bill sent to printer');
    } catch (err) {
      console.error('Failed to print bill:', err);
      alert('Printing failed');
    }
  };

  const markAsServed = async (orderId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: 'SERVED' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
    } catch (err) {
      console.error('Failed to mark as served:', err);
    }
  };

  const markAsPaid = async (orderId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: 'COMPLETED' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Waiter App Connected');
      socket.emit('join_room', 'waiters');
    });

    socket.on('order_ready', (order) => {
      console.log('New Food Ready:', order);
      setReadyOrders(prev => [order, ...prev]);
      
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3');
      audio.play().catch(() => console.log('Audio play blocked'));
    });

    socket.on('status_update', ({ orderId, status }) => {
      if (status !== 'READY') {
        setReadyOrders(prev => prev.filter(o => o.id !== orderId));
      }
      fetchInitialData(); // Refresh all orders tracking
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchInitialData]);

  // QR Scanner Logic
  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.tableNumber) {
            handleScanSuccess(data.tableNumber);
            scanner.clear();
            setIsScannerOpen(false);
          }
        } catch (e) {
          console.error("Invalid QR Code", e);
        }
      }, (error) => {
        // Suppress scanning errors
      });

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [isScannerOpen]);

  const handleScanSuccess = async (tableNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Find the table ID by Number
      const table = tables.find(t => t.tableNumber === tableNumber);
      if (!table) throw new Error("Table not found");

      // 2. Fetch Aggregated Bill
      const res = await axios.get(`http://localhost:5000/api/tables/${table.id}/bill`, config);
      setTableBill(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to fetch table bill");
    }
  };

  const settleTable = async () => {
    if (!tableBill) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Mark all orders as COMPLETED (and auto-paid in backend logic)
      await Promise.all(tableBill.orders.map((orderId: string) => 
        axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'COMPLETED' }, config)
      ));

      setTableBill(null);
      fetchInitialData();
      alert(`Table ${tables.find(t => t.id === tableBill.tableId)?.tableNumber} settled successfully!`);
    } catch (err) {
      console.error("Settlement failed", err);
    }
  };

  const handleCreateManualOrder = async () => {
    if (!newOrder.tableId || newOrder.items.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const totalPrice = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await axios.post('http://localhost:5000/api/orders', {
        ...newOrder,
        totalPrice,
        deliveryType: 'PICKUP', // In-restaurant
        paymentMethod: 'COD'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsOrderModalOpen(false);
      setNewOrder({ tableId: '', items: [] });
      fetchInitialData();
    } catch (err) {
      console.error('Failed to create manual order', err);
      alert('Order creation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col -m-8">
      {/* Mobile-style Header */}
      <div className="bg-white p-6 pt-10 sticky top-0 z-20 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Service</h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Waiter Terminal</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOrderModalOpen(true)}
            className="bg-gray-900 text-white p-3 rounded-2xl flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">New Order</span>
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-red-500 text-white p-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-red-200"
          >
            <QrCode className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">Scan Table</span>
          </button>
          <div className="relative bg-red-50 p-3 rounded-2xl">
            <Bell className="h-6 w-6 text-red-500" />
            {readyOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {readyOrders.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Active Pickups */}
        {readyOrders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Ready for Table Service</h3>
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-red-500/5 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                         <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Ready</span>
                         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Order #{order.orderNumber || order.id.slice(-4)}</span>
                     </div>
                     <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Table {order.table?.tableNumber || '??'}</h2>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                   <div className="space-y-2">
                      {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-xl">
                          <span className="text-sm font-bold text-gray-700">{item.menuItem.name}</span>
                          <span className="h-7 w-7 bg-red-50 text-red-500 text-xs font-black flex items-center justify-center rounded-lg">x{item.quantity}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => markAsServed(order.id)}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" /> Confirm Delivery
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Regular Orders for Billing */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Active Orders (Billing)</h3>
          {allOrders.filter(o => o.status !== 'READY').length === 0 && readyOrders.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-30">
               <Utensils className="h-12 w-12 text-gray-400 mb-2" />
               <p className="font-black text-[10px] uppercase tracking-widest">No active orders</p>
            </div>
          )}
          {allOrders.filter(o => o.status !== 'READY').map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-gray-900 tracking-tighter">Table {order.table?.tableNumber || '??'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.status}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => printBill(order.id)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition"
                  title="Print Bill"
                >
                  <Receipt className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => markAsPaid(order.id)}
                  className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition"
                  title="Mark Paid"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">New Order</h2>
              <button onClick={() => setIsOrderModalOpen(false)} className="bg-gray-100 p-2 rounded-full"><CloseIcon /></button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Table</label>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setNewOrder({...newOrder, tableId: t.id})}
                      className={`py-3 rounded-2xl font-black text-sm transition ${newOrder.tableId === t.id ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                    >
                      T-{t.tableNumber}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Items</label>
                <div className="space-y-2">
                  {menuItems.map(item => {
                    const existing = newOrder.items.find(i => i.menuItemId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-3xl">
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatINR(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {existing && (
                            <>
                              <button 
                                onClick={() => {
                                  if (existing.quantity === 1) {
                                    setNewOrder({...newOrder, items: newOrder.items.filter(i => i.menuItemId !== item.id)});
                                  } else {
                                    setNewOrder({...newOrder, items: newOrder.items.map(i => i.menuItemId === item.id ? {...i, quantity: i.quantity - 1} : i)});
                                  }
                                }}
                                className="h-8 w-8 bg-white text-gray-900 rounded-xl font-black shadow-sm"
                              >-</button>
                              <span className="font-black w-4 text-center">{existing.quantity}</span>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              if (existing) {
                                setNewOrder({...newOrder, items: newOrder.items.map(i => i.menuItemId === item.id ? {...i, quantity: i.quantity + 1} : i)});
                              } else {
                                setNewOrder({...newOrder, items: [...newOrder.items, { menuItemId: item.id, quantity: 1, price: item.price }]});
                              }
                            }}
                            className="h-8 w-8 bg-red-500 text-white rounded-xl font-black shadow-lg"
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateManualOrder}
              disabled={!newOrder.tableId || newOrder.items.length === 0}
              className="w-full mt-8 py-5 bg-gray-900 disabled:opacity-30 text-white font-black rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" /> Create Order
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 pb-4 flex justify-between items-center">
               <h2 className="text-2xl font-black tracking-tight">Scan Table QR</h2>
               <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-gray-100 rounded-full">
                 <CloseIcon className="h-5 w-5" />
               </button>
            </div>
            <div className="p-8 pt-0">
               <div id="reader" className="rounded-3xl overflow-hidden border-4 border-gray-50"></div>
               <p className="text-center text-xs text-gray-400 mt-6 font-bold uppercase tracking-widest">Point camera at the table QR code</p>
            </div>
          </div>
        </div>
      )}

      {/* Final Billing Modal */}
      {tableBill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Final Bill</h2>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Table #{tables.find(t => t.id === tableBill.tableId)?.tableNumber}</p>
              </div>
              <button onClick={() => setTableBill(null)} className="bg-gray-100 p-2 rounded-full"><CloseIcon /></button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {tableBill.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.quantity} units &bull; {formatINR(item.price)}</p>
                   </div>
                   <p className="font-black text-gray-900">{formatINR(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
               <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Total Amount</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">{formatINR(tableBill.totalAmount)}</span>
               </div>

               <button 
                 onClick={settleTable}
                 className="w-full py-5 bg-green-500 text-white font-black rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all outline-none"
               >
                 Mark Paid & Close Table
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Hint */}
      {readyOrders.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-bounce">
            <Navigation className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Deliver to Tables Now</span>
         </div>
      )}
    </div>
  );
};

export default WaiterDashboard;
