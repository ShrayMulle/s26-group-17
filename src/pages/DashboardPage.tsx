import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/board/KanbanBoard';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import NavBar from '../components/ui/NavBar';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');
  const [userName, setUserName] = useState('...');
  const [totalXp, setTotalXp] = useState(0);
  const [boardStats, setBoardStats] = useState({ todo: 0, in_progress: 0, done: 0, totalTasks: 0 });
  const level = Math.floor(totalXp / 100) + 1;
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

  const handleTabChange = (tab: 'board' | 'analytics') => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div>
        <header>
            <NavBar activeTab={activeTab}
                    onTabChange={handleTabChange}
                    userName={userName}
                    totalXp={totalXp}
                    level={level}
                    onLogout={handleLogout} />
        </header>
        <main>
          {activeTab === 'board' && (
            <div>
              <KanbanBoard onXpChange={handleXpChange} />
            </div>
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard totalXp={totalXp} level={level} boardStats={boardStats} userName={userName} />
          )}
        </main>
      </div>
    </div>
  );
}
