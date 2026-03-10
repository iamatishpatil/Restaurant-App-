import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const AdminLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <button className="relative p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </button>

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
