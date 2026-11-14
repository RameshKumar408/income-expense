"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import colors from "@/colors";
const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let isAlreadyInit = false;
    try {
      isAlreadyInit =
        typeof window !== "undefined" &&
        (Boolean(window.__appInitialized) ||
          window.sessionStorage.getItem("app_initialized") === "true");
    } catch (e) {
      isAlreadyInit = false;
    }

    if (isAlreadyInit) {
      // If the app was already visited in this session, dismiss splash immediately on refresh
      setInitialLoading(false);
    } else {
      // First cold visit: show smooth 300ms intro splash
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 300);

      try {
        if (typeof window !== "undefined") {
          window.__appInitialized = true;
          window.sessionStorage.setItem("app_initialized", "true");
        }
      } catch (e) {}

      return () => clearTimeout(timer);
    }

    try {
      if (typeof window !== "undefined") {
        window.__appInitialized = true;
        window.sessionStorage.setItem("app_initialized", "true");
      }
    } catch (e) {}
  }, []);

  // Failsafe watchdog: never allow splash screen to stay visible for more than 1.5s under any circumstance
  useEffect(() => {
    if (!initialLoading) return;
    const safetyTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(safetyTimer);
  }, [initialLoading]);

  // Global loader watchdog: reset loading count if stuck > 10s
  useEffect(() => {
    if (loading <= 0) return;
    const safetyTimer = setTimeout(() => {
      setLoading(0);
      setInitialLoading(false);
    }, 10000);
    return () => clearTimeout(safetyTimer);
  }, [loading]);

  useEffect(() => {
    if (loading > 0 || initialLoading) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.touchAction = "";
    };
  }, [loading, initialLoading]);

  const showLoader = useCallback(() => setLoading((p) => p + 1), []);
  const hideLoader = useCallback(() => {
    setLoading((p) => Math.max(0, p - 1));
    setInitialLoading(false); // Hide splash screen when first data fetch completes
    if (typeof window !== "undefined") {
      window.__appInitialized = true;
      try {
        window.sessionStorage.setItem("app_initialized", "true");
      } catch (e) {}
    }
  }, []);

  const value = useMemo(
    () => ({ loading: loading > 0, showLoader, hideLoader }),
    [loading, showLoader, hideLoader],
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {(loading > 0 || initialLoading) && (
        <div
          className="app-loader-overlay"
          style={{
            background: initialLoading
              ? colors.background.base
              : colors.background.overlay,
            zIndex: 99999,
          }}
          onClick={() => {
            if (initialLoading) {
              setInitialLoading(false);
            }
          }}
          onTouchMove={(e) => e.preventDefault()}
        >
          {initialLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <img
                src="/icon.png"
                alt="Splash Logo"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "contain",
                }}
              />
              <div className="skype-loader" style={{ transform: "scale(0.8)" }}>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : (
            <div className="skype-loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export const useLoader = () => useContext(LoaderContext);
