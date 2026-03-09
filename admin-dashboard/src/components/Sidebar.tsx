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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/menu', icon: Utensils, label: 'Menu Management' },
    { to: '/categories', icon: Layers, label: 'Categories' },
    { to: '/banners', icon: ImageIcon, label: 'Banners' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/staff', icon: Shield, label: 'Staff Management' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/coupons', icon: Tag, label: 'Coupons' },
    { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`w-64 bg-secondary h-screen text-white flex flex-col fixed left-0 top-0 z-50 transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AdminPanel</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
