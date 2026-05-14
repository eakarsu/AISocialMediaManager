import { useState, useEffect } from 'react';
import { Clock, RefreshCw, CheckCircle, XCircle, Loader, PlayCircle } from 'lucide-react';

const API = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

const PLATFORM_COLORS = {
  Instagram: 'bg-pink-100 text-pink-700',
  Twitter: 'bg-sky-100 text-sky-700',
  LinkedIn: 'bg-blue-100 text-blue-700',
  Facebook: 'bg-indigo-100 text-indigo-700',
};

export default function ScheduledPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/scheduler/pending`, { headers: getHeaders() });
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/ai/scheduler/status`, { headers: getHeaders() });
      const data = await res.json();
      setSchedulerStatus(data);
    } catch { }
  };

  useEffect(() => {
    fetchPosts();
    fetchStatus();
  }, []);

  const handleRunScheduler = async () => {
    setRunLoading(true); setRunResult(null);
    try {
      const res = await fetch(`${API}/scheduler/run`, { headers: getHeaders() });
      const data = await res.json();
      setRunResult(data);
      fetchPosts();
      fetchStatus();
    } catch (err) {
      setRunResult({ error: err.message });
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-indigo-600" /> Scheduled Posts
        </h1>
        <p className="text-gray-500 mt-1">View and manage all scheduled posts. Scheduler runs automatically every minute.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {schedulerStatus && (
          <>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-gray-500 text-sm">Scheduler Status</p>
              <p className="font-semibold text-green-600 mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> {schedulerStatus.scheduler}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-gray-500 text-sm">Scheduled Posts</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{schedulerStatus.scheduled_posts}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-gray-500 text-sm">Published Today</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{schedulerStatus.published_today}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleRunScheduler}
          disabled={runLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {runLoading ? <Loader className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          Run Scheduler Now
        </button>
        <button onClick={() => { fetchPosts(); fetchStatus(); }} className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {runResult && (
        <div className={`rounded-xl p-4 mb-4 text-sm ${runResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {runResult.message || runResult.error}
          {runResult.published?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {runResult.published.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Post #{p.id} on {p.platform}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No scheduled posts pending</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[post.platform] || 'bg-gray-100 text-gray-600'}`}>
                        {post.platform}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status] || 'bg-gray-100'}`}>
                        {post.status}
                      </span>
                      {post.aiGenerated && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">AI Generated</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 truncate">{post.content}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400">Scheduled</p>
                    <p className="text-sm font-medium text-gray-700">
                      {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
