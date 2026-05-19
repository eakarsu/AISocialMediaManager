import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Loader, Star, AlertTriangle } from 'lucide-react';

const API = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const HEALTH_COLORS = {
  'Strong': 'bg-green-100 text-green-800',
  'Good': 'bg-blue-100 text-blue-800',
  'Needs Improvement': 'bg-yellow-100 text-yellow-800',
  'Poor': 'bg-red-100 text-red-800',
};

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/ai/analyze-performance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-indigo-600" /> AI Performance Analytics
        </h1>
        <p className="text-gray-500 mt-1">AI analyzes your top and bottom performing posts and generates strategy recommendations.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : <><BarChart2 className="w-4 h-4" /> Analyze Performance</>}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500 mb-2">Overall Health</p>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${HEALTH_COLORS[result.overall_health] || 'bg-gray-100'}`}>
                {result.overall_health}
              </span>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500 mb-2">Engagement Patterns</p>
              <p className="text-sm text-gray-800">{result.engagement_patterns}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {result.top_performers?.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" /> Top Performers
                </h3>
                <div className="space-y-2">
                  {result.top_performers.map((p, i) => (
                    <div key={i} className="border border-green-100 bg-green-50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-green-700">Post #{p.post_id}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.bottom_performers?.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" /> Bottom Performers
                </h3>
                <div className="space-y-2">
                  {result.bottom_performers.map((p, i) => (
                    <div key={i} className="border border-red-100 bg-red-50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-red-700">Post #{p.post_id}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.best_platforms?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Best Platforms</h3>
              <div className="flex gap-2 flex-wrap">
                {result.best_platforms.map((p, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">{p}</span>
                ))}
              </div>
            </div>
          )}

          {result.strategy_recommendations?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Strategy Recommendations
              </h3>
              <ul className="space-y-2">
                {result.strategy_recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold mt-0.5">{i + 1}.</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.summary && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm text-indigo-800">{result.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
