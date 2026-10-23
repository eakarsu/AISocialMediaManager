import { X, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CreateModal({ fields, onClose, onCreate, title }) {
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach(({ key, defaultValue }) => { init[key] = defaultValue || ''; });
    return init;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">{title || 'Create New'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map(({ key, label, type, options, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                  required={required}
                />
              ) : type === 'select' ? (
                <select
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={required}
                >
                  <option value="">Select...</option>
                  {options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={type || 'text'}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={required}
                />
              )}
            </div>
          ))}
          <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create
          </button>
        </form>
      </div>
    </div>
  );
}
