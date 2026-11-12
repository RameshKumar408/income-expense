"use client";

import { LoaderProvider } from "./context/LoaderContext";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "@/libs/setupToast";
import { scheduleOfflineSync } from "@/libs/offlineSync";
import BottomNavBar from "@/components/BottomNavBar";

// Fonts are self-hosted in /fonts and declared via @font-face in globals.css.
export function loadDynamicFont(_fontName) {
  // Retained for backward compatibility; fonts load locally via CSS @font-face
}

export default function AppWrapper({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFont = window.localStorage.getItem("appFont") || "Inter";
      document.documentElement.setAttribute("data-font", savedFont);

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

      // Check and sync any pending offline items during idle time (unblocks launch)
      let cancelSchedule = scheduleOfflineSync(3000);

      // Automatically sync whenever the network reconnects
      const handleOnline = () => {
        if (cancelSchedule) cancelSchedule();
        cancelSchedule = scheduleOfflineSync(1500);
      };

      window.addEventListener("online", handleOnline);
      return () => {
        window.removeEventListener("online", handleOnline);
        if (cancelSchedule) cancelSchedule();
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
