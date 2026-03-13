import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Eye,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ChefHat,
  ClipboardList,
  Search,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'PREPARING': return <ChefHat className="h-4 w-4 text-blue-500" />;
      case 'PACKING': return <Package className="h-4 w-4 text-purple-500" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'DELIVERED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;

      default: return <Clock className="h-4 w-4" />;
    }
  };

  const statusPriority: Record<string, number> = {
    PENDING: 1,
    PREPARING: 2,
    COOKING: 2,
    PACKING: 2,
    OUT_FOR_DELIVERY: 2,
    DELIVERED: 3,
    CANCELLED: 3,
  };

  const filteredOrders = orders
    .filter((o: any) => {
      const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a: any, b: any) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Secondary sort: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    PENDING:          { label: 'Pending',          bg: 'bg-yellow-50',  text: 'text-yellow-700' },
    PREPARING:        { label: 'Preparing',        bg: 'bg-blue-50',    text: 'text-blue-700' },
    COOKING:          { label: 'Cooking',          bg: 'bg-orange-50',  text: 'text-orange-700' },
    PACKING:          { label: 'Packing',          bg: 'bg-purple-50',  text: 'text-purple-700' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-indigo-50',  text: 'text-indigo-700' },
    DELIVERED:        { label: 'Delivered',        bg: 'bg-green-50',   text: 'text-green-700' },
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
          {['ALL', 'PENDING', 'PREPARING', 'COOKING', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
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
                      {order.payment && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.payment.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {order.payment.status === 'COMPLETED' ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.deliveryType === 'DELIVERY' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {order.deliveryType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      <span className="font-medium text-gray-700">{order.user?.name || 'Guest'}</span> &bull; {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                    </p>
                    {order.deliveryType === 'DELIVERY' && order.address && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {order.address.addressLine1}, {order.address.city}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-base font-extrabold text-gray-900">{formatINR(order.totalPrice)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-400 bg-gray-50 font-semibold cursor-pointer transition hover:border-gray-300"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="COOKING">Cooking</option>
                      <option value="PACKING">Packing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
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
                      <p className="text-sm font-black text-green-700">{selectedOrderDetail.payment?.method || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedOrderDetail.payment?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedOrderDetail.payment?.status || 'PENDING'}
                      </span>
                    </div>
                    {selectedOrderDetail.payment?.transactionId && (
                      <div className="pt-2 border-t border-green-100/50 mt-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">TXN Identifier</p>
                        <p className="text-[10px] font-mono font-bold text-gray-700 break-all">{selectedOrderDetail.payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Order Items ({selectedOrderDetail.totalItems})
                </h4>
                <div className="space-y-3">
                  {selectedOrderDetail.orderItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group hover:bg-white hover:border-red-100 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                          {item.menuItem?.image ? (
                            <img 
                              src={`http://localhost:5000${item.menuItem.image}`} 
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
                    <span className="font-bold text-gray-600">{formatINR(selectedOrderDetail.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Delivery Charge</span>
                    <span className="text-green-600 font-black uppercase text-[10px] bg-green-50 px-3 py-1 rounded-full border border-green-100">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-50">
                    <span className="font-black text-gray-900 text-base uppercase tracking-wider">Amount to Pay</span>
                    <span className="text-3xl font-black text-red-500 drop-shadow-sm">{formatINR(selectedOrderDetail.totalPrice)}</span>
                  </div>
                </div>

                {selectedOrderDetail.address && (
                  <div className="mt-8 p-6 rounded-[1.5rem] bg-gray-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Truck className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                       Shipping Destination
                    </p>
                    <p className="text-sm font-black text-white mb-1">{selectedOrderDetail.address.type}</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {selectedOrderDetail.address.addressLine1}, {selectedOrderDetail.address.city}
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
    </div>
  );
};

export default OrderManagement;
