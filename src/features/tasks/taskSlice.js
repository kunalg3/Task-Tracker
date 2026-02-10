import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { loadTasksFromStorage } from "../../utils/localStorage";

function normalizePriority(value) {
  const v = String(value || "").toLowerCase();
  if (v === "low" || v === "high") return v;
  return "medium";
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return [];
}

function normalizeTask(input) {
  const now = new Date().toISOString();
  const title = String(input?.title ?? "").trim();

  return {
    id: String(input?.id || uuid()),
    title,
    completed: Boolean(input?.completed),
    priority: normalizePriority(input?.priority),
    category: String(input?.category ?? "").trim(),
    tags: normalizeTags(input?.tags),
    createdAt: String(input?.createdAt || now),
    updatedAt: String(input?.updatedAt || now),
  };
}

function snapshotList(list) {
  return list.map((t) => ({
    ...t,
    tags: Array.isArray(t.tags) ? [...t.tags] : [],
  }));
}

function pushHistory(state) {
  state.history.past.push(snapshotList(state.list));
  if (state.history.past.length > 50) state.history.past.shift();
  state.history.future = [];
}

function arrayMove(arr, fromIndex, toIndex) {
  const copy = [...arr];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

export const hydrateTasks = createAsyncThunk("tasks/hydrate", async () => {
  // localStorage is sync, but thunk satisfies "async ops" requirement.
  const raw = loadTasksFromStorage();
  const tasks = Array.isArray(raw) ? raw : [];

  return tasks
    .map((t) => normalizeTask(t))
    .filter((t) => t.title.length > 0);
});

export const importTasksFromJsonText = createAsyncThunk(
  "tasks/importFromJsonText",
  async (jsonText) => {
    let parsed;
    try {
      parsed = JSON.parse(String(jsonText));
    } catch {
      throw new Error("Invalid JSON file.");
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Import file must be an array of tasks.");
    }

    return parsed
      .map((t) => normalizeTask(t))
      .filter((t) => t.title.length > 0);
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    list: [],
    filter: "all", // all | active | completed
    search: "",
    categoryFilter: "all",
    priorityFilter: "all", // all | low | medium | high
    tagFilter: "",
    hydrated: false,
    error: null,
    history: { past: [], future: [] },
  },
  reducers: {
    addTask: (state, action) => {
      const task = normalizeTask(action.payload);
      if (!task.title) return;
      pushHistory(state);
      state.list.unshift(task);
    },
    updateTask: (state, action) => {
      const { id, changes } = action.payload || {};
      const task = state.list.find((t) => t.id === id);
      if (!task) return;
      pushHistory(state);

      if (typeof changes?.title !== "undefined") {
        task.title = String(changes.title).trim();
      }
      if (typeof changes?.completed !== "undefined") {
        task.completed = Boolean(changes.completed);
      }
      if (typeof changes?.priority !== "undefined") {
        task.priority = normalizePriority(changes.priority);
      }
      if (typeof changes?.category !== "undefined") {
        task.category = String(changes.category ?? "").trim();
      }
      if (typeof changes?.tags !== "undefined") {
        task.tags = normalizeTags(changes.tags);
      }

      task.updatedAt = new Date().toISOString();

      // If title becomes empty, delete (better UX than leaving blanks).
      if (!task.title) {
        state.list = state.list.filter((t) => t.id !== id);
      }
    },
    toggleTask: (state, action) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (!task) return;
      pushHistory(state);
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
    },
    deleteTask: (state, action) => {
      const id = action.payload;
      if (!state.list.some((t) => t.id === id)) return;
      pushHistory(state);
      state.list = state.list.filter((t) => t.id !== id);
    },
    reorderTasks: (state, action) => {
      const { activeId, overId } = action.payload || {};
      if (!activeId || !overId || activeId === overId) return;
      const from = state.list.findIndex((t) => t.id === activeId);
      const to = state.list.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0) return;
      pushHistory(state);
      state.list = arrayMove(state.list, from, to);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setTagFilter: (state, action) => {
      state.tagFilter = action.payload;
    },
    clearAdvancedFilters: (state) => {
      state.categoryFilter = "all";
      state.priorityFilter = "all";
      state.tagFilter = "";
    },
    undo: (state) => {
      const prev = state.history.past.pop();
      if (!prev) return;
      state.history.future.unshift(snapshotList(state.list));
      state.list = prev;
    },
    redo: (state) => {
      const next = state.history.future.shift();
      if (!next) return;
      state.history.past.push(snapshotList(state.list));
      state.list = next;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateTasks.fulfilled, (state, action) => {
        state.list = action.payload;
        state.hydrated = true;
        state.error = null;
        state.history = { past: [], future: [] };
      })
      .addCase(hydrateTasks.rejected, (state) => {
        state.hydrated = true;
        state.error = "Failed to load tasks from storage.";
      })
      .addCase(importTasksFromJsonText.fulfilled, (state, action) => {
        pushHistory(state);
        state.list = action.payload;
        state.error = null;
      })
      .addCase(importTasksFromJsonText.rejected, (state, action) => {
        state.error =
          action.error?.message || "Failed to import tasks from JSON.";
      });
  },
});

export const {
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
  reorderTasks,
  setFilter,
  setSearch,
  setCategoryFilter,
  setPriorityFilter,
  setTagFilter,
  clearAdvancedFilters,
  undo,
  redo,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer;
