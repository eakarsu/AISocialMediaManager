import { X, Pencil, Trash2, Save, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function DetailModal({ item, fields, onClose, onDelete, onEdit, title }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });

  const handleSave = () => {
    onEdit(form);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">{title || 'Details'}</h2>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditing(false); setForm({ ...item }); }} className="p-2 rounded-lg hover:bg-slate-500/20 text-slate-400 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
              {editing ? (
                type === 'textarea' ? (
                  <textarea
                    value={form[key] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                  />
                ) : type === 'select' ? null : (
                  <input
                    type={type || 'text'}
                    value={form[key] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )
              ) : (
                <div className="px-4 py-2.5 bg-slate-800/50 rounded-xl text-slate-200 text-sm whitespace-pre-wrap">
                  {typeof item[key] === 'object' ? JSON.stringify(item[key], null, 2) : (item[key] ?? '—')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
