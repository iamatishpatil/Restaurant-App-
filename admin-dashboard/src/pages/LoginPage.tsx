import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShoppingBag } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isPhone = /^\d+$/.test(identifier);
      const payload = isPhone ? { phone: identifier, password } : { email: identifier, password };
      const res = await axios.post('http://localhost:5000/api/auth/login', payload);
      if (res.data.user.role !== 'ADMIN' && res.data.user.role !== 'MANAGER') {
        setError('Access denied: You are not an admin');
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary rounded-full mb-4">
            <ShoppingBag className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Admin</h1>
          <p className="text-gray-500">Secure Management Console</p>
        </div>

        {error && <div className="p-3 mb-4 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Phone Number</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <LogIn className="h-5 w-5" /> Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
