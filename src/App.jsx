import TaskForm from "./features/tasks/TaskForm";
import TaskList from "./features/tasks/TaskList";
import Filters from "./components/Filters";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  hydrateTasks,
  redo,
  undo,
} from "./features/tasks/taskSlice";
import Stats from "./components/Stats";
import QuickActions from "./components/QuickActions";

function App() {
  const dispatch = useDispatch();
  const { error, history } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(hydrateTasks());
  }, [dispatch]);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Task Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Organize tasks with priority, categories, search, and quick
              actions.
            </p>
          </div>
          <div className="grid gap-2 justify-items-end">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch(undo())}
                disabled={history.past.length === 0}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => dispatch(redo())}
                disabled={history.future.length === 0}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Redo
              </button>
            </div>
            <QuickActions />
          </div>
        </div>

        <div className="mt-4">
          <Stats />
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 text-sm text-rose-100">
                {error}
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearError())}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs hover:bg-rose-500/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <TaskForm />
          <Filters />
          <TaskList />
        </div>
      </div>
    </div>
  );
}

export default App;
