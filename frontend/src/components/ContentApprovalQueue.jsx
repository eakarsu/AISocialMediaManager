import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import api from '../api';

const DECISION_STYLE = {
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  edits_requested: 'bg-amber-100 text-amber-800',
};

export default function ContentApprovalQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  function load() {
    setLoading(true);
    api
      .get('/custom-views/approval-queue')
      .then((res) => setQueue(res.data.queue || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function decide(postId, decision) {
    setSubmittingId(`${postId}-${decision}`);
    try {
      await api.post('/custom-views/approval-decision', {
        post_id: postId,
        decision,
        comment: comments[postId] || '',
      });
      setComments({ ...comments, [postId]: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading approval queue...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Content Approval Queue
          </h2>
          <p className="text-xs text-gray-500">Approve, reject, or request edits on pending posts.</p>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-gray-500">No posts awaiting review.</p>
      ) : (
        <ul className="space-y-3">
          {queue.map((p) => (
            <li key={p.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium text-gray-800">{p.platform}</span>
                    <span>·</span>
                    <span>#{p.id}</span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">{p.status}</span>
                    {p.scheduledAt && (
                      <>
                        <span>·</span>
                        <span>Scheduled: {new Date(p.scheduledAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{p.content}</p>
                </div>
                {p.lastDecision && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      DECISION_STYLE[p.lastDecision.decision] || 'bg-gray-100 text-gray-700'
                    }`}
                    title={p.lastDecision.comment || ''}
                  >
                    last: {p.lastDecision.decision}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Comment (optional)
                </label>
                <textarea
                  rows={2}
                  value={comments[p.id] || ''}
                  onChange={(e) => setComments({ ...comments, [p.id]: e.target.value })}
                  placeholder="Add a comment for the author..."
                  className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => decide(p.id, 'approved')}
                  disabled={submittingId === `${p.id}-approved`}
                  className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => decide(p.id, 'rejected')}
                  disabled={submittingId === `${p.id}-rejected`}
                  className="px-3 py-1.5 text-xs rounded-md bg-rose-600 text-white flex items-center gap-1 hover:bg-rose-700 disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
                <button
                  onClick={() => decide(p.id, 'edits_requested')}
                  disabled={submittingId === `${p.id}-edits_requested`}
                  className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-white flex items-center gap-1 hover:bg-amber-600 disabled:opacity-50"
                >
                  <MessageSquare className="w-3 h-3" /> Request Edits
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
