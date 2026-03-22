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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-cyan-50/85 p-6 shadow-[0_14px_34px_rgba(2,132,199,0.14)]">
        <h2 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your study progress for {userName}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-xs font-semibold uppercase tracking-wide">Total XP</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-700">{totalXp}</p>
          <p className="text-xs text-amber-600">{xpToNextLevel} XP to level {level + 1}</p>
        </div>

        <div className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sky-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Level</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-sky-700">{level}</p>
          <p className="text-xs text-sky-600">Current level</p>
        </div>

        <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Completed</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{boardStats.done}</p>
          <p className="text-xs text-emerald-600">{completionRate}% completion rate</p>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <ListTodo className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Total Tasks</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-700">{boardStats.totalTasks}</p>
          <p className="text-xs text-slate-500">{boardStats.in_progress} in progress</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-cyan-50/85 p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Tasks by Column</h3>
          {boardStats.totalTasks === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No tasks yet — add some to see stats!</div>
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
        <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-cyan-50/85 p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Completion Breakdown</h3>
          {boardStats.totalTasks === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No tasks yet — add some to see stats!</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
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
      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-yellow-50/85 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">XP Progress to Level {level + 1}</h3>
          <span className="text-sm font-medium text-amber-700">{totalXp % 100}/100 XP</span>
        </div>
        <div className="h-4 w-full rounded-full bg-amber-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
            style={{ width: `${totalXp % 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-amber-600">Complete tasks and move them to Done to earn XP!</p>
      </div>
      <Leaderboard />
    </div>
  );
}
