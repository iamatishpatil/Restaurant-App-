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
  XCircle
} from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-500">Manage and track all incoming restaurant orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'PREPARING', 'COOKING', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${filterStatus === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ID or Customer..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading && <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading && !orders.length ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500 font-medium">Fetching orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
            <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div key={order.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-full bg-gray-50 flex-shrink-0">
                  {getStatusIcon(order.status)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 truncate">Order #{order.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.deliveryType === 'DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {order.deliveryType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">Customer: <span className="font-medium text-gray-700">{order.user?.name}</span> • {order.totalItems} items</p>
                  {order.deliveryType === 'DELIVERY' && order.address && (
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Deliver to: {order.address.addressLine1}, {order.address.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-gray-800">${order.totalPrice}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm outline-none focus:ring-1 focus:ring-primary bg-gray-50 font-medium cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="COOKING">Cooking</option>
                    <option value="PACKING">Packing</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )))}
      </div>
    </div>
  );
};

export default OrderManagement;
