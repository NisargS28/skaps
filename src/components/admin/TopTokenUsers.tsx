import { Zap } from 'lucide-react';

const topUsers = [
  { name: 'Alice Smith', department: 'HR', tokens: 222700 },
  { name: 'Bob Jones', department: 'Finance', tokens: 160700 },
  { name: 'Charlie Brown', department: 'IT', tokens: 121900 },
  { name: 'Diana Prince', department: 'Exim', tokens: 82000 },
  { name: 'Eve Wilson', department: 'HR', tokens: 68200 },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export default function TopTokenUsers() {
  const max = topUsers[0]?.tokens || 1;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Token Users</h3>
        <Zap className="w-4 h-4 text-amber-500" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {topUsers.map((u, i) => (
          <div key={i} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.department}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(u.tokens)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${(u.tokens / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
