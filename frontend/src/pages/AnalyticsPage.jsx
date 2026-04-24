import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Eye, Heart, Share2 } from 'lucide-react';
import api from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function AnalyticsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/analytics').then(r => setItems(r.data));
    api.get('/dashboard/stats').then(r => setStats(r.data));
  }, []);

  const platformData = items.reduce((acc, item) => {
    const existing = acc.find(a => a.platform === item.platform);
    if (existing) existing.value += Number(item.value);
    else acc.push({ platform: item.platform, value: Number(item.value) });
    return acc;
  }, []);

  const dailyData = items.map((item, i) => ({
    date: item.date,
    value: Number(item.value),
    metric: item.metric,
  }));

  const metricCards = [
    { label: 'Total Impressions', value: stats.totalImpressions?.toLocaleString() || '0', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Likes', value: stats.totalLikes?.toLocaleString() || '0', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { label: 'Total Shares', value: stats.totalShares?.toLocaleString() || '0', icon: Share2, color: 'from-green-500 to-emerald-500' },
    { label: 'Engagement Rate', value: `${stats.engagementRate || 0}%`, icon: TrendingUp, color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Performance metrics across all platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Performance by Platform</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="platform" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="platform" label={({ platform }) => platform}>
                {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Metrics Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
