import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api';

const METRICS = [
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
];

const PLATFORM_COLORS = {
  Instagram: '#E1306C',
  Twitter: '#1DA1F2',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  TikTok: '#69C9D0',
};

export default function EngagementTimeline() {
  const [data, setData] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [metric, setMetric] = useState('likes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/custom-views/engagement-timeline')
      .then((res) => {
        setData(res.data.data || []);
        setPlatforms(res.data.platforms || []);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 text-sm">Loading engagement timeline...</div>;
  if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Engagement Timeline (Last 30 Days)</h2>
          <p className="text-xs text-gray-500">Daily {metric} per platform</p>
        </div>
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                metric === m.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {platforms.map((p) => (
              <Line
                key={p}
                type="monotone"
                dataKey={`${p}_${metric}`}
                name={p}
                stroke={PLATFORM_COLORS[p] || '#6366f1'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
