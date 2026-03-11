import Sidebar from '../components/Sidebar';
import { Outlet, Link } from 'react-router-dom';
import { Bell, Search, Menu, Clock, ExternalLink, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AdminLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10" style={{ borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders, dishes, customers..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-sm transition w-64 md:w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* Date/Time */}
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-gray-700">{timeStr}</p>
              <p className="text-[10px] text-gray-400">{dateStr}</p>
            </div>

            {/* Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl transition ${isNotifOpen ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{notifications.length || 0} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs font-medium">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 group">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                              <ClipboardList className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">New Order Received!</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">By {notif.user?.name || 'Customer'}</p>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                                <Clock className="h-3 w-3" />
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <Link 
                              to={`/orders`} 
                              onClick={() => setIsNotifOpen(false)}
                              className="self-center p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm border border-transparent hover:border-red-100"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    to="/orders" 
                    onClick={() => setIsNotifOpen(false)}
                    className="block text-center py-2.5 text-[11px] font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition bg-gray-50/50"
                  >
                    View All Orders
                  </Link>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* Avatar */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg, #ff4d4d, #e63946)' }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
