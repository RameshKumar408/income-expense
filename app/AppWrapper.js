"use client";

import { LoaderProvider } from "./context/LoaderContext";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "@/libs/setupToast";
import { syncOfflineTransactions } from "@/libs/offlineSync";
import BottomNavBar from "@/components/BottomNavBar";

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
