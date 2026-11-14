"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const HIDE_ON_PATHS = ["/", "/register", "/authtoken", "/details"];

function isKeyboardInput(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toUpperCase();
  if (
    tag === "TEXTAREA" ||
    el.isContentEditable ||
    el.getAttribute?.("role") === "textbox"
  ) {
    return true;
  }
  if (tag === "INPUT") {
    const type = (el.type || "text").toLowerCase();
    const nonKeyboardTypes = [
      "checkbox",
      "radio",
      "button",
      "submit",
      "reset",
      "file",
      "image",
      "range",
      "color",
    ];
    return !nonKeyboardTypes.includes(type);
  }
  return false;
}

export default function BottomNavBar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkModalOpen = () => {
      const modalEl = document.querySelector(
        ".history-filter-modal-overlay, .mobile-account-container, .mobile-account-sheet, .record-detail-overlay, .MuiDialog-root",
      );
      setIsModalOpen(Boolean(modalEl));
    };

    checkModalOpen();
    const observer = new MutationObserver(checkModalOpen);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readRole = () => {
      setRole(window.localStorage.getItem("roles") || "");
    };

    readRole();
    window.addEventListener("storage", readRole);

    let blurTimer1 = null;
    let blurTimer2 = null;

    const checkKeyboard = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsKeyboardOpen(false);
        return;
      }

      const activeEl = document.activeElement;
      const isInputActive = isKeyboardInput(activeEl);

      if (isInputActive) {
        setIsKeyboardOpen(true);
        return;
      }

      if (window.visualViewport) {
        const vvHeight = window.visualViewport.height;
        const winHeight = window.innerHeight;
        const screenHeight = window.screen?.height || 0;

        const isShrunkRelative = winHeight - vvHeight > 120;
        const isShrunkScreen =
          screenHeight > 0 && vvHeight < screenHeight * 0.75;
        const isOffset = (window.visualViewport.offsetTop || 0) > 40;

        if (isShrunkRelative || isShrunkScreen || isOffset) {
          setIsKeyboardOpen(true);
          return;
        }
      }

      setIsKeyboardOpen(false);
    };

    const handleFocusIn = (e) => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        return;
      }

      if (
        isKeyboardInput(e.target) ||
        isKeyboardInput(document.activeElement)
      ) {
        if (blurTimer1) clearTimeout(blurTimer1);
        if (blurTimer2) clearTimeout(blurTimer2);
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      if (blurTimer1) clearTimeout(blurTimer1);
      if (blurTimer2) clearTimeout(blurTimer2);

      // Fast check
      blurTimer1 = setTimeout(() => {
        checkKeyboard();
      }, 150);

      // Follow-up check after iOS keyboard collapse animation (~350ms)
      blurTimer2 = setTimeout(() => {
        checkKeyboard();
      }, 350);
    };

    const handleViewportChange = () => {
      checkKeyboard();
    };

    const handleWindowResize = () => {
      if (window.innerWidth >= 768) {
        setIsKeyboardOpen(false);
      } else {
        checkKeyboard();
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);
    window.addEventListener("resize", handleWindowResize);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    return () => {
      if (blurTimer1) clearTimeout(blurTimer1);
      if (blurTimer2) clearTimeout(blurTimer2);
      window.removeEventListener("storage", readRole);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      window.removeEventListener("resize", handleWindowResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange,
        );
      }
    };
  }, []);

  const navRef = useRef(null);
  const [optimisticPath, setOptimisticPath] = useState(null);
  const [bubbleStyle, setBubbleStyle] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    hasPosition: false,
    hasTransition: false,
  });

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const activePath = optimisticPath || pathname;
  const isHome = activePath === "/createDetail";
  const isDrive = activePath === "/authorize";
  const isHistory =
    activePath === "/viewDetails" || activePath.startsWith("/editDetails");
  const isSettings = activePath === "/settings";

  const updateBubblePosition = useCallback((enableTransition = false) => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector(".bottom-nav-item.active");
    if (!activeEl) {
      setBubbleStyle((prev) => ({ ...prev, hasPosition: false }));
      return;
    }

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    if (navRect.width === 0 || itemRect.width === 0) {
      return;
    }

    const x = itemRect.left - navRect.left;
    const y = itemRect.top - navRect.top;
    const width = itemRect.width;
    const height = itemRect.height;

    setBubbleStyle((prev) => ({
      x,
      y,
      width,
      height,
      hasPosition: true,
      hasTransition: enableTransition || prev.hasTransition,
    }));
  }, []);

  const shouldHide = isKeyboardOpen || isModalOpen;

  useIsomorphicLayoutEffect(() => {
    updateBubblePosition(false);

    const timer = setTimeout(() => {
      setBubbleStyle((prev) => ({ ...prev, hasTransition: true }));
    }, 200);

    const handleResize = () => {
      if (!shouldHide) {
        updateBubblePosition(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [shouldHide, updateBubblePosition]);

  useIsomorphicLayoutEffect(() => {
    if (shouldHide) return;
    updateBubblePosition(Boolean(optimisticPath));
  }, [pathname, role, optimisticPath, shouldHide, updateBubblePosition]);

  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width === 0 && entry.contentRect.height === 0) {
          return;
        }
      }
      if (!shouldHide) {
        updateBubblePosition(false);
      }
    });
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [shouldHide, updateBubblePosition]);

  if (!pathname || HIDE_ON_PATHS.includes(pathname)) {
    return null;
  }

  const handleTabClick = (targetPath) => {
    setOptimisticPath(targetPath);
  };

  const handleHistoryClick = (e) => {
    setOptimisticPath("/viewDetails");
    if (pathname === "/viewDetails") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-history-search"));
    }
  };

  return (
    <nav
      ref={navRef}
      className={`bottom-nav bottom-navigation ${isHistory ? "history-bottom-nav" : ""} ${isKeyboardOpen ? "keyboard-hidden" : ""} ${isModalOpen ? "modal-hidden" : ""}`}
      style={shouldHide ? { display: "none" } : undefined}
      aria-label="Main actions"
    >
      <div
        className={`bottom-nav-bubble ${bubbleStyle.hasTransition ? "has-transition" : ""} ${bubbleStyle.hasPosition ? "is-visible" : ""}`}
        style={{
          transform: `translate3d(${bubbleStyle.x}px, ${bubbleStyle.y}px, 0)`,
          width: bubbleStyle.width > 0 ? `${bubbleStyle.width}px` : "0px",
          height: bubbleStyle.height > 0 ? `${bubbleStyle.height}px` : "0px",
          opacity: bubbleStyle.hasPosition ? 1 : 0,
          visibility: bubbleStyle.hasPosition ? "visible" : "hidden",
        }}
        aria-hidden="true"
      >
        <div className="bottom-nav-bubble-inner" />
      </div>

      <Link
        className={`bottom-nav-item ${isHome ? "active" : ""}`}
        href="/createDetail"
        prefetch={true}
        aria-label="Create details"
        onClick={() => handleTabClick("/createDetail")}
      >
        <HomeOutlinedIcon />
      </Link>

      {role === "admin" && (
        <Link
          className={`bottom-nav-item ${isDrive ? "active" : ""}`}
          href="/authorize"
          prefetch={true}
          aria-label="Google drive"
          onClick={() => handleTabClick("/authorize")}
        >
          <ExploreOutlinedIcon />
        </Link>
      )}

      <Link
        className={`bottom-nav-item ${isHistory ? "active history-center-nav" : ""}`}
        href="/viewDetails"
        prefetch={true}
        aria-label="History"
        onClick={handleHistoryClick}
      >
        <SearchIcon />
      </Link>

      <Link
        className={`bottom-nav-item ${isSettings ? "active" : ""}`}
        href="/settings"
        prefetch={true}
        aria-label="Settings"
        onClick={() => handleTabClick("/settings")}
      >
        <SettingsIcon />
      </Link>
    </nav>
  );
}
