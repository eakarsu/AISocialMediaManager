import { useEffect, useState } from 'react';
import { Plus, Search, Target, DollarSign, TrendingUp } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';

const statusColors = { active: 'bg-green-500/20 text-green-400', paused: 'bg-yellow-500/20 text-yellow-400', completed: 'bg-blue-500/20 text-blue-400', draft: 'bg-slate-500/20 text-slate-400' };

const detailFields = [
  { key: 'name', label: 'Campaign Name' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'status', label: 'Status' },
  { key: 'platform', label: 'Platform' },
  { key: 'goal', label: 'Goal' },
  { key: 'budget', label: 'Budget', type: 'number' },
  { key: 'spent', label: 'Spent', type: 'number' },
  { key: 'reach', label: 'Reach', type: 'number' },
  { key: 'conversions', label: 'Conversions', type: 'number' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
];

const createFields = [
  { key: 'name', label: 'Campaign Name', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Multi-platform', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'], required: true },
  { key: 'goal', label: 'Goal', type: 'select', options: ['Brand Awareness', 'Engagement', 'Lead Generation', 'Sales', 'Traffic', 'Conversions', 'Community'] },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'paused'], defaultValue: 'draft' },
  { key: 'budget', label: 'Budget ($)', type: 'number', defaultValue: '0' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
];

export default function Campaigns() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/campaigns').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/campaigns/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/campaigns/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/campaigns', data); setCreating(false); load(); };

  const filtered = items.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} campaigns</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} onClick={() => setSelected(c)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span>
              </div>
              <span className="text-xs text-slate-400">{c.platform}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 line-clamp-1">{c.description}</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-400" /><div><p className="text-xs text-slate-400">Budget</p><p className="text-sm font-semibold text-white">${Number(c.budget).toLocaleString()}</p></div></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-orange-400" /><div><p className="text-xs text-slate-400">Spent</p><p className="text-sm font-semibold text-white">${Number(c.spent).toLocaleString()}</p></div></div>
              <div className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /><div><p className="text-xs text-slate-400">Reach</p><p className="text-sm font-semibold text-white">{c.reach?.toLocaleString()}</p></div></div>
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400" /><div><p className="text-xs text-slate-400">Conversions</p><p className="text-sm font-semibold text-white">{c.conversions?.toLocaleString()}</p></div></div>
            </div>
            {c.budget > 0 && (
              <div className="mt-3">
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min((c.spent / c.budget) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{((c.spent / c.budget) * 100).toFixed(0)}% spent</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Campaign Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="New Campaign" />}
    </div>
  );
}
