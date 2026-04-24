import { useEffect, useState } from 'react';
import { Plus, Heart, MessageCircle, Share2, Eye, Search, Sparkles } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const statusColors = { published: 'bg-green-500/20 text-green-400', scheduled: 'bg-yellow-500/20 text-yellow-400', draft: 'bg-slate-500/20 text-slate-400', failed: 'bg-red-500/20 text-red-400' };
const platformColors = { Twitter: '#1DA1F2', Instagram: '#E4405F', LinkedIn: '#0A66C2', Facebook: '#1877F2', TikTok: '#000', YouTube: '#FF0000', Pinterest: '#BD081C', Reddit: '#FF4500', Threads: '#000', Snapchat: '#FFFC00', Mastodon: '#6364FF' };

const detailFields = [
  { key: 'content', label: 'Content', type: 'textarea' },
  { key: 'platform', label: 'Platform' },
  { key: 'status', label: 'Status' },
  { key: 'scheduledAt', label: 'Scheduled At' },
  { key: 'likes', label: 'Likes', type: 'number' },
  { key: 'comments', label: 'Comments', type: 'number' },
  { key: 'shares', label: 'Shares', type: 'number' },
  { key: 'impressions', label: 'Impressions', type: 'number' },
];

const createFields = [
  { key: 'content', label: 'Content', type: 'textarea', required: true },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Pinterest', 'Reddit'], required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'published'], defaultValue: 'draft' },
  { key: 'scheduledAt', label: 'Schedule Date', type: 'datetime-local' },
];

export default function Posts() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/posts').then(r => setItems(r.data));

  const handleDelete = async (id) => {
    await api.delete(`/posts/${id}`);
    setSelected(null);
    load();
  };
  const handleEdit = async (data) => {
    await api.put(`/posts/${data.id}`, data);
    setSelected(null);
    load();
  };
  const handleCreate = async (data) => {
    await api.post('/posts', data);
    setCreating(false);
    load();
  };
  const generateAI = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-post', { topic: aiTopic, platform: 'Twitter', tone: 'professional' });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to generate. Check API key.' }); }
    setAiLoading(false);
  };

  const filtered = items.filter(p => p.content?.toLowerCase().includes(search.toLowerCase()) || p.platform?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} total posts</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* AI Generate */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Post Generator</h3>
        <div className="flex gap-3">
          <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Enter a topic to generate a post..." className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && generateAI()} />
          <button onClick={generateAI} disabled={aiLoading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Generate</button>
        </div>
        <AIOutput result={aiResult} loading={aiLoading} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="space-y-3">
        {filtered.map((post) => (
          <div key={post.id} onClick={() => setSelected(post)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: `${platformColors[post.platform] || '#6366f1'}20`, color: platformColors[post.platform] || '#6366f1' }}>{post.platform}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>{post.status}</span>
                  {post.aiGenerated && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">AI</span>}
                </div>
                <p className="text-sm text-slate-200 line-clamp-2">{post.content}</p>
                {post.scheduledAt && <p className="text-xs text-slate-500 mt-2">Scheduled: {new Date(post.scheduledAt).toLocaleString()}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {post.shares}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.impressions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Post Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="Create Post" />}
    </div>
  );
}
