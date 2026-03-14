import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ClipboardList, 
  Users, 
  Tag, 
  LogOut,
  Settings,
  Layers,
  Image as ImageIcon,
  Package,
  Shield,
  MessageSquare,
  X,
  ChevronRight,
  LayoutGrid,
  ChefHat,
  BellRing,
  Printer as PrinterIcon,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/orders', icon: ClipboardList, label: 'Orders', color: 'text-orange-400', roles: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'] },
    { to: '/tables', icon: LayoutGrid, label: 'Tables', color: 'text-pink-400', roles: ['ADMIN', 'MANAGER', 'WAITER'] },
    { to: '/kds', icon: ChefHat, label: 'Kitchen Display', color: 'text-blue-400', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { to: '/waiter', icon: BellRing, label: 'Waiter Dashboard', color: 'text-amber-400', roles: ['ADMIN', 'MANAGER', 'WAITER'] },
    { to: '/menu', icon: Utensils, label: 'Menu Management', color: 'text-green-400', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { to: '/categories', icon: Layers, label: 'Categories', color: 'text-purple-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/banners', icon: ImageIcon, label: 'Banners', color: 'text-pink-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/inventory', icon: Package, label: 'Inventory', color: 'text-yellow-400', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { to: '/staff', icon: Shield, label: 'Staff Management', color: 'text-cyan-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/customers', icon: Users, label: 'Customers', color: 'text-indigo-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/coupons', icon: Tag, label: 'Coupons', color: 'text-red-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/reviews', icon: MessageSquare, label: 'Reviews', color: 'text-teal-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/reservations', icon: Calendar, label: 'Reservations', color: 'text-indigo-400', roles: ['ADMIN', 'MANAGER'] },
    { to: '/printers', icon: PrinterIcon, label: 'Printer Setup', color: 'text-gray-300', roles: ['ADMIN', 'MANAGER'] },
    { to: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-400', roles: ['ADMIN', 'MANAGER'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setIsOpen(false)}
      />
      <div 
        className={`w-64 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #ff4d4d, #e63946)' }}>
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">Admin Panel</span>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Restaurant Suite</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, rgba(255,77,77,0.25), rgba(255,77,77,0.1))', border: '1px solid rgba(255,77,77,0.25)' } : { border: '1px solid transparent' }}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-red-400' : item.color} group-hover:scale-110`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-red-400 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff4d4d, #e63946)' }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-400 hover:text-red-400 transition-all duration-200 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
