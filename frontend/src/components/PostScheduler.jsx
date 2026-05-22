import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalIcon, Clock, Image as ImgIcon, Send, X } from 'lucide-react';
import api from '../api';

const PLATFORMS = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function fmtDay(d) {
  return d.toISOString().slice(0, 10);
}
function fmtSlot(d) {
  return d.toISOString();
}

const STATUS_STYLE = {
  queued: 'bg-yellow-100 text-yellow-800',
  posted: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function PostScheduler() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slot, setSlot] = useState(null);
  const [form, setForm] = useState({ platform: 'Instagram', content: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => {
    const today = new Date();
    today.setMinutes(0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const slotMap = useMemo(() => {
    const m = {};
    scheduled.forEach((s) => {
      const d = new Date(s.scheduledAt);
      const key = `${fmtDay(d)}T${d.getHours()}`;
      if (!m[key]) m[key] = [];
      m[key].push(s);
    });
    return m;
  }, [scheduled]);

  function load() {
    setLoading(true);
    api
      .get('/custom-views/scheduled-posts')
      .then((res) => setScheduled(res.data.scheduled || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openSlot(day, hour) {
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    setSlot(d);
    setForm({ platform: 'Instagram', content: '', imageUrl: '' });
  }

  async function submit() {
    if (!slot || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/custom-views/schedule-post', {
        platform: form.platform,
        content: form.content,
        imageUrl: form.imageUrl,
        scheduledAt: fmtSlot(slot),
      });
      setSlot(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading scheduler...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-indigo-600" /> Post Scheduler (Next 14 days)
          </h2>
          <p className="text-xs text-gray-500">Click any hour slot to queue a post.</p>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-gray-600 font-medium">Hour</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="px-2 py-2 text-left text-gray-600 font-medium whitespace-nowrap">
                  {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h} className="border-t border-gray-100">
                <td className="px-2 py-1 text-gray-500 whitespace-nowrap">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {String(h).padStart(2, '0')}:00
                </td>
                {days.map((d) => {
                  const key = `${fmtDay(d)}T${h}`;
                  const items = slotMap[key] || [];
                  return (
                    <td
                      key={key}
                      onClick={() => openSlot(d, h)}
                      className={`px-2 py-1 cursor-pointer min-w-[110px] hover:bg-indigo-50 ${
                        items.length ? 'bg-indigo-100' : ''
                      }`}
                      title="Click to schedule"
                    >
                      {items.length ? (
                        <div className="text-[10px] text-indigo-900 font-medium truncate">
                          {items[0].platform}: {items[0].content.slice(0, 18)}
                          {items.length > 1 && ` +${items.length - 1}`}
                        </div>
                      ) : (
                        <span className="text-gray-300">+</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upcoming list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Upcoming Scheduled Posts</h3>
        {scheduled.length === 0 ? (
          <p className="text-xs text-gray-500">No scheduled posts yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
            {scheduled.slice(0, 20).map((s) => (
              <li key={s.id} className="px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-medium text-gray-800">{s.platform}</span>
                    <span>·</span>
                    <span>{new Date(s.scheduledAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-900 truncate">{s.content}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-700'}`}>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {slot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
              <button onClick={() => setSlot(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              For {slot.toLocaleString()}
            </p>

            <div>
              <label className="text-xs font-medium text-gray-700">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={3}
                placeholder="What's on your mind?"
                className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <ImgIcon className="w-3 h-3" /> Image URL (optional)
              </label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSlot(null)}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.content.trim()}
                className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="w-3 h-3" /> {submitting ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
