"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(0);
  const [initialLoading, setInitialLoading] = useState(() => {
    if (typeof window !== "undefined") {
      // If already initialized in this session, never show splash again during tab navigation
      if (
        window.__appInitialized ||
        window.sessionStorage.getItem("app_initialized")
      ) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__appInitialized = true;
      try {
        window.sessionStorage.setItem("app_initialized", "true");
      } catch (e) {}
    }
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
            background: initialLoading ? "#000000" : "rgba(0, 0, 0, 0.72)",
            zIndex: 99999,
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
