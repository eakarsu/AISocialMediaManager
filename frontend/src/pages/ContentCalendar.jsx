import { useState } from 'react';
import { Calendar, Loader, Download, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const API = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const PLATFORM_COLORS = {
  Instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  Twitter: 'bg-sky-100 text-sky-700 border-sky-200',
  LinkedIn: 'bg-blue-100 text-blue-700 border-blue-200',
  Facebook: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const TYPE_COLORS = {
  educational: 'bg-green-100 text-green-700',
  promotional: 'bg-orange-100 text-orange-700',
  engagement: 'bg-purple-100 text-purple-700',
  entertainment: 'bg-yellow-100 text-yellow-700',
};

export default function ContentCalendar() {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ startDate: new Date().toISOString().split('T')[0], industry: 'technology' });

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/ai/generate-calendar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCalendar(data.calendar || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group calendar entries by week
  const groupedByWeek = calendar.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const weekNum = Math.ceil(((date - new Date(form.startDate)) / 86400000 + 1) / 7);
    const key = `Week ${weekNum}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-600" /> AI Content Calendar
        </h1>
        <p className="text-gray-500 mt-1">Generate a 30-day AI-powered content calendar grounded in your brand voice and campaigns.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. technology, fashion, food"
              value={form.industry}
              onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Calendar className="w-4 h-4" /> Generate 30-Day Calendar</>}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">{error}</div>}

      {calendar.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{calendar.length} posts generated</p>
          </div>
          {Object.entries(groupedByWeek).map(([week, entries]) => (
            <div key={week} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-700 text-sm">{week}</h3>
              </div>
              <div className="divide-y">
                {entries.map((entry, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center w-12">
                        <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className="text-lg font-bold text-gray-800">{new Date(entry.date).getDate()}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLATFORM_COLORS[entry.platform] || 'bg-gray-100 text-gray-700'}`}>
                            {entry.platform}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[entry.type] || 'bg-gray-100 text-gray-700'}`}>
                            {entry.type}
                          </span>
                          {entry.best_time && (
                            <span className="text-xs text-gray-400">{entry.best_time}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mb-1">{entry.content}</p>
                        {entry.hashtags?.length > 0 && (
                          <p className="text-xs text-indigo-500">{entry.hashtags.join(' ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
