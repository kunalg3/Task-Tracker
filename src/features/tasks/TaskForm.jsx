import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTask } from "./taskSlice";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const dispatch = useDispatch();

  const submit = (e) => {
    e?.preventDefault?.();
    if (!title.trim()) return;
    dispatch(addTask({ title, priority, category, tags }));
    setTitle("");
    setCategory("");
    setTags("");
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-slate-300">Task</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm placeholder:text-slate-500"
            placeholder="e.g. Finish Redux assignment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="sm:w-44">
          <label className="text-xs text-slate-300">Priority</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          Add task
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-300">Category</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm placeholder:text-slate-500"
            placeholder="e.g. Work, Personal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-300">Tags</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm placeholder:text-slate-500"
            placeholder="comma separated e.g. react, redux, ui"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Tip: drag tasks to reorder (or use ↑/↓ buttons).
      </div>
    </form>
  );
}
