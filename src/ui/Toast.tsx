import { useEffect, useState } from "react";

export type ToastData = {
  id: number;
  message: string;
  icon?: string;
};

let _listeners: Array<(t: ToastData) => void> = [];

export function showToast(message: string, icon = "✓") {
  const t: ToastData = { id: Date.now(), message, icon };
  _listeners.forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (t: ToastData) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 2600);
    };
    _listeners.push(handler);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toastContainer">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toastIcon">{t.icon}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
