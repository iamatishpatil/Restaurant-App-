import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoryManagement from './pages/CategoryManagement';
import CouponManagement from './pages/CouponManagement';
import BannerManagement from './pages/BannerManagement';
import InventoryManagement from './pages/InventoryManagement';
import StaffManagement from './pages/StaffManagement';
import CustomerManagement from './pages/CustomerManagement';
import ReviewModeration from './pages/ReviewModeration';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import TableManagement from './pages/TableManagement';
import KDSPage from './pages/KDSPage';
import WaiterDashboard from './pages/WaiterDashboard';
import PrinterSettings from './pages/PrinterSettings';
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './components/AdminLayout';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their primary dashboard if they try to access a forbidden route
    if (user.role === 'CHEF') return <Navigate to="/kds" />;
    if (user.role === 'WAITER') return <Navigate to="/waiter" />;
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute children={<AdminLayout />} />}>
            <Route index element={<RoleBasedRedirect />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><DashboardPage /></ProtectedRoute>} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="tables" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><TableManagement /></ProtectedRoute>} />
            <Route path="kds" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><KDSPage /></ProtectedRoute>} />
            <Route path="waiter" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><WaiterDashboard /></ProtectedRoute>} />
            <Route path="printers" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterSettings /></ProtectedRoute>} />
            <Route path="menu" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><MenuManagement /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CategoryManagement /></ProtectedRoute>} />
            <Route path="coupons" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CouponManagement /></ProtectedRoute>} />
            <Route path="banners" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><BannerManagement /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><InventoryManagement /></ProtectedRoute>} />
            <Route path="staff" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><StaffManagement /></ProtectedRoute>} />
            <Route path="customers" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CustomerManagement /></ProtectedRoute>} />
            <Route path="reviews" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ReviewModeration /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><SettingsPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'CHEF') return <Navigate to="/kds" />;
  if (user.role === 'WAITER') return <Navigate to="/waiter" />;
  return <Navigate to="/dashboard" />;
};

export default App;
