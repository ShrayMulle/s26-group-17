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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-md bg-gray-900/90 p-2 text-white">
          <Trophy className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Team Leaderboard</h3>
          <p className="text-xs text-gray-500">Ranked by XP earned from completed tasks</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          No data yet - complete some tasks to appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <span className="w-8 text-center text-base">
                {medals[index] ?? `#${index + 1}`}
              </span>

              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                <div className="mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {entry.completed} tasks done
                  </span>
                </div>
              </div>

              <div className="ml-3 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-800">
                <Star className="h-3.5 w-3.5" />
                <span>{entry.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
