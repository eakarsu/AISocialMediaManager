import { useEffect, useState } from 'react';
import { Plus, Search, Shield, Eye, Pencil, Crown } from 'lucide-react';
import api from '../api';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';

const roleIcons = { admin: Crown, manager: Shield, editor: Pencil, viewer: Eye };
const roleColors = { admin: 'bg-purple-500/20 text-purple-400', manager: 'bg-blue-500/20 text-blue-400', editor: 'bg-green-500/20 text-green-400', viewer: 'bg-slate-500/20 text-slate-400' };
const statusColors = { active: 'bg-green-400', inactive: 'bg-red-400', pending: 'bg-yellow-400' };

const detailFields = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' },
  { key: 'lastActive', label: 'Last Active' },
  { key: 'permissions', label: 'Permissions' },
];

const createFields = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'role', label: 'Role', type: 'select', options: ['admin', 'manager', 'editor', 'viewer'], defaultValue: 'editor' },
  { key: 'department', label: 'Department', type: 'select', options: ['Marketing', 'Content', 'Social Media', 'Design', 'Video', 'Sales', 'Engineering', 'Analytics', 'Community', 'Executive', 'Product'] },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'pending'], defaultValue: 'pending' },
];

export default function Team() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/team').then(r => setItems(r.data));
  const handleDelete = async (id) => { await api.delete(`/team/${id}`); setSelected(null); load(); };
  const handleEdit = async (data) => { await api.put(`/team/${data.id}`, data); setSelected(null); load(); };
  const handleCreate = async (data) => { await api.post('/team', data); setCreating(false); load(); };

  const filtered = items.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.department?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} team members</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const RoleIcon = roleIcons[m.role] || Eye;
          return (
            <div key={m.id} onClick={() => setSelected(m)} className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {m.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm group-hover:text-purple-300">{m.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${statusColors[m.status]}`} />
                  </div>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${roleColors[m.role]}`}>
                  <RoleIcon className="w-3 h-3" /> {m.role}
                </span>
                <span className="text-xs text-slate-400">{m.department}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <DetailModal item={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={handleEdit} title="Team Member Details" />}
      {creating && <CreateModal fields={createFields} onClose={() => setCreating(false)} onCreate={handleCreate} title="Add Team Member" />}
    </div>
  );
}
