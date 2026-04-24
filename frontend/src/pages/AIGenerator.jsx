import { useState } from 'react';
import { Sparkles, FileText, Hash, Image, MessageSquare, CalendarDays, Mic2, FileBarChart } from 'lucide-react';
import api from '../api';
import AIOutput from '../components/AIOutput';

const tools = [
  { id: 'post', icon: FileText, label: 'Post Generator', desc: 'Generate social media posts', color: '#3B82F6', endpoint: '/ai/generate-post', fields: [{ key: 'topic', label: 'Topic', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'] }, { key: 'tone', label: 'Tone', type: 'select', options: ['professional', 'casual', 'humorous', 'inspirational', 'bold'] }, { key: 'length', label: 'Length', type: 'select', options: ['short', 'medium', 'long'] }] },
  { id: 'hashtag', icon: Hash, label: 'Hashtag Generator', desc: 'Find trending hashtags', color: '#EC4899', endpoint: '/ai/generate-hashtags', fields: [{ key: 'topic', label: 'Topic', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'TikTok', 'LinkedIn'] }, { key: 'count', label: 'Count', type: 'number', defaultValue: '10' }] },
  { id: 'caption', icon: Image, label: 'Caption Generator', desc: 'AI image captions', color: '#F59E0B', endpoint: '/ai/generate-caption', fields: [{ key: 'description', label: 'Image Description', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Facebook', 'Twitter', 'Pinterest'] }, { key: 'mood', label: 'Mood', type: 'select', options: ['inspiring', 'funny', 'informative', 'poetic', 'bold'] }] },
  { id: 'reply', icon: MessageSquare, label: 'Reply Generator', desc: 'Smart auto-replies', color: '#10B981', endpoint: '/ai/generate-reply', fields: [{ key: 'message', label: 'Message to Reply To', required: true }, { key: 'tone', label: 'Tone', type: 'select', options: ['friendly', 'professional', 'casual', 'empathetic'] }, { key: 'context', label: 'Context' }] },
  { id: 'calendar', icon: CalendarDays, label: 'Calendar Planner', desc: 'Content calendar ideas', color: '#8B5CF6', endpoint: '/ai/calendar-suggestions', fields: [{ key: 'industry', label: 'Industry', required: true }, { key: 'days', label: 'Days to Plan', type: 'number', defaultValue: '7' }] },
  { id: 'voice', icon: Mic2, label: 'Voice Analyzer', desc: 'Analyze brand voice', color: '#06B6D4', endpoint: '/ai/analyze-brand-voice', fields: [{ key: 'sampleText', label: 'Sample Text', type: 'textarea', required: true }, { key: 'brandName', label: 'Brand Name' }] },
  { id: 'competitor', icon: Sparkles, label: 'Competitor Analysis', desc: 'Analyze competitors', color: '#EF4444', endpoint: '/ai/analyze-competitor', fields: [{ key: 'competitorName', label: 'Competitor Name', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: ['all platforms', 'Twitter', 'Instagram', 'LinkedIn'] }, { key: 'industry', label: 'Industry' }] },
  { id: 'report', icon: FileBarChart, label: 'Report Summary', desc: 'AI report summaries', color: '#A855F7', endpoint: '/ai/report-summary', fields: [{ key: 'period', label: 'Period', type: 'select', options: ['weekly', 'monthly', 'quarterly'] }, { key: 'platform', label: 'Platform', type: 'select', options: ['all platforms', 'Instagram', 'Twitter', 'LinkedIn', 'Facebook'] }] },
];

export default function AIGenerator() {
  const [activeTool, setActiveTool] = useState(null);
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectTool = (tool) => {
    setActiveTool(tool);
    const init = {};
    tool.fields.forEach(f => { init[f.key] = f.defaultValue || ''; });
    setForm(init);
    setResult(null);
  };

  const generate = async () => {
    if (!activeTool) return;
    setLoading(true);
    try {
      const { data } = await api.post(activeTool.endpoint, form);
      setResult(data);
    } catch { setResult({ content: 'Failed to generate. Check your OpenRouter API key in .env file.' }); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Generator</h1>
        <p className="text-slate-400 text-sm mt-1">Powered by OpenRouter &middot; Claude AI</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => selectTool(tool)}
            className={`glass-card rounded-2xl p-5 text-left transition-all hover:scale-[1.02] ${activeTool?.id === tool.id ? 'border-purple-500/50 bg-purple-500/10' : 'hover:border-purple-500/30'}`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${tool.color}20` }}>
              <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
            </div>
            <h3 className="font-semibold text-white text-sm">{tool.label}</h3>
            <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      {activeTool && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <activeTool.icon className="w-5 h-5" style={{ color: activeTool.color }} />
            {activeTool.label}
          </h2>
          <div className="space-y-4">
            {activeTool.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.key] || ''}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={form[field.key] || ''}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <button onClick={generate} disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <AIOutput result={result} loading={loading} />
        </div>
      )}
    </div>
  );
}
