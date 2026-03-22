import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, GraduationCap, LayoutList, LogOut } from 'lucide-react';
import KanbanBoard from '../components/board/KanbanBoard';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');
  const [userName, setUserName] = useState('...');
  const [totalXp, setTotalXp] = useState(0);
  const [boardStats, setBoardStats] = useState({ todo: 0, in_progress: 0, done: 0, totalTasks: 0 });
  const level = Math.floor(totalXp / 100) + 1;
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    api.getMe().then((user: any) => setUserName(user.name)).catch(() => {
      supabase.auth.getSession().then(({ data }) => {
        const name = data.session?.user?.user_metadata?.full_name
          || data.session?.user?.email?.split('@')[0] || 'User';
        setUserName(name);
      });
    });
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleXpChange = (xp: number, stats?: { todo: number; in_progress: number; done: number; totalTasks: number }) => {
    setTotalXp(xp);
    if (stats) setBoardStats(stats);
  };

  return (
    <div className={`relative isolate min-h-screen overflow-hidden text-slate-900 transition-all duration-1000 ${totalXp === 0 ? "bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100" : totalXp < 50 ? "bg-gradient-to-br from-cyan-200 via-teal-100 to-emerald-200" : totalXp < 100 ? "bg-gradient-to-br from-violet-200 via-purple-100 to-pink-100" : "bg-gradient-to-br from-amber-200 via-orange-100 to-rose-100"}`}>
      <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-sky-400/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="relative z-10">
        <header className="border-b border-sky-300/40 bg-gradient-to-r from-sky-50/80 via-cyan-50/70 to-emerald-50/70 backdrop-blur">
          <div className="flex w-full items-center justify-between px-8 py-4 sm:px-10 lg:px-16 xl:px-24">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">StudyQuest</h1>
                <p className="text-sm text-slate-600">Course planning workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-sky-200/70 bg-sky-50/85 px-3 py-2 text-right shadow-sm">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Level {level} • {totalXp} XP</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout} className="inline-flex min-w-[6rem] items-center justify-center gap-2 px-0">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="border-b border-sky-300/40 bg-gradient-to-r from-sky-100/55 to-cyan-100/40">
          <div className="w-full px-8 sm:px-10 lg:px-16 xl:px-24">
            <div className="flex gap-3 py-3">
              <button onClick={() => setActiveTab('board')} className={`inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:min-w-[11rem] ${activeTab === 'board' ? 'border-sky-500/40 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm' : 'border-sky-200/70 bg-sky-50/80 text-sky-800 hover:border-sky-300 hover:bg-sky-100'}`}>
                <LayoutList className="h-4 w-4" />
                Study Board
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:min-w-[11rem] ${activeTab === 'analytics' ? 'border-sky-500/40 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm' : 'border-sky-200/70 bg-sky-50/80 text-sky-800 hover:border-sky-300 hover:bg-sky-100'}`}>
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>
        <main className="w-full px-8 py-6 sm:px-10 lg:px-16 xl:px-24">
          {activeTab === 'board' && (
            <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-cyan-50/85 to-emerald-50/85 p-4 shadow-[0_14px_34px_rgba(2,132,199,0.14)] backdrop-blur sm:p-6">
              <KanbanBoard onXpChange={handleXpChange} />
            </div>
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard totalXp={totalXp} level={level} boardStats={boardStats} userName={userName} />
          )}
        </main>
      </div>
      {/* Level up notification */}
      {showLevelUp && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-white text-lg">Level Up!</p>
              <p className="text-amber-100 text-sm">You reached Level {level}!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
