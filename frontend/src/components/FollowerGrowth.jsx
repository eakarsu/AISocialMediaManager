import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api';

const PLATFORM_COLORS = {
  Instagram: '#E1306C',
  Twitter: '#1DA1F2',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  TikTok: '#69C9D0',
};

export default function FollowerGrowth() {
  const [data, setData] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/custom-views/follower-growth')
      .then((res) => {
        setData(res.data.data || []);
        setPlatforms(res.data.platforms || []);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 text-sm">Loading follower growth...</div>;
  if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

  const totals = platforms.reduce((acc, p) => {
    if (data.length) acc[p] = data[data.length - 1][p];
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Cumulative Follower Growth</h2>
        <p className="text-xs text-gray-500">Stacked area of total followers per platform over the last 30 days</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {platforms.map((p) => (
          <div key={p} className="rounded-lg p-3 border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full" style={{ background: PLATFORM_COLORS[p] || '#6366f1' }} />
              <span className="text-xs font-medium text-gray-700">{p}</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{(totals[p] || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              {platforms.map((p) => (
                <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PLATFORM_COLORS[p] || '#6366f1'} stopOpacity={0.85} />
                  <stop offset="95%" stopColor={PLATFORM_COLORS[p] || '#6366f1'} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {platforms.map((p) => (
              <Area
                key={p}
                type="monotone"
                dataKey={p}
                stackId="1"
                stroke={PLATFORM_COLORS[p] || '#6366f1'}
                fill={`url(#grad-${p})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
