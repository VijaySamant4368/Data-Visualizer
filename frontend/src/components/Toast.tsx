import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastMessage = {
  message: string;
  type?: ToastType;
};

export default function Toast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      setToast(customEvent.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type || "info"}`} role="alert">
      {toast.message}
    </div>
  );
}
