import { useEffect, useState } from 'react';
import { Plus, Search, TrendingUp, Sparkles, Hash } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const detailFields = [
  { key: 'tag', label: 'Hashtag' },
  { key: 'category', label: 'Category' },
  { key: 'platform', label: 'Platform' },
  { key: 'popularity', label: 'Popularity', type: 'number' },
  { key: 'posts', label: 'Posts', type: 'number' },
  { key: 'engagement', label: 'Engagement Rate', type: 'number' },
  { key: 'trending', label: 'Trending' },
];

const createFields = [
  { key: 'tag', label: 'Hashtag', required: true },
  { key: 'category', label: 'Category', type: 'select', options: ['Marketing', 'Content', 'AI', 'Strategy', 'Tips', 'Growth', 'Video', 'Branding', 'Ecommerce', 'Career'] },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube'] },
  { key: 'popularity', label: 'Popularity', type: 'number', defaultValue: '0' },
];

export default function Hashtags() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/hashtags').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/hashtags/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/hashtags/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/hashtags', data); setCreating(false); load(); };

  const generateAI = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-hashtags', { topic: aiTopic, platform: 'Instagram', count: 15 });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to generate. Check API key.' }); }
    setAiLoading(false);
  };

  const filtered = items.filter(h => h.tag?.toLowerCase().includes(search.toLowerCase()) || h.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hashtags</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} hashtags tracked</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> Add Hashtag
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Hashtag Generator</h3>
        <div className="flex gap-3">
          <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Enter a topic to generate hashtags..." className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && generateAI()} />
          <button onClick={generateAI} disabled={aiLoading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Generate</button>
        </div>
        <AIOutput result={aiResult} loading={aiLoading} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hashtags..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((h) => (
          <div key={h.id} onClick={() => setSelected(h)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm group-hover:text-purple-300">{h.tag}</h3>
              </div>
              {h.trending && <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3" /> Trending</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-xs text-slate-400">Popularity</p><p className="text-sm font-semibold text-white">{(h.popularity / 1000000).toFixed(1)}M</p></div>
              <div><p className="text-xs text-slate-400">Posts</p><p className="text-sm font-semibold text-white">{(h.posts / 1000).toFixed(0)}K</p></div>
              <div><p className="text-xs text-slate-400">Engagement</p><p className="text-sm font-semibold text-white">{h.engagement}%</p></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{h.category}</span><span>{h.platform}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Hashtag Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="Add Hashtag" />}
    </div>
  );
}
