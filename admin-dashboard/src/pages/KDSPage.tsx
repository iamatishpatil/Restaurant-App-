import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  ChefHat, 
  Timer, 
  CheckCircle2, 
  Play, 
  UtensilsCrossed, 
  AlertCircle,
  Clock
} from 'lucide-react';

const KDSPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Only show active kitchen orders (NEW_ORDER, ACCEPTED, PREPARING)
      const activeOrders = res.data.filter((o: any) => 
        ['NEW_ORDER', 'ACCEPTED', 'PREPARING'].includes(o.status)
      );
      setOrders(activeOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('KDS Connected to Socket.io');
      newSocket.emit('join_room', 'kitchen');
    });

    newSocket.on('new_order', (order) => {
      console.log('New Order Received via Socket:', order);
      setOrders(prev => [order, ...prev]);
      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(() => console.log('Audio play blocked'));
    });

    newSocket.on('status_update', ({ orderId, status }) => {
      if (['READY', 'SERVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        fetchOrders(); // Refresh to get correct sequencing
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      // Local state will be updated via socket listener 'status_update'
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'NEW_ORDER': return { label: 'New', color: 'bg-red-500', icon: AlertCircle };
      case 'ACCEPTED':  return { label: 'Accepted', color: 'bg-blue-500', icon: CheckCircle2 };
      case 'PREPARING': return { label: 'Cooking', color: 'bg-orange-500', icon: ChefHat };
      default: return { label: status, color: 'bg-gray-500', icon: Clock };
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
    <div className="h-screen flex flex-col -m-8 bg-gray-900 overflow-hidden">
      {/* KDS Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center shadow-2xl relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-500/20">
            <ChefHat className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">Kitchen Display System</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold uppercase tracking-widest">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div> Live Connection
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
                {orders.length} Active Tickets
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-gray-900 rounded-2xl border border-gray-700 flex flex-col items-center justify-center min-w-[120px]">
             <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Kitchen Load</span>
             <span className="text-xl font-black text-white leading-none tracking-tighter">
                {orders.filter(o => o.status === 'PREPARING').length} <span className="text-sm text-gray-600">/</span> {orders.length}
             </span>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 overflow-x-auto p-8 flex gap-6 items-start scrollbar-hide bg-[#0b0f1a]">
        {orders.map((order) => {
          const config = getStatusConfig(order.status);
          const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
          
          return (
            <div key={order.id} className="w-[380px] flex-shrink-0 flex flex-col bg-gray-800 rounded-[2.5rem] border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Ticket Header */}
              <div className={`${config.color} p-5 text-white flex justify-between items-start`}>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">#{order.orderNumber || order.id.slice(-4)}</span>
                      <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">Table {order.table?.tableNumber || 'N/A'}</span>
                   </div>
                   <h2 className="text-2xl font-black tracking-tighter uppercase">{order.user?.name || 'Guest User'}</h2>
                </div>
                <div className="bg-black/20 p-2 rounded-xl backdrop-blur-md flex flex-col items-center min-w-[50px]">
                   <Timer className="h-4 w-4 mb-0.5" />
                   <span className="text-[10px] font-black">{timeElapsed}m</span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {order.orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-lg font-black text-red-500 border border-gray-700">
                      {item.quantity}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold leading-tight group-hover:text-red-400 transition cursor-default">{item.menuItem.name}</p>
                      {item.notes && (
                         <p className="text-yellow-400 text-xs italic mt-1 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20">
                            " {item.notes} "
                         </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex gap-4">
                {order.status === 'NEW_ORDER' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ACCEPTED')}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Accept Task
                  </button>
                )}
                {order.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'PREPARING')}
                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" /> Start Cooking
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'READY')}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <UtensilsCrossed className="h-4 w-4" /> Mark Ready
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
           <div className="h-full w-full flex flex-col items-center justify-center text-gray-700">
              <div className="p-10 bg-gray-800 rounded-full mb-6 border border-gray-700">
                 <ChefHat className="h-24 w-24 opacity-20" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase opacity-30">Kitchen is Clean</h2>
              <p className="font-bold opacity-30 tracking-widest text-xs mt-2 uppercase">Waiting for incoming tickets...</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default KDSPage;
