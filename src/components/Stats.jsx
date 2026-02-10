import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function Stats() {
  const { list } = useSelector((s) => s.tasks);

  const stats = useMemo(() => {
    const total = list.length;
    const completed = list.reduce((acc, t) => acc + (t.completed ? 1 : 0), 0);
    const active = total - completed;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, pct };
  }, [list]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-slate-300">Total</div>
        <div className="text-xl font-semibold">{stats.total}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-slate-300">Active</div>
        <div className="text-xl font-semibold">{stats.active}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-slate-300">Completed</div>
        <div className="text-xl font-semibold">{stats.completed}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-slate-300">Completion</div>
        <div className="text-xl font-semibold">{stats.pct}%</div>
      </div>
    </div>
  );
}

