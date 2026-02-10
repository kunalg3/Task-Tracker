import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAdvancedFilters,
  setCategoryFilter,
  setFilter,
  setPriorityFilter,
  setSearch,
  setTagFilter,
} from "../features/tasks/taskSlice";

export default function Filters() {
  const dispatch = useDispatch();
  const { filter, search, list, categoryFilter, priorityFilter, tagFilter } =
    useSelector((s) => s.tasks);

  const counts = useMemo(() => {
    let completed = 0;
    for (const t of list) if (t.completed) completed += 1;
    return { total: list.length, completed, active: list.length - completed };
  }, [list]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const t of list) {
      const c = String(t.category || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  const tags = useMemo(() => {
    const set = new Set();
    for (const t of list) {
      for (const tag of Array.isArray(t.tags) ? t.tags : []) {
        const v = String(tag).trim();
        if (v) set.add(v);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => dispatch(setFilter("all"))}
          aria-pressed={filter === "all"}
          className={`rounded-lg px-3 py-2 text-sm ${
            filter === "all"
              ? "bg-indigo-500 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          All ({counts.total})
        </button>
        <button
          type="button"
          onClick={() => dispatch(setFilter("active"))}
          aria-pressed={filter === "active"}
          className={`rounded-lg px-3 py-2 text-sm ${
            filter === "active"
              ? "bg-indigo-500 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          Active ({counts.active})
        </button>
        <button
          type="button"
          onClick={() => dispatch(setFilter("completed"))}
          aria-pressed={filter === "completed"}
          className={`rounded-lg px-3 py-2 text-sm ${
            filter === "completed"
              ? "bg-indigo-500 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          Completed ({counts.completed})
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-300">Search</label>
          <input
            value={search}
            placeholder="Search title, category, tags…"
            onChange={(e) => dispatch(setSearch(e.target.value))}
            aria-label="Search tasks"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm placeholder:text-slate-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <label className="text-xs text-slate-300">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-3 sm:col-span-1">
            <label className="text-xs text-slate-300">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => dispatch(setPriorityFilter(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div className="col-span-3 sm:col-span-1">
            <label className="text-xs text-slate-300">Tag</label>
            <select
              value={tagFilter}
              onChange={(e) => dispatch(setTagFilter(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => dispatch(clearAdvancedFilters())}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10"
        >
          Clear advanced filters
        </button>
        <span className="text-slate-400">
          Pro tip: use tags to group tasks without overthinking categories.
        </span>
      </div>
    </div>
  );
}
