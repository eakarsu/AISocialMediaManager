import { useEffect, useState } from 'react';
import { Plus, Search, Sparkles, MessageSquareReply, Zap, Power } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const detailFields = [
  { key: 'name', label: 'Rule Name' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'triggerType', label: 'Trigger Type' },
  { key: 'response', label: 'Response', type: 'textarea' },
  { key: 'platform', label: 'Platform' },
  { key: 'isActive', label: 'Active' },
  { key: 'aiPowered', label: 'AI Powered' },
  { key: 'usageCount', label: 'Usage Count', type: 'number' },
];

const createFields = [
  { key: 'name', label: 'Rule Name', required: true },
  { key: 'trigger', label: 'Trigger Keywords', required: true },
  { key: 'triggerType', label: 'Trigger Type', type: 'select', options: ['keyword', 'sentiment', 'mention', 'dm'], defaultValue: 'keyword' },
  { key: 'response', label: 'Auto Response', type: 'textarea', required: true },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Multi-platform', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'] },
];

const triggerColors = { keyword: '#3B82F6', sentiment: '#8B5CF6', mention: '#10B981', dm: '#F59E0B' };

export default function AutoReplies() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/auto-replies').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/auto-replies/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/auto-replies/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/auto-replies', data); setCreating(false); load(); };

  const generateReply = async () => {
    if (!aiMessage) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-reply', { message: aiMessage, tone: 'friendly', context: 'customer inquiry on social media' });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to generate. Check API key.' }); }
    setAiLoading(false);
  };

  const filtered = items.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.trigger?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auto Replies</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} auto-reply rules</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Reply Generator</h3>
        <div className="flex gap-3">
          <input value={aiMessage} onChange={e => setAiMessage(e.target.value)} placeholder="Enter a message to generate a smart reply..." className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && generateReply()} />
          <button onClick={generateReply} disabled={aiLoading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Generate</button>
        </div>
        <AIOutput result={aiResult} loading={aiLoading} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search auto-replies..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} onClick={() => setSelected(r)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageSquareReply className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-white text-sm">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${triggerColors[r.triggerType] || '#6366f1'}20`, color: triggerColors[r.triggerType] || '#6366f1' }}>{r.triggerType}</span>
                    {r.aiPowered && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{r.usageCount} uses</span>
                <div className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-green-400' : 'bg-slate-500'}`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/50 rounded-xl p-3"><span className="text-slate-400">Trigger: </span><span className="text-slate-200">{r.trigger}</span></div>
              <div className="bg-slate-800/50 rounded-xl p-3 line-clamp-2"><span className="text-slate-400">Reply: </span><span className="text-slate-200">{r.response}</span></div>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Auto Reply Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="New Auto Reply Rule" />}
    </div>
  );
}
