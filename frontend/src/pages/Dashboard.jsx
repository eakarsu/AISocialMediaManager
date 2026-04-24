import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Users2, Megaphone, TrendingUp, Eye, Heart, MessageCircle, Share2, Hash, BookTemplate, Swords, Mic2, MessageSquareReply, UsersRound, FileBarChart, CalendarDays, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const cards = [
  { to: '/posts', icon: FileText, label: 'Posts', color: 'from-blue-500 to-cyan-500', key: 'totalPosts' },
  { to: '/accounts', icon: Users2, label: 'Accounts', color: 'from-green-500 to-emerald-500', key: 'totalAccounts' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns', color: 'from-orange-500 to-amber-500', key: 'activeCampaigns' },
  { to: '/analytics', icon: BarChart3, label: 'Engagement', color: 'from-purple-500 to-pink-500', key: 'engagementRate', suffix: '%' },
];

const features = [
  { to: '/posts', icon: FileText, label: 'Post Manager', desc: 'Create & schedule posts', color: '#3B82F6' },
  { to: '/calendar', icon: CalendarDays, label: 'Content Calendar', desc: 'Visual scheduling', color: '#10B981' },
  { to: '/accounts', icon: Users2, label: 'Social Accounts', desc: 'Manage connections', color: '#6366F1' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns', desc: 'Marketing campaigns', color: '#F59E0B' },
  { to: '/hashtags', icon: Hash, label: 'Hashtags', desc: 'Discover & manage tags', color: '#EC4899' },
  { to: '/templates', icon: BookTemplate, label: 'Templates', desc: 'Content templates', color: '#8B5CF6' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Performance metrics', color: '#14B8A6' },
  { to: '/competitors', icon: Swords, label: 'Competitors', desc: 'Track competition', color: '#EF4444' },
  { to: '/brand-voice', icon: Mic2, label: 'Brand Voice', desc: 'Tone & style settings', color: '#F97316' },
  { to: '/auto-replies', icon: MessageSquareReply, label: 'Auto Replies', desc: 'Automated responses', color: '#06B6D4' },
  { to: '/team', icon: UsersRound, label: 'Team', desc: 'Collaboration', color: '#84CC16' },
  { to: '/reports', icon: FileBarChart, label: 'Reports', desc: 'Performance reports', color: '#A855F7' },
  { to: '/ai-generator', icon: Sparkles, label: 'AI Generator', desc: 'AI-powered content', color: '#6366F1' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/dashboard/recent-posts').then(r => setRecentPosts(r.data)).catch(() => {});
  }, []);

  const chartData = Array.from({ length: 14 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    impressions: Math.floor(Math.random() * 5000) + 8000,
    engagement: Math.floor(Math.random() * 500) + 200,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's your social media overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ to, icon: Icon, label, color, key, suffix }) => (
          <div key={to} onClick={() => navigate(to)} className="glass-card rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stats[key] ?? '—'}{suffix}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Engagement Overview</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="impressions" stroke="#6366f1" fillOpacity={1} fill="url(#colorImp)" />
            <Area type="monotone" dataKey="engagement" stroke="#a855f7" fillOpacity={1} fill="url(#colorEng)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map(({ to, icon: Icon, label, desc, color }) => (
            <div
              key={to}
              onClick={() => navigate(to)}
              className="glass-card rounded-2xl p-5 cursor-pointer hover:scale-[1.02] hover:border-purple-500/30 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">{label}</h3>
              <p className="text-xs text-slate-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Posts</h2>
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div key={post.id} onClick={() => navigate('/posts')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div className={`w-2 h-2 rounded-full ${post.status === 'published' ? 'bg-green-400' : post.status === 'scheduled' ? 'bg-yellow-400' : 'bg-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{post.content}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400">{post.platform}</span>
                  <span className="text-xs text-slate-500">{post.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {post.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
