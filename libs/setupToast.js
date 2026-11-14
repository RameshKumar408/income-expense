import { toast } from "react-toastify";

export function configureSingleToast() {
  if (typeof window === "undefined") return;

  if (window.__singleToastConfigured) return;
  window.__singleToastConfigured = true;

  let activeToastId = null;

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

if (typeof window !== "undefined") {
  configureSingleToast();
}
