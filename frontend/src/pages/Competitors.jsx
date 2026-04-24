import { useEffect, useState } from 'react';
import { Plus, Search, Sparkles, Users, TrendingUp, Swords } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const detailFields = [
  { key: 'name', label: 'Company Name' },
  { key: 'platform', label: 'Platform' },
  { key: 'username', label: 'Username' },
  { key: 'followers', label: 'Followers', type: 'number' },
  { key: 'engagementRate', label: 'Engagement Rate', type: 'number' },
  { key: 'postFrequency', label: 'Post Frequency' },
  { key: 'topContent', label: 'Top Content', type: 'textarea' },
  { key: 'strengths', label: 'Strengths', type: 'textarea' },
  { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
];

const createFields = [
  { key: 'name', label: 'Company Name', required: true },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Multi-platform', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Pinterest'], required: true },
  { key: 'username', label: 'Username' },
  { key: 'followers', label: 'Followers', type: 'number', defaultValue: '0' },
  { key: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', defaultValue: '0' },
  { key: 'postFrequency', label: 'Post Frequency' },
  { key: 'strengths', label: 'Strengths', type: 'textarea' },
  { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
];

export default function Competitors() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiName, setAiName] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/competitors').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/competitors/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/competitors/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/competitors', data); setCreating(false); load(); };

  const analyzeAI = async () => {
    if (!aiName) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/analyze-competitor', { competitorName: aiName, platform: 'all platforms', industry: 'social media management' });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to analyze. Check API key.' }); }
    setAiLoading(false);
  };

  const filtered = items.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitors</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} competitors tracked</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> Add Competitor
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Competitor Analysis</h3>
        <div className="flex gap-3">
          <input value={aiName} onChange={e => setAiName(e.target.value)} placeholder="Enter competitor name to analyze..." className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && analyzeAI()} />
          <button onClick={analyzeAI} disabled={aiLoading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Analyze</button>
        </div>
        <AIOutput result={aiResult} loading={aiLoading} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search competitors..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} onClick={() => setSelected(c)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400">{c.username} &middot; {c.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-xs text-slate-400">Followers</p><p className="text-sm font-semibold text-white">{c.followers?.toLocaleString()}</p></div>
                <div className="text-right"><p className="text-xs text-slate-400">Engagement</p><p className="text-sm font-semibold text-green-400">{c.engagementRate}%</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-700/30">
              <div><p className="text-xs text-slate-400 mb-1">Strengths</p><p className="text-xs text-slate-300 line-clamp-1">{c.strengths}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Weaknesses</p><p className="text-xs text-slate-300 line-clamp-1">{c.weaknesses}</p></div>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Competitor Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="Add Competitor" />}
    </div>
  );
}
