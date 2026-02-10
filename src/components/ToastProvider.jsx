import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return value;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, type = "info", duration = 3000 }) => {
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast = { id, message, type };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const base =
            "pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur";
          const palette =
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-50"
              : toast.type === "error"
                ? "border-rose-500/40 bg-rose-500/20 text-rose-50"
                : "border-slate-500/40 bg-slate-800/90 text-slate-50";

          return (
            <button
              key={toast.id}
              type="button"
              onClick={() => remove(toast.id)}
              className={`${base} ${palette}`}
            >
              {toast.message}
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

