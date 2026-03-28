import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Star, CheckCircle, ListTodo, TrendingUp } from 'lucide-react';
import Leaderboard from './Leaderboard';

interface Props {
  totalXp: number;
  level: number;
  boardStats: { todo: number; in_progress: number; done: number; totalTasks: number };
  userName: string;
}

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981'];

export default function AnalyticsDashboard({ totalXp, level, boardStats, userName }: Props) {
  const completionRate = boardStats.totalTasks === 0 ? 0 : Math.round((boardStats.done / boardStats.totalTasks) * 100);
  const xpToNextLevel = 100 - (totalXp % 100);

  const pieData = [
    { name: 'To Do', value: boardStats.todo || 0 },
    { name: 'In Progress', value: boardStats.in_progress || 0 },
    { name: 'Done', value: boardStats.done || 0 },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'To Do', tasks: boardStats.todo || 0, fill: '#0ea5e9' },
    { name: 'In Progress', tasks: boardStats.in_progress || 0, fill: '#f59e0b' },
    { name: 'Done', tasks: boardStats.done || 0, fill: '#10b981' },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-100 p-4 shadow-sm">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600">Your study progress for {userName}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-600">
            <Star className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total XP</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{totalXp}</p>
          <p className="text-xs text-gray-500">{xpToNextLevel} XP to level {level + 1}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Level</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{level}</p>
          <p className="text-xs text-gray-500">Current level</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Completed</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{boardStats.done}</p>
          <p className="text-xs text-gray-500">{completionRate}% completion rate</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-600">
            <ListTodo className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Tasks</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{boardStats.totalTasks}</p>
          <p className="text-xs text-gray-500">{boardStats.in_progress} in progress</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Tasks by Column</h3>
          {boardStats.totalTasks === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
              No tasks yet - add some to see stats.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Completion Breakdown</h3>
          {boardStats.totalTasks === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
              No tasks yet - add some to see stats.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">XP Progress to Level {level + 1}</h3>
          <span className="text-sm font-medium text-gray-700">{totalXp % 100}/100 XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-900 transition-all"
            style={{ width: `${totalXp % 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Complete tasks and move them to Done to earn XP.</p>
      </div>
      <Leaderboard />
    </div>
  );
}
