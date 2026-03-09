import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const AdminLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-40 md:w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search orders, dishes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
