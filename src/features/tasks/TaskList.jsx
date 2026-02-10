import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskItem from "./TaskItem";
import { reorderTasks } from "./taskSlice";

function includesNormalized(haystack, needle) {
  return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
}

export default function TaskList() {
  const dispatch = useDispatch();
  const { list, filter, search, categoryFilter, priorityFilter, tagFilter } =
    useSelector((s) => s.tasks);

  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((task) => {
      if (filter === "completed" && !task.completed) return false;
      if (filter === "active" && task.completed) return false;

      if (categoryFilter !== "all" && task.category !== categoryFilter)
        return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      if (tagFilter) {
        const tags = Array.isArray(task.tags) ? task.tags : [];
        if (!tags.includes(tagFilter)) return false;
      }

      if (!q) return true;
      const inTitle = includesNormalized(task.title, q);
      const inCategory = includesNormalized(task.category, q);
      const inTags = (Array.isArray(task.tags) ? task.tags : []).some((t) =>
        includesNormalized(t, q),
      );
      return inTitle || inCategory || inTags;
    });
  }, [list, filter, search, categoryFilter, priorityFilter, tagFilter]);

  const onDragStart = (taskId) => (e) => {
    setDraggingId(taskId);
    setOverId(taskId);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", taskId);
    } catch {
      // ignore
    }
  };

  const onDragOver = (taskId) => (e) => {
    e.preventDefault();
    setOverId(taskId);
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {
      // ignore
    }
  };

  const onDrop = (taskId) => (e) => {
    e.preventDefault();
    const activeId = draggingId || e.dataTransfer.getData("text/plain");
    const over = taskId;
    setDraggingId(null);
    setOverId(null);
    if (activeId && over && activeId !== over) {
      dispatch(reorderTasks({ activeId, overId: over }));
    }
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
        <div className="text-sm font-medium">No tasks found</div>
        <div className="mt-1 text-xs text-slate-300">
          Try clearing filters or adding a new task above.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {filtered.map((task, idx) => {
        const canMoveUp = idx > 0;
        const canMoveDown = idx < filtered.length - 1;

        const moveUp = () => {
          if (!canMoveUp) return;
          dispatch(
            reorderTasks({ activeId: task.id, overId: filtered[idx - 1].id }),
          );
        };
        const moveDown = () => {
          if (!canMoveDown) return;
          dispatch(
            reorderTasks({ activeId: task.id, overId: filtered[idx + 1].id }),
          );
        };

        const isDragging = draggingId === task.id;
        const isOver =
          overId === task.id && draggingId && draggingId !== task.id;

        return (
          <div
            key={task.id}
            onDragOver={onDragOver(task.id)}
            onDrop={onDrop(task.id)}
            className={isOver ? "rounded-xl ring-2 ring-indigo-400/60" : ""}
          >
            <TaskItem
              task={task}
              index={idx}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              isDragging={isDragging}
              draggableProps={{
                draggable: true,
                onDragStart: onDragStart(task.id),
                onDragEnd,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
