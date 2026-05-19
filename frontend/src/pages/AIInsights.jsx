import { useState } from 'react';
import { Sparkles, Clock, Layers, Activity, Eye, UserSearch } from 'lucide-react';
import api from '../api';
import AIOutput from '../components/AIOutput';

const tools = [
  {
    id: 'posting-time',
    icon: Clock,
    label: 'Posting Time Optimizer',
    desc: 'Best/worst posting windows by engagement',
    color: '#3B82F6',
    endpoint: '/ai/posting-time-optimizer',
    fields: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'audienceTimezone', label: 'Audience Timezone', defaultValue: 'EST' },
      { key: 'contentType', label: 'Content Type', defaultValue: 'general' },
    ],
  },
  {
    id: 'content-mix',
    icon: Layers,
    label: 'Content Mix Recommender',
    desc: 'Optimal mix of educational, promo, etc.',
    color: '#8B5CF6',
    endpoint: '/ai/content-mix-recommender',
    fields: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'businessGoals', label: 'Business Goals' },
      { key: 'brandFocus', label: 'Brand Focus' },
    ],
  },
  {
    id: 'sentiment',
    icon: Activity,
    label: 'Audience Sentiment Analysis',
    desc: 'Overall perception across recent activity',
    color: '#10B981',
    endpoint: '/ai/audience-sentiment-analysis',
    fields: [
      { key: 'brand', label: 'Brand Name' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['all platforms', 'Instagram', 'Twitter', 'LinkedIn', 'Facebook'] },
    ],
  },
  {
    id: 'competitor-swipe',
    icon: Eye,
    label: 'Competitor Content Swipe',
    desc: 'Swipe-worthy ideas inspired by tracked competitors',
    color: '#F97316',
    endpoint: '/ai/competitor-content-swipe',
    fields: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'count', label: 'Idea count', type: 'number', defaultValue: '5' },
    ],
  },
  {
    id: 'influencer-finder',
    icon: UserSearch,
    label: 'Influencer Finder',
    desc: 'Surface influencer archetypes for outreach',
    color: '#EC4899',
    endpoint: '/ai/influencer-finder',
    fields: [
      { key: 'niche', label: 'Niche' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok'] },
      { key: 'audienceSize', label: 'Audience size (e.g. micro 10k-100k)' },
      { key: 'region', label: 'Region', defaultValue: 'global' },
      { key: 'budgetUsd', label: 'Budget (USD)', type: 'number' },
    ],
  },
];

export default function AIInsights() {
  const [activeTool, setActiveTool] = useState(null);
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectTool = (tool) => {
    setActiveTool(tool);
    const init = {};
    tool.fields.forEach((f) => { init[f.key] = f.defaultValue || ''; });
    setForm(init);
    setResult(null);
  };

  const generate = async () => {
    if (!activeTool) return;
    setLoading(true);
    try {
      const payload = {};
      activeTool.fields.forEach((f) => {
        const v = form[f.key];
        if (v === undefined || v === '') return;
        payload[f.key] = f.type === 'number' ? Number(v) : v;
      });
      const { data } = await api.post(activeTool.endpoint, payload);
      setResult({ content: JSON.stringify(data, null, 2) });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Failed to generate.';
      setResult({ content: status === 503 ? `[503] ${msg}` : msg });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Insights</h1>
        <p className="text-slate-400 text-sm mt-1">Posting times, content mix, audience sentiment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {field.type === 'select' ? (
                  <select
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            ))}
            <button onClick={generate} disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Generate Insight'}
            </button>
          </div>
          <AIOutput result={result} loading={loading} />
        </div>
      )}
    </div>
  );
}
