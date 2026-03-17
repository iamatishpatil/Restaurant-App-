// Dine-in optimized Order Management
import { useState, useEffect } from 'react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import {
  Eye,
  Clock,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Search,
  XCircle,
  RefreshCw,
  UtensilsCrossed
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    // Only play if this isn't the first load
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const fetchOrders = async () => {
    // If it's already loading, don't poll
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const res = await api.get('/orders');
      const newOrders = res.data;
      
      // If order count increased, play sound (and we've already loaded once)
      if (prevOrderCount > 0 && newOrders.length > prevOrderCount) {
        playNotificationSound();
      }
      
      setOrders(newOrders);
      setPrevOrderCount(newOrders.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, reason?: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status, cancelReason: reason });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'PREPARING': return <ChefHat className="h-4 w-4 text-blue-500" />;
      case 'READY': return <UtensilsCrossed className="h-4 w-4 text-purple-500" />;
      case 'SERVED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;

      default: return <Clock className="h-4 w-4" />;
    }
  };


  const filteredOrders = orders
    .filter((o: any) => {
      const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    PENDING:          { label: 'Pending',          bg: 'bg-yellow-50',  text: 'text-yellow-700' },
    PREPARING:        { label: 'Preparing',        bg: 'bg-blue-50',    text: 'text-blue-700' },
    COOKING:          { label: 'Cooking',          bg: 'bg-orange-50',  text: 'text-orange-700' },
    READY:            { label: 'Ready to Serve',   bg: 'bg-purple-50',  text: 'text-purple-700' },
    SERVED:           { label: 'Served',           bg: 'bg-green-50',   text: 'text-green-700' },
    COMPLETED:        { label: 'Completed',        bg: 'bg-green-50',   text: 'text-green-700' },
    CANCELLED:        { label: 'Cancelled',        bg: 'bg-red-50',     text: 'text-red-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track all incoming restaurant orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                filterStatus === s
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading && <RefreshCw className="animate-spin h-4 w-4 text-gray-400" />}
      </div>

      <div className="space-y-3">
        {isLoading && !orders.length ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-4" />
            <p className="text-gray-400 font-medium text-sm">Fetching orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <ClipboardList className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-semibold">No orders found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const sc = statusConfig[order.status] || { label: order.status, bg: 'bg-gray-50', text: 'text-gray-600' };
            return (
              <div key={order.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                      {order.status === 'PENDING' && (
                        <span className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className="text-[10px] font-black text-red-600 tracking-tighter animate-pulse leading-none">NEW</span>
                        </span>
                      )}
                      {order.payments?.[0] && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.payments[0].status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {order.payments[0].status === 'COMPLETED' ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                      {order.deliveryType !== 'DINE_IN' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.deliveryType === 'DELIVERY' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {order.deliveryType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {order.user?.name || 'Guest'} &bull; {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-base font-extrabold text-gray-900">{formatINR(order.grandTotal)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === 'CANCELLED') {
                          setCancellingOrder(order);
                        } else {
                          updateStatus(order.id, newStatus);
                        }
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-400 bg-gray-50 font-semibold cursor-pointer transition hover:border-gray-300"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready to Serve</option>
                      <option value="SERVED">Served</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => setSelectedOrderDetail(order)}
                      className="p-2.5 bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm border border-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Order Summary</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-red-500 font-black uppercase tracking-widest">#{selectedOrderDetail.id.slice(0, 16).toUpperCase()}</p>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <p className="text-xs text-gray-400 font-bold">{new Date(selectedOrderDetail.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="p-3 hover:bg-red-50 rounded-2xl transition text-gray-400 hover:text-red-500 group border border-transparent hover:border-red-100"
              >
                <XCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Customer Data
                  </h4>
                  <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50 space-y-2">
                    <p className="font-bold text-gray-900">{selectedOrderDetail.user?.name || 'Guest User'}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 flex items-center gap-2">📞 {selectedOrderDetail.user?.phone || 'No phone'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">✉️ {selectedOrderDetail.user?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Payment Info
                  </h4>
                  <div className="p-4 rounded-2xl bg-green-50/30 border border-green-100/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Method</p>
                      <p className="text-sm font-black text-green-700">{selectedOrderDetail.payments?.[0]?.method || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedOrderDetail.payments?.[0]?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedOrderDetail.payments?.[0]?.status || 'PENDING'}
                      </span>
                    </div>
                    {selectedOrderDetail.payments?.[0]?.transactionId && (
                      <div className="pt-2 border-t border-green-100/50 mt-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">TXN Identifier</p>
                        <p className="text-[10px] font-mono font-bold text-gray-700 break-all">{selectedOrderDetail.payments[0].transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Order Items ({selectedOrderDetail.orderItems?.length || 0})
                </h4>
                <div className="space-y-3">
                  {(selectedOrderDetail.orderItems || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group hover:bg-white hover:border-red-100 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                          {item.menuItem?.image ? (
                            <img 
                              src={getImageUrl(item.menuItem.image)} 
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => e.target.src = 'https://placehold.co/100x100?text=Food'}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-red-500 font-black bg-red-50">
                              {item.quantity}x
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 group-hover:text-red-600 transition-colors">{item.menuItem?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-400 font-medium">Qty: <span className="text-gray-900 font-bold">{item.quantity}</span> &bull; {formatINR(item.price)}</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-900 text-sm">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                    <span className="font-bold text-gray-600">{formatINR(selectedOrderDetail.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-50">
                    <span className="font-black text-gray-900 text-base uppercase tracking-wider">Total Amount</span>
                    <span className="text-3xl font-black text-red-500 drop-shadow-sm">{formatINR(selectedOrderDetail.grandTotal)}</span>
                  </div>
                </div>

                {selectedOrderDetail.table && (
                  <div className="mt-8 p-6 rounded-[1.5rem] bg-gray-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <UtensilsCrossed className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                       Dining Location
                    </p>
                    <p className="text-sm font-black text-white mb-1">Table #{selectedOrderDetail.table.tableNumber}</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      Table Capacity: {selectedOrderDetail.table.capacity} guests
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="w-full py-4 bg-gray-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition shadow-lg shadow-gray-200 active:scale-[0.98]"
              >
                Return to Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Decline Order</h3>
              <button onClick={() => setCancellingOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Please provide a reason for declining this order. This message will be shown to the customer.
              </p>
              <textarea
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 text-sm bg-gray-50 h-32 resize-none transition"
                placeholder="e.g. Sorry, the Blue Cheese Burger is currently out of stock. Please try our Classic Veg Burger!"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-200"
                >
                  Go Back
                </button>
                <button 
                  disabled={!cancelReason.trim()}
                  onClick={() => {
                    updateStatus(cancellingOrder.id, 'CANCELLED', cancelReason);
                    setCancellingOrder(null);
                    setCancelReason('');
                  }}
                  className="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Decline Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
