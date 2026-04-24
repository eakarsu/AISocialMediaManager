import { useEffect, useState } from 'react';
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';

const statusIcons = { connected: UserCheck, disconnected: UserX, expired: UserX };
const statusColors = { connected: 'text-green-400 bg-green-500/20', disconnected: 'text-red-400 bg-red-500/20', expired: 'text-yellow-400 bg-yellow-500/20' };

const detailFields = [
  { key: 'platform', label: 'Platform' },
  { key: 'username', label: 'Username' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'followers', label: 'Followers', type: 'number' },
  { key: 'following', label: 'Following', type: 'number' },
  { key: 'status', label: 'Status' },
  { key: 'profileUrl', label: 'Profile URL' },
];

const createFields = [
  { key: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Pinterest', 'Reddit', 'Threads', 'Snapchat', 'Mastodon'], required: true },
  { key: 'username', label: 'Username', required: true },
  { key: 'displayName', label: 'Display Name', required: true },
  { key: 'followers', label: 'Followers', type: 'number', defaultValue: '0' },
  { key: 'following', label: 'Following', type: 'number', defaultValue: '0' },
  { key: 'status', label: 'Status', type: 'select', options: ['connected', 'disconnected', 'expired'], defaultValue: 'connected' },
];

export default function Accounts() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/accounts').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/accounts/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/accounts/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/accounts', data); setCreating(false); load(); };

  const filtered = items.filter(a => a.platform?.toLowerCase().includes(search.toLowerCase()) || a.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} connected accounts</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((account) => {
          const StatusIcon = statusIcons[account.status] || Users;
          return (
            <div key={account.id} onClick={() => setSelected(account)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: account.avatarColor || '#6366f1' }}>
                  {account.platform?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">{account.displayName}</h3>
                  <p className="text-xs text-slate-400">{account.username}</p>
                </div>
                <span className={`p-1.5 rounded-lg ${statusColors[account.status]}`}>
                  <StatusIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700/30">
                <div><p className="text-xs text-slate-400">Followers</p><p className="text-sm font-semibold text-white">{account.followers?.toLocaleString()}</p></div>
                <div><p className="text-xs text-slate-400">Following</p><p className="text-sm font-semibold text-white">{account.following?.toLocaleString()}</p></div>
                <div><p className="text-xs text-slate-400">Platform</p><p className="text-sm font-semibold text-white">{account.platform}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Account Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="Add Account" />}
    </div>
  );
}
