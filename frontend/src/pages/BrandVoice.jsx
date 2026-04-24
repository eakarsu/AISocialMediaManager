import { useEffect, useState } from 'react';
import { Plus, Search, Sparkles, Mic2, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const detailFields = [
  { key: 'name', label: 'Voice Name' },
  { key: 'tone', label: 'Tone' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'avoidWords', label: 'Avoid Words' },
  { key: 'examples', label: 'Examples', type: 'textarea' },
  { key: 'platform', label: 'Platform' },
  { key: 'isActive', label: 'Active' },
];

const createFields = [
  { key: 'name', label: 'Voice Name', required: true },
  { key: 'tone', label: 'Tone', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'examples', label: 'Example Text', type: 'textarea' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Multi-platform', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'] },
];

export default function BrandVoice() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sampleText, setSampleText] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/brand-voice').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/brand-voice/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/brand-voice/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/brand-voice', data); setCreating(false); load(); };

  const analyzeVoice = async () => {
    if (!sampleText) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/analyze-brand-voice', { sampleText, brandName: 'Our Brand' });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to analyze. Check API key.' }); }
    setAiLoading(false);
  };

  const toneColors = { Professional: '#3B82F6', Casual: '#10B981', Humorous: '#F59E0B', Inspirational: '#8B5CF6', Technical: '#06B6D4', Empathetic: '#EC4899', Bold: '#EF4444', Educational: '#6366F1', Community: '#14B8A6', Luxury: '#D4AF37', GenZ: '#FF6B6B', Analytical: '#0EA5E9', Narrative: '#F97316', Minimalist: '#94A3B8', Sustainable: '#22C55E' };

  const filtered = items.filter(v => v.name?.toLowerCase().includes(search.toLowerCase()) || v.tone?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Voice</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} voice profiles</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> New Voice
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Brand Voice Analyzer</h3>
        <textarea value={sampleText} onChange={e => setSampleText(e.target.value)} placeholder="Paste sample brand text to analyze its voice and tone..." className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] mb-3" />
        <button onClick={analyzeVoice} disabled={aiLoading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Analyze Voice</button>
        <AIOutput result={aiResult} loading={aiLoading} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search voices..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v) => (
          <div key={v.id} onClick={() => setSelected(v)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${toneColors[v.tone] || '#6366f1'}20` }}>
                  <Mic2 className="w-5 h-5" style={{ color: toneColors[v.tone] || '#6366f1' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-purple-300">{v.name}</h3>
                  <p className="text-xs text-slate-400">{v.tone} &middot; {v.platform}</p>
                </div>
              </div>
              {v.isActive ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-slate-500" />}
            </div>
            <p className="text-xs text-slate-400 mb-3">{v.description}</p>
            <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-300 italic line-clamp-2">"{v.examples}"</div>
            <div className="mt-3 flex flex-wrap gap-1">
              {v.keywords?.slice(0, 4).map(k => <span key={k} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">{k}</span>)}
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Brand Voice Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="New Brand Voice" />}
    </div>
  );
}
