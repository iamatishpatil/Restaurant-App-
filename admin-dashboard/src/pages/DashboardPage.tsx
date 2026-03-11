import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';
import { getImageUrl, onImageError } from '../utils/imageUtils';

const defaultData = [
  { name: 'Mon', revenue: 14000, orders: 24 },
  { name: 'Tue', revenue: 23000, orders: 38 },
  { name: 'Wed', revenue: 18000, orders: 29 },
  { name: 'Thu', revenue: 27800, orders: 45 },
  { name: 'Fri', revenue: 31890, orders: 58 },
  { name: 'Sat', revenue: 42390, orders: 72 },
  { name: 'Sun', revenue: 38490, orders: 63 },
];

const StatCard = ({ title, value, icon: Icon, trend, gradient, iconBg }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-6 translate-x-6" style={{ background: gradient }} />
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 rounded-xl" style={{ background: iconBg }}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
        {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(trend)}%
      </div>
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
        <p className="font-semibold text-gray-300 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'revenue' ? formatINR(p.value) : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 0,
    activeOrders: 0,
    newCustomers: 0,
    orderGrowth: 0,
    chartData: defaultData,
    topSelling: [],
    lowSelling: [],
    topRated: []
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && analytics.totalRevenue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        <p className="text-gray-400 font-medium text-sm">Loading analytics...</p>
      </div>
    );
  }

  const PerformanceCard = ({ title, items, type }: { title: string, items: any[], type: 'sales' | 'rating' }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No data available</p>
        ) : items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
              <img 
                src={getImageUrl(item.image)} 
                onError={onImageError} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
                <div 
                  className={`h-full rounded-full ${type === 'sales' ? (title.includes('Top') ? 'bg-green-500' : 'bg-orange-400') : 'bg-yellow-400'}`} 
                  style={{ width: `${type === 'sales' ? Math.min(100, (item.sales / (items[0]?.sales || 1)) * 100) : (item.rating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">
                {type === 'sales' ? `${item.sales} sold` : `${item.rating} ★`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400 text-sm">Here's what's happening at your restaurant today.</p>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Livereal-time
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden sm:block text-[11px] font-medium text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-red-300 hover:text-red-500 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Revenue" value={formatINR(analytics.totalRevenue)} icon={IndianRupee} trend={12.5} gradient="linear-gradient(135deg,#22c55e,#16a34a)" iconBg="linear-gradient(135deg,#22c55e,#16a34a)" />
        <StatCard title="Active Orders" value={analytics.activeOrders} icon={ShoppingBag} trend={8.2} gradient="linear-gradient(135deg,#3b82f6,#2563eb)" iconBg="linear-gradient(135deg,#3b82f6,#2563eb)" />
        <StatCard title="New Customers" value={analytics.newCustomers} icon={Users} trend={-3.1} gradient="linear-gradient(135deg,#a855f7,#7c3aed)" iconBg="linear-gradient(135deg,#a855f7,#7c3aed)" />
        <StatCard title="Order Growth" value={`${analytics.orderGrowth}%`} icon={TrendingUp} trend={4.5} gradient="linear-gradient(135deg,#f97316,#ea580c)" iconBg="linear-gradient(135deg,#f97316,#ea580c)" />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PerformanceCard title="Top Selling Items" items={analytics.topSelling || []} type="sales" />
        <PerformanceCard title="Low Performing (Needs Attention)" items={analytics.lowSelling || []} type="sales" />
        <PerformanceCard title="Top Rated by Customers" items={analytics.topRated || []} type="rating" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-xs text-gray-400">Week-over-week in INR</p>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">+12.5%</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#ff4d4d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Order Volume</h2>
              <p className="text-xs text-gray-400">Daily order count this week</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">+8.2%</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}
                  fill="url(#barGradient)"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
