import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastMessage = {
  message: string;
  type?: ToastType;
};

export default function Toast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  if (!toast) return null;
    const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "#22c55e"; // green
      case "error":
        return "#ef4444"; // red
      case "warning":
        return "#f59e0b"; // orange
      case "info":
      default:
        return "#3b82f6"; // blue
    }}

  return (
    <div className={`toast toast-${toast.type || "info"}`} role="alert">
      {toast.message}
    </div>
  );
}
