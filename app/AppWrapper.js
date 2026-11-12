"use client";

import { LoaderProvider } from "./context/LoaderContext";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "@/libs/setupToast";
import { syncOfflineTransactions } from "@/libs/offlineSync";
import BottomNavBar from "@/components/BottomNavBar";

const FONT_URLS = {
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap",
  "Manrope": "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap",
  "Plus Jakarta Sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
};

export function loadDynamicFont(fontName) {
  if (typeof document === "undefined" || !fontName) return;
  const url = FONT_URLS[fontName];
  if (!url) return;
  const linkId = "dynamic-app-font";
  let link = document.getElementById(linkId);
  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== url) {
    link.href = url;
  }
}

export default function AppWrapper({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFont = window.localStorage.getItem("appFont") || "Inter";
      document.documentElement.setAttribute("data-font", savedFont);

      // On-demand load secondary font if user customized their font in settings
      if (savedFont && savedFont !== "Inter" && savedFont !== "Comic Sans MS") {
        loadDynamicFont(savedFont);
      }

      const pendingToast = window.sessionStorage.getItem("pendingToast");
      const pendingToastType =
        window.sessionStorage.getItem("pendingToastType") || "success";

      if (pendingToast) {
        setTimeout(() => {
          if (pendingToastType === "error") {
            toast.error(pendingToast);
          } else {
            toast.success(pendingToast);
          }
        }, 500);
        window.sessionStorage.removeItem("pendingToast");
        window.sessionStorage.removeItem("pendingToastType");
      }

      // Check and sync any pending offline items on mount
      syncOfflineTransactions();

      // Automatically sync whenever the network reconnects
      const handleOnline = () => {
        syncOfflineTransactions();
      };

      window.addEventListener("online", handleOnline);
      return () => {
        window.removeEventListener("online", handleOnline);
      };
    }
  }, []);

  return (
    <LoaderProvider>
      <div className="app-container">{children}</div>
      <BottomNavBar />
    </LoaderProvider>
  );
}
