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

  const filteredOrders = orders.filter((o: any) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.deliveryType === 'DELIVERY' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {order.deliveryType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      <span className="font-medium text-gray-700">{order.user?.name}</span> &bull; {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
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

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-400 bg-gray-50 font-medium cursor-pointer transition hover:border-gray-300"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="COOKING">Cooking</option>
                      <option value="PACKING">Packing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-500 rounded-xl transition">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
