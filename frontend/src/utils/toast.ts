type ToastType = "success" | "error" | "info" | "warning";

export function toast(message: string, type?: ToastType) {
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { message, type },
    })
  );
}