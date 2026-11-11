import { toast } from "react-toastify";

/**
 * Ensures only one toast is displayed at a time across the entire application.
 * When a new toast arrives, any existing toast is dismissed immediately.
 */
export function configureSingleToast() {
  if (typeof window === "undefined") return;

  if (window.__singleToastConfigured) return;
  window.__singleToastConfigured = true;

  let activeToastId = null;

  // Global listener: dismiss old toast whenever any new toast is added
  toast.onChange((item) => {
    if (item.status === "added") {
      if (activeToastId !== null && activeToastId !== item.id) {
        toast.dismiss(activeToastId);
      }
      activeToastId = item.id;
    } else if (item.status === "removed") {
      if (activeToastId === item.id) {
        activeToastId = null;
      }
    }
  });

  // Intercept standard helper methods so existing toasts are dismissed
  // immediately before the new toast is built
  const methods = [
    "success",
    "error",
    "info",
    "warn",
    "warning",
    "loading",
    "dark",
  ];

  methods.forEach((method) => {
    const original = toast[method];
    if (typeof original === "function") {
      toast[method] = function (content, options) {
        toast.dismiss();
        return original.call(this, content, options);
      };
    }
  });
}

// Auto-run if imported on the client
if (typeof window !== "undefined") {
  configureSingleToast();
}

