const STORAGE_KEY_V1 = "tasks";
const STORAGE_KEY_V2 = "task-tracker:tasks:v2";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadTasksFromStorage() {
  if (typeof window === "undefined") return [];

  const v2 = window.localStorage.getItem(STORAGE_KEY_V2);
  if (v2) {
    const parsed = safeParse(v2);
    return Array.isArray(parsed) ? parsed : [];
  }

  // Back-compat with earlier versions of this project.
  const v1 = window.localStorage.getItem(STORAGE_KEY_V1);
  if (v1) {
    const parsed = safeParse(v1);
    return Array.isArray(parsed) ? parsed : [];
  }

  return [];
}

export function saveTasksToStorage(tasks) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(tasks));
  } catch {
    // Swallow quota errors; UI can still function without persistence.
  }
}

export function exportTasksToJson(tasks) {
  return JSON.stringify(tasks, null, 2);
}

export function downloadTextFile(filename, text) {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
