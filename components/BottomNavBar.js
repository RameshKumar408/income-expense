"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";

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

  // Modal / Bottom sheet detection
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

  // Keyboard detection (optimized for iPhone Safari / Standalone PWA)
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
      const activeEl = document.activeElement;
      const isInputActive = isKeyboardInput(activeEl);

      // If an input is actively focused, the keyboard is definitely open on mobile
      if (isInputActive) {
        setIsKeyboardOpen(true);
        return;
      }

      // Visual viewport shrink check
      if (window.visualViewport) {
        const vvHeight = window.visualViewport.height;
        const winHeight = window.innerHeight;
        const screenHeight = window.screen?.height || 0;

        // Safari browser mode: layout viewport remains full, visual viewport shrinks
        const isShrunkRelative = winHeight - vvHeight > 120;
        // iOS PWA standalone mode: innerHeight shrinks to vvHeight, but screen.height is fixed
        const isShrunkScreen =
          screenHeight > 0 && vvHeight < screenHeight * 0.75;
        // iOS Safari upward scroll offset when keyboard opens
        const isOffset = (window.visualViewport.offsetTop || 0) > 40;

        if (isShrunkRelative || isShrunkScreen || isOffset) {
          setIsKeyboardOpen(true);
          return;
        }
      }

      setIsKeyboardOpen(false);
    };

    const handleFocusIn = (e) => {
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

    // Use capture phase on document to catch all events immediately
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);

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
    opacity: 0,
    isReady: false,
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

  const updateBubblePosition = useCallback((immediate = false) => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector(".bottom-nav-item.active");
    if (!activeEl) {
      setBubbleStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    const x = itemRect.left - navRect.left;
    const y = itemRect.top - navRect.top;
    const width = itemRect.width;
    const height = itemRect.height;

    setBubbleStyle((prev) => ({
      x,
      y,
      width,
      height,
      opacity: 1,
      isReady: immediate ? true : prev.isReady,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateBubblePosition(false);
      requestAnimationFrame(() => {
        setBubbleStyle((prev) => ({ ...prev, isReady: true }));
      });
    }, 40);

    const handleResize = () => {
      updateBubblePosition(false);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateBubblePosition]);

  useEffect(() => {
    updateBubblePosition(false);
  }, [pathname, role, optimisticPath, isKeyboardOpen, isModalOpen, updateBubblePosition]);

  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      updateBubblePosition(false);
    });
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [updateBubblePosition]);

  if (!pathname || HIDE_ON_PATHS.includes(pathname)) {
    return null;
  }

  const handleTabClick = (targetPath) => {
    setOptimisticPath(targetPath);
  };

  const handleHistoryClick = (e) => {
    setOptimisticPath("/viewDetails");
    if (pathname === "/viewDetails") {
      // Dispatches event to viewDetails page to toggle or focus search
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-history-search"));
    }
  };

  const shouldHide = isKeyboardOpen || isModalOpen;

  return (
    <nav
      ref={navRef}
      className={`bottom-nav bottom-navigation ${isHistory ? "history-bottom-nav" : ""} ${isKeyboardOpen ? "keyboard-hidden" : ""} ${isModalOpen ? "modal-hidden" : ""}`}
      style={shouldHide ? { display: "none" } : undefined}
      aria-label="Main actions"
    >
      <div
        className={`bottom-nav-bubble ${bubbleStyle.isReady ? "has-transition" : ""}`}
        style={{
          transform: `translate3d(${bubbleStyle.x}px, ${bubbleStyle.y}px, 0)`,
          width: bubbleStyle.width > 0 ? `${bubbleStyle.width}px` : "0px",
          height: bubbleStyle.height > 0 ? `${bubbleStyle.height}px` : "0px",
          opacity: bubbleStyle.opacity,
        }}
        aria-hidden="true"
      />

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
