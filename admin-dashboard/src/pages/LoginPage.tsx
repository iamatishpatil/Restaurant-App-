import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Utensils, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const isPhone = /^\d+$/.test(identifier);
      const payload = isPhone ? { phone: identifier, password } : { email: identifier, password };
      const res = await axios.post('http://localhost:5000/api/auth/login', payload);
      if (res.data.user.role !== 'ADMIN' && res.data.user.role !== 'MANAGER') {
        setError('Access denied: You are not an admin.');
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #ff4d4d 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ff8c00 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white text-center">
          <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(255,77,77,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,77,77,0.3)' }}>
            <Utensils className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Restaurant Admin</h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xs">Your complete restaurant management solution</p>
          <div className="space-y-5 w-full max-w-sm">
            {[
              { icon: '📊', title: 'Real-time Analytics', desc: 'Monitor revenue & orders live' },
              { icon: '🍽️', title: 'Menu Control', desc: 'Manage dishes & categories' },
              { icon: '🚀', title: 'Order Management', desc: 'Track every order status' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 text-left rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-red-500 rounded-xl">
              <Utensils className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Restaurant Admin</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
              <p className="text-gray-500 text-sm">Sign in to your admin dashboard</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Phone</label>
                <input
                  type="text"
                  required
                  placeholder="admin@restaurant.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm bg-gray-50 focus:bg-white"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm bg-gray-50 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: isLoading ? '#ccc' : 'linear-gradient(135deg, #ff4d4d, #e63946)' }}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-medium text-center">
                🔐 Secure access — Admin & Manager roles only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
