import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, GraduationCap, LayoutList, LogOut } from 'lucide-react';
import KanbanBoard from '../components/board/KanbanBoard';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');

  const handleLogout = () => {
    supabase.auth.signOut()
    navigate('/login');
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100 text-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-sky-400/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative z-10">
        <header className="border-b border-sky-300/40 bg-gradient-to-r from-sky-50/80 via-cyan-50/70 to-emerald-50/70 backdrop-blur">
          <div className="flex w-full items-center justify-between px-8 py-4 sm:px-10 lg:px-16 xl:px-24">
            <div className="flex items-center gap-3 pr-2 sm:pr-4 lg:pr-6">
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
                <p className="text-sm font-medium text-slate-900">Demo User</p>
                <p className="text-xs text-slate-500">Level 1 • 0 XP</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="inline-flex min-w-[6rem] items-center justify-center gap-2 px-0"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="border-b border-sky-300/40 bg-gradient-to-r from-sky-100/55 to-cyan-100/40">
          <div className="w-full px-8 sm:px-10 lg:px-16 xl:px-24">
            <div className="flex gap-3 py-3">
              <button
                onClick={() => setActiveTab('board')}
                className={`inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:min-w-[11rem] ${
                  activeTab === 'board'
                    ? 'border-sky-500/40 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
                    : 'border-sky-200/70 bg-sky-50/80 text-sky-800 hover:border-sky-300 hover:bg-sky-100'
                }`}
              >
                <LayoutList className="h-4 w-4" />
                Study Board
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:min-w-[11rem] ${
                  activeTab === 'analytics'
                    ? 'border-sky-500/40 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
                    : 'border-sky-200/70 bg-sky-50/80 text-sky-800 hover:border-sky-300 hover:bg-sky-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        <main className="w-full px-8 py-6 sm:px-10 lg:px-16 xl:px-24">
          {activeTab === 'board' ? (
            <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-cyan-50/85 to-emerald-50/85 p-4 shadow-[0_14px_34px_rgba(2,132,199,0.14)] backdrop-blur sm:p-6">
              <KanbanBoard />
            </div>
          ) : (
            <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/95 to-cyan-50/85 p-8 shadow-[0_14px_34px_rgba(2,132,199,0.14)]">
              <h2 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Performance trends and milestone tracking will appear here.
              </p>
              <div className="mt-8 rounded-lg border border-dashed border-sky-200 bg-sky-50/70 p-10 text-center">
                <p className="text-lg font-medium text-sky-800">Analytics modules are coming soon</p>
                <p className="mt-2 text-sm text-sky-700/80">
                  You&apos;ll be able to review completion rate, study streaks, and XP progression.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}