"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import dynamic from "next/dynamic";
import GlowingBubbles from "@/components/GlowingBubbles";
import {
  getCachedRangeData,
  setCachedRangeData,
  clearRangeDataCache,
} from "@/libs/dataCache";
import { decodeToken } from "@/libs/jwt";
import { toast } from "react-toastify";
import colors from "@/colors";

const Pie = dynamic(
  () => import("../../components/Charts").then((mod) => mod.Pie),
  { ssr: false },
);
const Bar = dynamic(
  () => import("../../components/Charts").then((mod) => mod.Bar),
  { ssr: false },
);
const Line = dynamic(
  () => import("../../components/Charts").then((mod) => mod.Line),
  { ssr: false },
);

export default function Analytics() {
  const router = useRouter();
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Multi-account states
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);

  const isMobile = useMediaQuery("(max-width:520px)", { noSsr: true });
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);
  const wasAtBottomOnStart = useRef(false);

  useEffect(() => {
    const token = window?.localStorage?.getItem("token");
    if (!token) {
      router.push("/");
    }
    setRole(window?.localStorage?.getItem("roles"));
  }, [router]);

  const loadAccounts = useCallback(() => {
    try {
      const stored = window.localStorage.getItem("accounts");
      const list = stored ? JSON.parse(stored) : [];
      setAccounts(list);

      const activeEmail = window.localStorage.getItem("activeAccount");
      const token = window.localStorage.getItem("token");

      const active =
        list.find((a) => a.email == activeEmail) ||
        list.find((a) => a.token == token) ||
        list[0];
      if (active) {
        setCurrentUser(active);
        if (active.email != activeEmail) {
          window.localStorage.setItem("activeAccount", active.email);
        }
      } else if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          setCurrentUser({
            email: decoded.email,
            name: decoded.name,
            token: token,
            role: decoded.role,
          });
        }
      }
    } catch (error) {
      console.log("🚀 ~ loadAccounts ~ error:", error);
    }
  }, []);

  const getData = useCallback(
    async (overrideToken = null) => {
      try {
        setLoading(true);
        let queryFrom = null;
        let queryTo = null;

        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          queryFrom = searchParams.get("from");
          queryTo = searchParams.get("to");
        }

        const fromTimestamp = queryFrom
          ? dayjs(queryFrom).startOf("day").valueOf()
          : dayjs().startOf("month").valueOf();
        const toTimestamp = queryTo
          ? dayjs(queryTo).endOf("day").valueOf()
          : dayjs().endOf("month").valueOf();

        const body = {
          From: fromTimestamp,
          To: toTimestamp,
        };

        const token =
          overrideToken || window?.localStorage?.getItem("token") || "";
        const cacheKey = `${fromTimestamp}_${toTimestamp}__self_${token}`;

        // Stale-While-Revalidate: Instant render from cache, zero skeletons
        const cached = getCachedRangeData(cacheKey);
        if (cached) {
          setDatas(cached.topics || []);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const res = await fetch(`/api/getDateRange`, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-type": "application/json",
            authorization: token,
          },
          body: JSON.stringify(body),
        });

        if (res.status === 400 || res.status === 401) {
          router.push("/");
          return;
        }

        if (!res.ok) {
          return;
        }

        const response = await res.json();
        const freshTopics = response?.topics || [];
        setDatas(freshTopics);
        setCachedRangeData(cacheKey, {
          topics: freshTopics,
          totalCount: response?.totalCount?.[0] || null,
        });
      } catch (error) {
        console.log("Error loading topics: ", error);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const switchAccount = (account) => {
    clearRangeDataCache();
    window.localStorage.setItem("token", account.token);
    window.localStorage.setItem("roles", account.role);
    window.localStorage.setItem("activeAccount", account.email);
    setCurrentUser(account);
    setRole(account.role);
    setShowAccountMenu(false);
    toast.success(`Switched to ${account.name || account.email}`);
    getData(account.token);
  };

  const removeAccount = (account, e) => {
    e.stopPropagation();
    const list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    const remaining = list.filter((a) => a.email != account.email);
    window.localStorage.setItem("accounts", JSON.stringify(remaining));
    setAccounts(remaining);
    if (account.email == currentUser?.email) {
      if (remaining.length > 0) {
        switchAccount(remaining[0]);
      } else {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("roles");
        window.localStorage.removeItem("activeAccount");
        router.push("/");
      }
    } else {
      toast.success(`Removed ${account.email}`);
    }
  };

  const addAccount = () => {
    router.push("/?add=1");
  };

  const logoutAccount = () => {
    const activeEmail = window.localStorage.getItem("activeAccount");
    const list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    if (list.length > 1) {
      const remaining = list.filter((a) => a.email != activeEmail);
      window.localStorage.setItem("accounts", JSON.stringify(remaining));
      setAccounts(remaining);
      const next = remaining[0];
      switchAccount(next);
      toast.info(`Removed account. Switched to ${next.email}`);
    } else {
      window.localStorage.setItem("accounts", JSON.stringify([]));
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("roles");
      window.localStorage.removeItem("activeAccount");
      router.push("/");
    }
  };

  useEffect(() => {
    loadAccounts();
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [loadAccounts]);

  // Mobile swipe to open account switcher
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e) => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const isAtTop = scrollY <= 5;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = windowHeight + scrollY >= docHeight - 15;

      wasAtBottomOnStart.current = isAtBottom;
      if (isAtTop || isAtBottom) {
        touchStartY.current = e.touches[0].clientY;
      } else {
        touchStartY.current = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (!touchStartY.current) return;
      touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
    };

    const handleTouchEnd = () => {
      if (
        wasAtBottomOnStart.current &&
        touchDeltaY.current > 55 &&
        accounts.length > 1
      ) {
        setShowAccountMenu(true);
      }
      touchStartY.current = 0;
      touchDeltaY.current = 0;
      wasAtBottomOnStart.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, accounts.length]);

  useEffect(() => {
    getData();
  }, [getData]);

  // Compute metrics
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  const normalizeTitle = (title) => {
    let t = (title || "Other").trim();
    if (!t) return "Other";
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  };

  datas.forEach((item) => {
    const amt = Number(item.Amount) || 0;
    if (item.Type === "Income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      const title = normalizeTitle(item.Title);
      categoryTotals[title] = (categoryTotals[title] || 0) + amt;
    }
  });

  const pieOptions = {
    plugins: {
      legend: { display: false },
    },
  };

  const pieColors = colors.chart.pie;

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categoryTotals),
        backgroundColor: pieColors.slice(0, Object.keys(categoryTotals).length),
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [totalIncome, totalExpense],
        backgroundColor: [colors.semantic.income, colors.semantic.expenseChart],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { color: colors.text.secondary },
        grid: { color: colors.border.divider },
      },
      x: {
        ticks: { color: colors.text.secondary },
        grid: { display: false },
      },
    },
  };

  // Compute Daily Spend Trend
  const dailySpends = {};
  datas.forEach((item) => {
    if (item.Type === "Expense") {
      const dateKey = dayjs(item.TimeStamp).format("MMM DD");
      const amt = Number(item.Amount) || 0;
      dailySpends[dateKey] = (dailySpends[dateKey] || 0) + amt;
    }
  });

  const sortedDailyKeys = Object.keys(dailySpends).sort(
    (a, b) => dayjs(a, "MMM DD").valueOf() - dayjs(b, "MMM DD").valueOf(),
  );

  const lineData = {
    labels: sortedDailyKeys,
    datasets: [
      {
        label: "Daily Spend (₹)",
        data: sortedDailyKeys.map((k) => dailySpends[k]),
        borderColor: colors.semantic.expenseChart,
        backgroundColor: colors.chart.expense.background,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: colors.semantic.expenseChart,
        tension: 0.3,
      },
    ],
  };

  // Compute Daily Average Spend
  let daysDiff = 1;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const queryFrom = searchParams.get("from");
    const queryTo = searchParams.get("to");
    const dFrom = queryFrom ? dayjs(queryFrom) : dayjs().startOf("month");
    const dTo = queryTo ? dayjs(queryTo) : dayjs().endOf("month");
    daysDiff = Math.max(1, dTo.diff(dFrom, "day") + 1);
  }
  const dailyAvg = totalExpense / daysDiff;

  const glassStyle = {
    padding: "20px",
    boxSizing: "border-box",
    width: "100%",
    background:
      colors.background.surfaceGlass /* Slightly lighter base so it stands out from pitch black */,
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    border: `1px solid ${colors.border.divider}`,
    borderTop: `1px solid ${colors.border.dividerBright}`,
    borderLeft: `1px solid ${colors.border.glass}`,
    borderRadius: "16px",
    boxShadow: `0 8px 32px 0 ${colors.background.overlay}`,
  };

  return (
    <div className="create-detail-page">
      <GlowingBubbles />
      <main className="history-shell">
        <header
          className="history-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "24px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              flexDirection: "row",
              alignItems: "center",
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
              }}
              aria-label="Go back"
            >
              <ArrowBackIcon />
            </button>
            <div className="history-title-wrap">
              <span className="history-title-icon">
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
              <h1>Analytics</h1>
            </div>
          </div>

          <div className="account-wrapper" ref={accountRef}>
            <button
              type="button"
              className={`account-pill ${showAccountMenu ? "active" : ""}`}
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <div className="account-avatar">
                {currentUser?.name?.substring(0, 1).toUpperCase() || "AK"}
              </div>
              <span>{currentUser?.name || "Account"}</span>
              {showAccountMenu ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </button>

            {showAccountMenu && accounts.length > 0 && (
              <>
                {/* Desktop Menu */}
                <div className="account-menu desktop-account-menu">
                  {accounts.map((acc) => {
                    const isActive = acc.email == currentUser?.email;
                    return (
                      <button
                        key={acc.email}
                        className={`account-menu-item ${isActive ? "active" : ""}`}
                        type="button"
                        onClick={() => {
                          if (!isActive) switchAccount(acc);
                        }}
                      >
                        <div className="account-menu-avatar">
                          {acc.name?.substring(0, 1).toUpperCase() || "AK"}
                        </div>
                        <div className="account-menu-info">
                          <span className="account-menu-name">{acc.name}</span>
                          <span className="account-menu-email">
                            {acc.accountType || "Personal Account"}
                          </span>
                        </div>
                        {isActive && (
                          <CheckCircleIcon
                            className="account-menu-check"
                            fontSize="small"
                          />
                        )}
                      </button>
                    );
                  })}
                  <div className="account-menu-divider" />
                  <button
                    className="account-menu-action"
                    type="button"
                    onClick={addAccount}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>Add Account</span>
                  </button>

                  <button
                    className="account-menu-action"
                    type="button"
                    onClick={logoutAccount}
                  >
                    <LogoutOutlinedIcon fontSize="small" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Mobile Bottom Sheet Modal */}
                <div className="mobile-account-container">
                  <div
                    className="mobile-account-backdrop"
                    onClick={() => setShowAccountMenu(false)}
                  />
                  <div
                    className="mobile-account-sheet"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Switch Account"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="sheet-handle"
                      onClick={() => setShowAccountMenu(false)}
                    />
                    <h2 className="sheet-title">Switch Account</h2>
                    <div className="sheet-account-list">
                      {accounts.map((acc) => {
                        const isActive = acc.email === currentUser?.email;
                        return (
                          <div
                            key={acc.email}
                            className={`sheet-account-item ${isActive ? "active" : ""}`}
                            onClick={() => {
                              if (!isActive) switchAccount(acc);
                              else setShowAccountMenu(false);
                            }}
                          >
                            <span className="sheet-account-email">
                              {acc.email}
                            </span>
                            {isActive ? (
                              <div
                                className="sheet-account-check"
                                aria-label="Active Account"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#ffffff"
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="sheet-account-remove"
                                aria-label={`Remove ${acc.email}`}
                                onClick={(e) => removeAccount(acc, e)}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#ff3b30"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="sheet-add-account-btn"
                      onClick={() => {
                        setShowAccountMenu(false);
                        addAccount();
                      }}
                    >
                      Add Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              className="history-skeleton-card"
              style={{ height: "110px", borderRadius: "16px" }}
            />
            <div
              className="history-skeleton-card"
              style={{ height: "300px", borderRadius: "16px" }}
            />
            <div
              className="history-skeleton-card"
              style={{ height: "300px", borderRadius: "16px" }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              paddingBottom: "40px",
            }}
          >
            <div
              className="analytics-card"
              style={{
                ...glassStyle,
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: "auto",
                gap: "20px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                Overview
              </h2>
              <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: colors.text.secondary,
                      margin: "0 0 4px",
                    }}
                  >
                    Total Income
                  </p>
                  <strong style={{ fontSize: "22px", color: colors.semantic.income }}>
                    ₹{totalIncome.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: colors.text.secondary,
                      margin: "0 0 4px",
                    }}
                  >
                    Total Expense
                  </p>
                  <strong style={{ fontSize: "22px", color: colors.semantic.expenseChart }}>
                    ₹{totalExpense.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  paddingTop: "16px",
                  borderTop: `1px solid ${colors.border.dividerBright}`,
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: colors.text.secondary,
                    margin: "0 0 4px",
                  }}
                >
                  Daily Average Spend
                </p>
                <strong
                  style={{ fontSize: "18px", color: colors.text.primary }}
                >
                  ₹
                  {dailyAvg.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  <span
                    style={{
                      fontSize: "14px",
                      color: colors.text.placeholder,
                      fontWeight: "normal",
                    }}
                  >
                    / day
                  </span>
                </strong>
              </div>
            </div>

            <div
              className="analytics-card"
              style={{
                ...glassStyle,
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: "300px",
                cursor: "default",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  margin: "0 0 20px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Expense Breakdown
              </h2>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "30px",
                }}
              >
                {Object.keys(categoryTotals).length > 0 ? (
                  <>
                    <div style={{ width: "100%", maxWidth: "240px" }}>
                      <Pie data={pieData} options={pieOptions} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "12px 20px",
                        width: "100%",
                      }}
                    >
                      {Object.keys(categoryTotals).map((key, i) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedCategory(key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.8)",
                            background: "rgba(255,255,255,0.05)",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "16px",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "12px",
                              height: "12px",
                              borderRadius: "3px",
                              background: pieColors[i % pieColors.length],
                            }}
                          ></span>
                          {key} (₹{categoryTotals[key].toLocaleString("en-IN")})
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ color: "rgba(255,255,255,0.5)" }}>
                    No expenses recorded this month.
                  </p>
                )}
              </div>
            </div>

            <div
              className="analytics-card"
              style={{
                ...glassStyle,
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: "300px",
                cursor: "default",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  margin: "0 0 20px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Cash Flow
              </h2>
              <div style={{ width: "100%", flex: 1, minHeight: "200px" }}>
                <Bar
                  data={barData}
                  options={{ ...chartOptions, maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div
              className="analytics-card"
              style={{
                ...glassStyle,
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: "300px",
                cursor: "default",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  margin: "0 0 20px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Daily Spend Trend
              </h2>
              <div style={{ width: "100%", flex: 1, minHeight: "200px" }}>
                {sortedDailyKeys.length > 0 ? (
                  <Line
                    data={lineData}
                    options={{ ...chartOptions, maintainAspectRatio: false }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.5)" }}>
                      No expenses recorded to trend.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedCategory && (
          <div
            className="record-detail-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCategory} details`}
            onClick={() => setSelectedCategory(null)}
            style={{ zIndex: 100000 }}
          >
            <section
              className="record-detail-sheet"
              onClick={(event) => event.stopPropagation()}
              style={{
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: colors.background.base,
                backgroundColor: colors.background.base,
              }}
            >
              <div className="record-detail-head" style={{ flexShrink: 0 }}>
                <div>
                  <h2>{selectedCategory}</h2>
                  <span>
                    ₹{categoryTotals[selectedCategory]?.toLocaleString("en-IN")}{" "}
                    Total
                  </span>
                </div>
                <button type="button" onClick={() => setSelectedCategory(null)}>
                  Close
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  marginTop: "16px",
                  paddingBottom: "30px",
                  paddingRight: "4px",
                }}
              >
                {datas
                  .filter(
                    (item) =>
                      item.Type === "Expense" &&
                      normalizeTitle(item.Title) === selectedCategory,
                  )
                  .map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: `1px solid ${colors.border.divider}`,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontSize: "15px",
                            color: colors.text.primary,
                          }}
                        >
                          {dayjs(item.TimeStamp).format("DD MMM YYYY, hh:mm A")}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: colors.text.placeholder,
                            marginTop: "2px",
                          }}
                        >
                          {item.Description || "No description"}
                        </span>
                      </div>
                      <strong style={{ fontSize: "15px", color: colors.semantic.expenseChart }}>
                        ₹{Number(item.Amount || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
