import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, Users2, Megaphone, Hash, BookTemplate,
  BarChart3, Swords, Mic2, MessageSquareReply, UsersRound, FileBarChart,
  CalendarDays, Sparkles, LogOut, Menu, X, ChevronRight, Clock, TrendingUp
} from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/posts', icon: FileText, label: 'Posts' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/content-calendar', icon: CalendarDays, label: 'AI Content Calendar' },
  { to: '/scheduled-posts', icon: Clock, label: 'Scheduled Posts' },
  { to: '/performance-analytics', icon: TrendingUp, label: 'Performance Analytics' },
  { to: '/accounts', icon: Users2, label: 'Accounts' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/hashtags', icon: Hash, label: 'Hashtags' },
  { to: '/hashtag-fatigue', icon: Hash, label: 'Hashtag Fatigue' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/competitors', icon: Swords, label: 'Competitors' },
  { to: '/brand-voice', icon: Mic2, label: 'Brand Voice' },
  { to: '/auto-replies', icon: MessageSquareReply, label: 'Auto Replies' },
  { to: '/team', icon: UsersRound, label: 'Team' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/ai-generator', icon: Sparkles, label: 'AI Generator' },
  { to: '/ai-insights', icon: TrendingUp, label: 'AI Insights' },
  { to: '/custom-views', icon: TrendingUp, label: 'Social Analytics' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl gradient-border flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-sm whitespace-nowrap">AI Social Manager</h1>
              <p className="text-xs text-slate-400">Pro Dashboard</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-purple-300 border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.[0] || 'A'}
            </div>
            <span className="text-sm text-slate-300">{user.name || 'Admin'}</span>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
