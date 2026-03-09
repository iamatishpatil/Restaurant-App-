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
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './components/AdminLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute children={<AdminLayout />} />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="reviews" element={<ReviewModeration />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
