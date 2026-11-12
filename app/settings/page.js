"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FontDownloadOutlinedIcon from "@mui/icons-material/FontDownloadOutlined";
import VibrationIcon from "@mui/icons-material/Vibration";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import SyncIcon from "@mui/icons-material/Sync";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  getOfflineQueueCount,
  syncOfflineTransactions,
} from "@/libs/offlineSync";
import { clearRangeDataCache } from "@/libs/dataCache";
import { triggerHaptic } from "@/libs/haptics";

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter", font: "var(--font-inter), sans-serif" },
  {
    label: "DM Sans",
    value: "DM Sans",
    font: "var(--font-dm-sans), sans-serif",
  },
  {
    label: "Manrope",
    value: "Manrope",
    font: "var(--font-manrope), sans-serif",
  },
  {
    label: "Plus Jakarta Sans",
    value: "Plus Jakarta Sans",
    font: "var(--font-plus-jakarta-sans), sans-serif",
  },
  {
    label: "Comic Sans MS",
    value: "Comic Sans MS",
    font: "'Comic Sans MS', 'Comic Sans', cursive, sans-serif",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  // Account State
  const [activeAccount, setActiveAccount] = useState("");
  const [role, setRole] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Preference State
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Connection & Offline State
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load active account and multi-accounts list
    const currentActive = window.localStorage.getItem("activeAccount") || "";
    const list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    const currentRole = window.localStorage.getItem("roles") || "";
    const savedFont = window.localStorage.getItem("appFont") || "Inter";
    const savedHaptics = window.localStorage.getItem("hapticsEnabled");

    setActiveAccount(currentActive);
    setAccounts(list);
    setRole(currentRole);
    setSelectedFont(savedFont);
    setHapticsEnabled(savedHaptics !== "0");

    // Network & Offline Status
    setIsOnline(navigator.onLine);
    setOfflineCount(getOfflineQueueCount());

    // PWA Standalone Detection
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(window.navigator.standalone);
    setIsStandalone(standalone);

    const handleOnline = () => {
      setIsOnline(true);
      setOfflineCount(getOfflineQueueCount());
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    router.prefetch("/createDetail");
    router.prefetch("/viewDetails");
    if (role === "admin") {
      router.prefetch("/authorize");
    }
  }, [router, role]);

  const handleFontChange = (e) => {
    const newFont = e.target.value;
    setSelectedFont(newFont);
    window.localStorage.setItem("appFont", newFont);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font", newFont);
    }
    toast.success(`Font changed to ${newFont}`);
  };

  const handleToggleHaptics = () => {
    const nextVal = !hapticsEnabled;
    setHapticsEnabled(nextVal);
    window.localStorage.setItem("hapticsEnabled", nextVal ? "1" : "0");
    if (nextVal) {
      triggerHaptic(30);
    }
    toast.success(
      nextVal ? "Haptic vibrations enabled" : "Haptic vibrations disabled",
    );
  };

  const handleSwitchAccount = (account) => {
    if (account.email === activeAccount) return;
    clearRangeDataCache();
    window.localStorage.setItem("token", account.token);
    window.localStorage.setItem("roles", account.role);
    window.localStorage.setItem("activeAccount", account.email);
    setActiveAccount(account.email);
    setRole(account.role);
    setShowAccountsDropdown(false);
    toast.success(`Switched to ${account.email}`);
  };

  const addAccount = () => {
    router.push("/?add=1");
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.warn("Device is offline. Connect to network to sync.");
      return;
    }
    setIsSyncing(true);
    try {
      await syncOfflineTransactions();
      setOfflineCount(getOfflineQueueCount());
    } catch (e) {
      toast.error("Failed to sync offline items");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmLogout = () => {
    const currentEmail = window.localStorage.getItem("activeAccount");
    const list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    clearRangeDataCache();

    if (list.length > 1) {
      const remaining = list.filter((a) => a.email !== currentEmail);
      window.localStorage.setItem("accounts", JSON.stringify(remaining));
      const next = remaining[0];
      window.localStorage.setItem("token", next.token);
      window.localStorage.setItem("roles", next.role);
      window.localStorage.setItem("activeAccount", next.email);
      setAccounts(remaining);
      setActiveAccount(next.email);
      setRole(next.role);
      setShowLogoutConfirm(false);
      toast.success(`Removed account. Switched to ${next.email}`);
    } else {
      window.localStorage.setItem("accounts", JSON.stringify([]));
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("roles");
      window.localStorage.removeItem("activeAccount");
      setShowLogoutConfirm(false);
      router.push("/");
    }
  };

  const initialLetter = (activeAccount || "U").charAt(0).toUpperCase();

  return (
    <div className="create-detail-page">
      <main className="expense-shell settings-shell">
        <header className="settings-header">
          <span className="settings-title-icon">
            <img
              src="/icon.png"
              alt="Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                mixBlendMode: "screen",
                transform: "scale(1.3)",
              }}
            />
          </span>
          <h1>Settings</h1>
        </header>

        <div className="ios-settings-container">
          {/* Section 1: Account & Profile */}
          <section
            className="ios-settings-section"
            aria-label="Account Settings"
          >
            <div className="ios-settings-section-title">Account</div>
            <div className="ios-settings-card">
              <div className="ios-profile-banner">
                <div className="ios-profile-avatar">{initialLetter}</div>
                <div className="ios-profile-info">
                  <span className="ios-profile-email">
                    {activeAccount || "Logged in"}
                  </span>
                  <span
                    className={`ios-role-pill ${role === "admin" ? "admin" : "member"}`}
                  >
                    {role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>

              {/* Multi-Account Switcher (if user has > 1 account) */}
              {accounts.length > 1 && (
                <div
                  style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
                >
                  <div
                    className="ios-settings-row clickable"
                    onClick={() => setShowAccountsDropdown((prev) => !prev)}
                  >
                    <div className="ios-settings-row-left">
                      <div className="ios-settings-icon-pill">
                        <SwapHorizIcon sx={{ fontSize: 18 }} />
                      </div>
                      <span className="ios-settings-row-label">
                        Switch Account
                      </span>
                    </div>
                    <div className="ios-settings-row-right">
                      <span className="ios-settings-row-subtext">
                        {accounts.length} Saved
                      </span>
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: 20,
                          color: "rgba(212, 160, 23, 0.7)",
                          transform: showAccountsDropdown
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </div>
                  </div>

                  {showAccountsDropdown && (
                    <div style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}>
                      {accounts.map((acc) => {
                        const isActive = acc.email === activeAccount;
                        return (
                          <div
                            key={acc.email}
                            className="ios-settings-row clickable"
                            onClick={() => handleSwitchAccount(acc)}
                            style={{
                              paddingLeft: "24px",
                              backgroundColor: isActive
                                ? "rgba(212, 160, 23, 0.1)"
                                : "transparent",
                              borderBottom: "1px solid rgba(212, 160, 23, 0.1)",
                            }}
                          >
                            <div className="ios-settings-row-left">
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive
                                    ? "#ffd88a"
                                    : "rgba(255, 255, 255, 0.8)",
                                }}
                              >
                                {acc.email}
                              </span>
                              {acc.role === "admin" && (
                                <span className="ios-role-pill admin">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="ios-settings-row-right">
                              {isActive && (
                                <CheckIcon
                                  sx={{ fontSize: 18, color: "#d4a017" }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Add Account Row */}
              <div
                className="ios-settings-row clickable"
                onClick={addAccount}
                style={{ borderTop: "1px solid rgba(212, 160, 23, 0.12)" }}
              >
                <div className="ios-settings-row-left">
                  <div className="ios-settings-icon-pill">
                    <PersonAddIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span className="ios-settings-row-label">
                    Add Another Account
                  </span>
                </div>
                <div className="ios-settings-row-right">
                  <ChevronRightIcon
                    sx={{ fontSize: 20, color: "rgba(212, 160, 23, 0.6)" }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Appearance & Feel */}
          <section
            className="ios-settings-section"
            aria-label="Appearance Settings"
          >
            <div className="ios-settings-section-title">Appearance & Feel</div>
            <div className="ios-settings-card">
              {/* App Font Row */}
              <div className="ios-settings-row">
                <div className="ios-settings-row-left">
                  <div className="ios-settings-icon-pill">
                    <FontDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span className="ios-settings-row-label">App Font</span>
                </div>
                <div className="ios-settings-row-right">
                  <FormControl size="small">
                    <Select
                      value={selectedFont}
                      onChange={handleFontChange}
                      aria-label="Select App Font"
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        height: "36px",
                        minWidth: "140px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(212, 160, 23, 0.4)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(212, 160, 23, 0.8)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d4a017",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#d4a017",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: "rgba(12, 14, 20, 0.95)",
                            backdropFilter: "blur(24px)",
                            color: "#ffffff",
                            border: "1px solid rgba(212, 160, 23, 0.3)",
                            borderRadius: "14px",
                            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
                            mt: 1,
                            "& .MuiMenuItem-root": {
                              fontSize: "14px",
                              padding: "10px 16px",
                              "&:hover": {
                                backgroundColor: "rgba(212, 160, 23, 0.15)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(212, 160, 23, 0.25)",
                                color: "#ffd88a",
                                fontWeight: 700,
                              },
                            },
                          },
                        },
                      }}
                    >
                      {FONT_OPTIONS.map((font) => (
                        <MenuItem
                          key={font.value}
                          value={font.value}
                          style={{ fontFamily: font.font }}
                        >
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Haptic Vibrations Row */}
              <div className="ios-settings-row">
                <div className="ios-settings-row-left">
                  <div className="ios-settings-icon-pill">
                    <VibrationIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="ios-settings-row-label">
                      Haptic Vibrations
                    </div>
                    <div className="ios-settings-row-subtext">
                      Touch feedback for gestures & taps
                    </div>
                  </div>
                </div>
                <div className="ios-settings-row-right">
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={hapticsEnabled}
                      onChange={handleToggleHaptics}
                      aria-label="Toggle Haptic Feedback"
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Data & Offline Network */}
          <section
            className="ios-settings-section"
            aria-label="Data and Connection"
          >
            <div className="ios-settings-section-title">Network & Sync</div>
            <div className="ios-settings-card">
              {/* Connection Status Row */}
              <div className="ios-settings-row">
                <div className="ios-settings-row-left">
                  <div
                    className={`ios-settings-icon-pill ${isOnline ? "" : "danger"}`}
                  >
                    {isOnline ? (
                      <WifiIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <WifiOffIcon sx={{ fontSize: 18 }} />
                    )}
                  </div>
                  <span className="ios-settings-row-label">
                    Connection Status
                  </span>
                </div>
                <div className="ios-settings-row-right">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isOnline ? "#ffd88a" : "#ff455b",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isOnline ? "#d4a017" : "#ff455b",
                        boxShadow: isOnline
                          ? "0 0 8px rgba(212, 160, 23, 0.6)"
                          : "0 0 8px rgba(255, 69, 91, 0.6)",
                      }}
                    />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Offline Sync Queue Row */}
              <div className="ios-settings-row">
                <div className="ios-settings-row-left">
                  <div className="ios-settings-icon-pill">
                    <SyncIcon
                      sx={{
                        fontSize: 18,
                        animation: isSyncing
                          ? "spin 1s linear infinite"
                          : "none",
                        "@keyframes spin": {
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  </div>
                  <div>
                    <div className="ios-settings-row-label">
                      Offline Sync Queue
                    </div>
                    <div className="ios-settings-row-subtext">
                      {offlineCount === 0
                        ? "All transactions synced"
                        : `${offlineCount} transaction${offlineCount > 1 ? "s" : ""} waiting to sync`}
                    </div>
                  </div>
                </div>
                <div className="ios-settings-row-right">
                  {offlineCount > 0 && (
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing || !isOnline}
                      style={{
                        background: "linear-gradient(135deg, #ffd88a, #d4a017)",
                        border: "none",
                        color: "#111111",
                        fontWeight: 700,
                        fontSize: "12px",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        cursor:
                          isSyncing || !isOnline ? "not-allowed" : "pointer",
                        opacity: isSyncing || !isOnline ? 0.6 : 1,
                      }}
                    >
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Security / Logout */}
          <section
            className="ios-settings-section"
            aria-label="Session and Security"
          >
            <div className="ios-settings-section-title">Session & Security</div>
            <div className="ios-settings-card">
              <div
                className="ios-settings-row clickable"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <div className="ios-settings-row-left">
                  <div className="ios-settings-icon-pill danger">
                    <LogoutIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span
                    className="ios-settings-row-label"
                    style={{ color: "#ff455b" }}
                  >
                    {accounts.length > 1 ? "Remove This Account" : "Log Out"}
                  </span>
                </div>
                <div className="ios-settings-row-right">
                  <ChevronRightIcon
                    sx={{ fontSize: 20, color: "rgba(255, 69, 91, 0.4)" }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* App Info Footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              marginBottom: "36px",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PhoneIphoneIcon
                sx={{
                  fontSize: 15,
                  color: isStandalone ? "#ffd88a" : "rgba(255, 255, 255, 0.4)",
                }}
              />
              <span>
                {isStandalone
                  ? "Installed Standalone PWA"
                  : "Mobile Web Browser"}
              </span>
            </div>
            <div>Expenses Tracker • Version 1.107</div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="ios-confirm-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="ios-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ios-confirm-icon-wrap">
              <LogoutIcon sx={{ fontSize: 28, color: "#ff455b" }} />
            </div>
            <h3>{accounts.length > 1 ? "Remove Account?" : "Log Out?"}</h3>
            <p>
              {accounts.length > 1
                ? `You are about to remove ${activeAccount}. The app will switch to your next saved account.`
                : "You will be signed out of your session on this device."}
            </p>
            <div className="ios-confirm-buttons">
              <button
                type="button"
                className="ios-confirm-btn danger"
                onClick={handleConfirmLogout}
              >
                {accounts.length > 1 ? "Remove Account" : "Log Out"}
              </button>
              <button
                type="button"
                className="ios-confirm-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
