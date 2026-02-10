import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import taskReducer, {
  addTask,
  deleteTask,
  hydrateTasks,
  importTasksFromJsonText,
  redo,
  reorderTasks,
  toggleTask,
  undo,
  updateTask,
} from "../features/tasks/taskSlice";
import { saveTasksToStorage } from "../utils/localStorage";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    undo,
    redo,
    hydrateTasks.fulfilled,
    importTasksFromJsonText.fulfilled
  ),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    // Store is sync, but listener effect can be async.
    saveTasksToStorage(state.tasks.list);
  },
});

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
