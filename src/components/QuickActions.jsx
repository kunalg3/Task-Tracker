import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { importTasksFromJsonText } from "../features/tasks/taskSlice";
import {
  downloadTextFile,
  exportTasksToJson,
} from "../utils/localStorage";

export default function QuickActions() {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.tasks);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const exportAll = () => {
    const json = exportTasksToJson(list);
    downloadTextFile("tasks-export.json", json);
  };

  const shareMock = async () => {
    const json = exportTasksToJson(list);
    try {
      await navigator.clipboard.writeText(json);
      alert("Copied tasks JSON to clipboard (mock share).");
    } catch {
      alert("Could not access clipboard. Try Export instead.");
    }
  };

  const importFromFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      await dispatch(importTasksFromJsonText(text));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={exportAll}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
      >
        Export
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
      >
        {busy ? "Importing…" : "Import"}
      </button>
      <button
        type="button"
        onClick={shareMock}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
      >
        Share (mock)
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => importFromFile(e.target.files?.[0])}
      />
    </div>
  );
}

