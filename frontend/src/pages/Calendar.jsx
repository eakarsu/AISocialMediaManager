import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../api';
import AIOutput from '../components/AIOutput';

const platformColors = { Twitter: '#1DA1F2', Instagram: '#E4405F', LinkedIn: '#0A66C2', Facebook: '#1877F2', TikTok: '#000', YouTube: '#FF0000', Pinterest: '#BD081C', Reddit: '#FF4500' };
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.get(`/calendar?month=${month + 1}&year=${year}`).then(r => setPosts(r.data));
  }, [month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getPostsForDay = (day) => {
    return posts.filter(p => {
      const d = new Date(p.scheduledAt);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const generateSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/calendar-suggestions', { industry: 'technology', platforms: ['Instagram', 'Twitter', 'LinkedIn'], days: 7 });
      setAiResult(data);
    } catch { setAiResult({ content: 'Failed to generate. Check API key.' }); }
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule and visualize your content</p>
        </div>
        <button onClick={generateSuggestions} disabled={aiLoading} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
          <Sparkles className="w-4 h-4" /> AI Suggestions
        </button>
      </div>

      <AIOutput result={aiResult} loading={aiLoading} />

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 rounded-xl hover:bg-slate-700 text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-white">{months[month]} {year}</h2>
          <button onClick={next} className="p-2 rounded-xl hover:bg-slate-700 text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
          ))}
          {blanks.map(i => <div key={`b${i}`} className="p-2 min-h-[80px]" />)}
          {days.map(day => {
            const dayPosts = getPostsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={day} className={`p-2 min-h-[80px] rounded-xl border transition-colors ${isToday ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-700/30 hover:border-slate-600'}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-purple-400' : 'text-slate-400'}`}>{day}</span>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 2).map(p => (
                    <div key={p.id} className="text-xs px-1.5 py-0.5 rounded truncate" style={{ background: `${platformColors[p.platform] || '#6366f1'}20`, color: platformColors[p.platform] || '#6366f1' }}>
                      {p.platform}
                    </div>
                  ))}
                  {dayPosts.length > 2 && <span className="text-xs text-slate-500">+{dayPosts.length - 2} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
