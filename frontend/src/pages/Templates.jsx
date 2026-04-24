import { useEffect, useState } from 'react';
import { Plus, Search, Copy, BookTemplate } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';

const detailFields = [
  { key: 'name', label: 'Template Name' },
  { key: 'content', label: 'Content', type: 'textarea' },
  { key: 'category', label: 'Category' },
  { key: 'platform', label: 'Platform' },
  { key: 'usageCount', label: 'Usage Count', type: 'number' },
  { key: 'tags', label: 'Tags' },
];

const createFields = [
  { key: 'name', label: 'Template Name', required: true },
  { key: 'content', label: 'Content', type: 'textarea', required: true },
  { key: 'category', label: 'Category', type: 'select', options: ['Launch', 'Social Proof', 'Culture', 'Educational', 'Engagement', 'Holiday', 'Content', 'Celebration', 'News', 'Event', 'Sales', 'Inspiration'] },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Multi-platform'] },
];

export default function Templates() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/templates').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/templates/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/templates/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/templates', data); setCreating(false); load(); };

  const filtered = items.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase()));

  const categoryColors = { Launch: '#3B82F6', 'Social Proof': '#10B981', Culture: '#F59E0B', Educational: '#8B5CF6', Engagement: '#EC4899', Holiday: '#EF4444', Content: '#06B6D4', Celebration: '#F97316', News: '#6366F1', Event: '#14B8A6', Sales: '#EF4444', Inspiration: '#A855F7' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} content templates</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} onClick={() => setSelected(t)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: `${categoryColors[t.category] || '#6366f1'}20`, color: categoryColors[t.category] || '#6366f1' }}>{t.category}</span>
              <span className="text-xs text-slate-400">{t.platform}</span>
            </div>
            <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-purple-300">{t.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-3">{t.content}</p>
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
              <span className="text-xs text-slate-400">Used {t.usageCount} times</span>
              <div className="flex gap-1">{t.tags?.slice(0, 3).map(tag => <span key={tag} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">#{tag}</span>)}</div>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Template Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="New Template" />}
    </div>
  );
}
