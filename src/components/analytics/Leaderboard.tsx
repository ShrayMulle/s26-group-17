import { useState, useEffect } from 'react';
import { Trophy, Star, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  completed: number;
}

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-cyan-50/85 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-sm">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Leaderboard</h3>
          <p className="text-sm text-slate-500">Ranked by XP earned from completed tasks</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-400 py-8">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No data yet — complete some tasks to appear here!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                index === 0
                  ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50'
                  : index === 1
                  ? 'border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50'
                  : index === 2
                  ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'border-sky-100 bg-white'
              }`}
            >
              <span className="text-2xl w-8 text-center">
                {medals[index] ?? `#${index + 1}`}
              </span>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">{entry.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    {entry.completed} tasks done
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1.5">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                <span className="font-bold text-amber-700">{entry.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
