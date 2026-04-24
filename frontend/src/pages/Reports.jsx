import { useEffect, useState } from 'react';
import { Plus, Search, FileBarChart, Sparkles, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import AIOutput from '../components/AIOutput';

const statusIcons = { generated: CheckCircle, pending: Clock, failed: AlertCircle };
const statusColors = { generated: 'text-green-400 bg-green-500/20', pending: 'text-yellow-400 bg-yellow-500/20', failed: 'text-red-400 bg-red-500/20' };
const typeColors = { weekly: '#3B82F6', monthly: '#8B5CF6', quarterly: '#F59E0B', custom: '#EC4899' };

const detailFields = [
  { key: 'name', label: 'Report Name' },
  { key: 'type', label: 'Report Type' },
  { key: 'platform', label: 'Platform' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'metrics', label: 'Metrics' },
];

const createFields = [
  { key: 'name', label: 'Report Name', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['weekly', 'monthly', 'quarterly', 'custom'], defaultValue: 'monthly' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Multi-platform', 'Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'] },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
];

export default function Reports() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => api.get('/reports').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/reports/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/reports/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/reports', data); setCreating(false); load(); };

  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/report-summary', { period: 'monthly', platform: 'all platforms' });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to generate. Check API key.' }); }
    setAiLoading(false);
  };

  const filtered = items.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} reports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateSummary} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-xl text-sm font-medium transition-all">
            <Sparkles className="w-4 h-4" /> AI Summary
          </button>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
            <Plus className="w-4 h-4" /> New Report
          </button>
        </div>
      </div>

      <AIOutput result={aiResult} loading={aiLoading} />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const StatusIcon = statusIcons[r.status] || Clock;
          return (
            <div key={r.id} onClick={() => setSelected(r)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileBarChart className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{r.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${typeColors[r.type] || '#6366f1'}20`, color: typeColors[r.type] || '#6366f1' }}>{r.type}</span>
                      <span className="text-xs text-slate-400">{r.platform}</span>
                    </div>
                  </div>
                </div>
                <span className={`p-1.5 rounded-lg ${statusColors[r.status]}`}><StatusIcon className="w-4 h-4" /></span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{r.startDate} — {r.endDate}</p>
              <p className="text-xs text-slate-300 line-clamp-2">{r.summary}</p>
              {r.metrics && typeof r.metrics === 'object' && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 flex flex-wrap gap-3">
                  {Object.entries(r.metrics).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="text-xs"><span className="text-slate-400">{k}: </span><span className="text-white font-medium">{typeof v === 'number' ? v.toLocaleString() : v}</span></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Report Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="New Report" />}
    </div>
  );
}
