import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTask, toggleTask, updateTask } from "./taskSlice";
import { useToast } from "../../components/ToastProvider";

function priorityStyles(priority) {
  if (priority === "high") return "border-l-rose-500";
  if (priority === "low") return "border-l-emerald-500";
  return "border-l-amber-400";
}

const PRIORITY_BADGE_STYLES = {
  low: {
    label: "Low",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
  },
  medium: {
    label: "Medium",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-200",
  },
  high: {
    label: "High",
    className: "border-rose-500/30 bg-rose-500/15 text-rose-200",
  },
};

function PriorityBadge({ priority }) {
  const key = priority in PRIORITY_BADGE_STYLES ? priority : "medium";
  const cfg = PRIORITY_BADGE_STYLES[key];

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
      aria-label={`Priority: ${cfg.label}`}
      title={`Priority: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}

export default function TaskItem({
  task,
  index,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  draggableProps,
  isDragging,
}) {
  const dispatch = useDispatch();
  const { className: dragClassName, ...dragProps } = draggableProps || {};
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftPriority, setDraftPriority] = useState(task.priority || "medium");
  const [draftCategory, setDraftCategory] = useState(task.category || "");
  const [draftTags, setDraftTags] = useState(
    Array.isArray(task.tags) ? task.tags.join(", ") : "",
  );

  const meta = useMemo(() => {
    const parts = [];
    if (task.category) parts.push(task.category);
    if (Array.isArray(task.tags) && task.tags.length)
      parts.push(task.tags.join(", "));
    return parts.join(" • ");
  }, [task.category, task.tags]);

  const save = () => {
    dispatch(
      updateTask({
        id: task.id,
        changes: {
          title: draftTitle,
          priority: draftPriority,
          category: draftCategory,
          tags: draftTags,
        },
      }),
    );
    setEditing(false);
  };

  const cancel = () => {
    setDraftTitle(task.title);
    setDraftPriority(task.priority || "medium");
    setDraftCategory(task.category || "");
    setDraftTags(Array.isArray(task.tags) ? task.tags.join(", ") : "");
    setEditing(false);
  };

  return (
    <div
      className={`group select-none rounded-xl border border-white/10 bg-white/5 p-3 border-l-4 transition ${priorityStyles(
        task.priority,
      )} ${isDragging ? "cursor-grabbing opacity-60" : "cursor-grab"} ${
        dragClassName || ""
      }`}
      {...dragProps}
      aria-label={`Task ${index + 1}: ${task.title}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          title="Toggle task completion"
          checked={task.completed}
          onChange={() => dispatch(toggleTask(task.id))}
          className="mt-1 h-4 w-4 accent-indigo-500"
          aria-label={`Mark "${task.title}" as ${
            task.completed ? "active" : "completed"
          }`}
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300">Title</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Priority</label>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                  value={draftPriority}
                  onChange={(e) => setDraftPriority(e.target.value)}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300">Category</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300">Tags</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                  value={draftTags}
                  onChange={(e) => setDraftTags(e.target.value)}
                  placeholder="comma separated"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={save}
                  className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`min-w-0 flex-1 truncate text-sm font-medium ${
                    task.completed ? "line-through opacity-70" : ""
                  }`}
                  title={task.title}
                >
                  {task.title}
                </div>
                <PriorityBadge priority={task.priority || "medium"} />
              </div>
              {meta ? (
                <div className="mt-1 truncate text-xs text-slate-300">
                  {meta}
                </div>
              ) : null}
            </>
          )}
        </div>

        {!editing ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(deleteTask(task.id));
                showToast({
                  type: "error",
                  message: `Deleted task: "${task.title}"`,
                });
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
              aria-label={`Delete "${task.title}"`}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {!editing ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="hidden md:block text-xs text-slate-400">
            Drag to reorder or use ↑/↓ buttons:
          </div>
          <div className="text-xs text-slate-400 md:hidden">
            Hold and drag to reorder or use ↑/↓ buttons:
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              title="Move task up"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
              aria-label={`Move "${task.title}" up`}
            >
              ↑
            </button>
            <button
              type="button"
              title="Move task down"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
              aria-label={`Move "${task.title}" down`}
            >
              ↓
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
