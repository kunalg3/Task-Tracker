import { describe, expect, it } from "vitest";
import reducer, {
  addTask,
  deleteTask,
  redo,
  reorderTasks,
  toggleTask,
  undo,
  updateTask,
} from "./taskSlice";

function makeState(overrides = {}) {
  return {
    list: [],
    filter: "all",
    search: "",
    categoryFilter: "all",
    priorityFilter: "all",
    tagFilter: "",
    hydrated: true,
    error: null,
    history: { past: [], future: [] },
    ...overrides,
  };
}

describe("taskSlice reducers", () => {
  it("adds a task with defaults", () => {
    const s1 = makeState();
    const s2 = reducer(s1, addTask({ title: "Test", priority: "high" }));
    expect(s2.list).toHaveLength(1);
    expect(s2.list[0].title).toBe("Test");
    expect(s2.list[0].completed).toBe(false);
    expect(s2.list[0].priority).toBe("high");
    expect(s2.history.past).toHaveLength(1);
  });

  it("toggles completion", () => {
    const s1 = reducer(makeState(), addTask({ title: "A" }));
    const id = s1.list[0].id;
    const s2 = reducer(s1, toggleTask(id));
    expect(s2.list[0].completed).toBe(true);
  });

  it("updates a task and deletes it if title becomes empty", () => {
    const s1 = reducer(makeState(), addTask({ title: "A" }));
    const id = s1.list[0].id;
    const s2 = reducer(
      s1,
      updateTask({ id, changes: { title: "", category: "Work" } }),
    );
    expect(s2.list).toHaveLength(0);
  });

  it("reorders tasks by ids", () => {
    let s = makeState();
    s = reducer(s, addTask({ title: "A" }));
    s = reducer(s, addTask({ title: "B" }));
    // addTask unshifts, so current order: B, A
    const [b, a] = s.list;
    const s2 = reducer(s, reorderTasks({ activeId: a.id, overId: b.id }));
    expect(s2.list[0].title).toBe("A");
    expect(s2.list[1].title).toBe("B");
  });

  it("supports undo/redo", () => {
    let s = makeState();
    s = reducer(s, addTask({ title: "A" }));
    s = reducer(s, addTask({ title: "B" }));
    expect(s.list).toHaveLength(2);

    const sUndo = reducer(s, undo());
    expect(sUndo.list).toHaveLength(1);

    const sRedo = reducer(sUndo, redo());
    expect(sRedo.list).toHaveLength(2);
  });

  it("deletes by id", () => {
    let s = makeState();
    s = reducer(s, addTask({ title: "A" }));
    const id = s.list[0].id;
    const s2 = reducer(s, deleteTask(id));
    expect(s2.list).toHaveLength(0);
  });
});

