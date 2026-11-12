"use client";

import dynamic from "next/dynamic";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const DateTimePicker = dynamic(
  () =>
    import("@mui/x-date-pickers/DateTimePicker").then(
      (mod) => mod.DateTimePicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "56px",
          width: "100%",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    ),
  },
);
import LiquidTextField from "@/components/LiquidTextField";
import PrimaryButton from "@/components/PrimaryButton";
import TypeToggleButton from "@/components/TypeToggleButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import GlowingBubbles from "@/components/GlowingBubbles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import constant from "@/constant";
import { decodeToken } from "@/libs/jwt";
import { toast } from "react-toastify";
import { useLoader } from "@/app/context/LoaderContext";
import dayjs from "dayjs";
import { clearRangeDataCache, fetchDeduplicated } from "@/libs/dataCache";
import { enqueueOfflineTransaction } from "@/libs/offlineSync";
import { animatePillToInput, cleanupFlyingPills } from "@/libs/animatePill";

export default function Home() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const isMobile = useMediaQuery("(max-width:520px)", { noSsr: true });
  const isShortMobile = useMediaQuery(
    "(max-width:520px) and (max-height:700px)",
    { noSsr: true },
  );
  const [dateValue, setDateValue] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [TimeStamp, setTimeStamp] = useState(dayjs().valueOf());
  const [submittingCount, setSubmittingCount] = useState(0);
  const isSubmitting = submittingCount > 0;
  const topicInputRef = useRef(null);

  const [selectedDateError, setSelectedDateError] = useState("");
  const [topicError, setTopicError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [typeError, setTypeError] = useState("");

  const handleChange = (event) => {
    setType(event.target.value);
    setTypeError("");
  };

  const handleToggleType = () => {
    setType((prev) => (prev === "Income" ? "Expense" : "Income"));
    setTypeError("");
  };

  const handleDateChange = (date) => {
    if (!date || !date.isValid()) {
      setDateValue(null);
      setSelectedDate("");
      setTimeStamp("");
      setSelectedDateError("Please Select Date");
      return;
    }
    setDateValue(date);
    var year = date?.$y;
    var month = date?.$M + 1 >= 10 ? date?.$M + 1 : `0${date?.$M + 1}`;
    var dates = date?.$D >= 10 ? date?.$D : `0${date?.$D}`;
    setSelectedDate(`${year}-${month}-${dates}`);

    setTimeStamp(date.valueOf());
    setSelectedDateError();
  };

  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(false);
  const suggestionRowRef = useRef(null);
  const hasFetchedTitles = useRef(false);

  const displayedSuggestions = useMemo(() => {
    if (!titleSuggestions || titleSuggestions.length === 0) return [];
    const topicTrimmed = (topic || "").trim().toLowerCase();
    if (!topicTrimmed) {
      return [...titleSuggestions];
    }

    const isExactMatch = titleSuggestions.some(
      (s) => (s || "").trim().toLowerCase() === topicTrimmed,
    );
    let displayed = isExactMatch
      ? [...titleSuggestions]
      : titleSuggestions.filter((s) =>
          (s || "").trim().toLowerCase().includes(topicTrimmed),
        );

    const exactMatchItem = displayed.find(
      (s) => (s || "").trim().toLowerCase() === topicTrimmed,
    );
    if (exactMatchItem) {
      displayed = [
        exactMatchItem,
        ...displayed.filter((s) => s !== exactMatchItem),
      ];
    }
    return displayed;
  }, [topic, titleSuggestions]);

  const fetchTitles = async (tokenOverride) => {
    try {
      const activeToken = tokenOverride || window.localStorage.getItem("token");
      if (!activeToken) {
        hideLoader();
        router.push("/");
        return;
      }

      let newstartdate = new Date(
        dayjs().subtract(2, "month").date(1).startOf("day"),
      );
      let startTimeStamp = newstartdate.getTime();
      let newenddate = new Date(dayjs().endOf("day"));
      let endTimeStamp = newenddate.getTime();

      let params = {
        From: startTimeStamp.toString(),
        To: endTimeStamp.toString(),
      };

      const dedupeKey = `titles_${activeToken.slice(-10)}_${startTimeStamp}_${endTimeStamp}`;

      const resData = await fetchDeduplicated(dedupeKey, async () => {
        let res = await fetch(`${constant?.Live_url}/api/getDateRange`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            authorization: activeToken,
          },
          body: JSON.stringify(params),
        });

        if (res.status === 401 || res.status === 403) {
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("roles");
          window.localStorage.removeItem("activeAccount");
          window.localStorage.setItem("accounts", JSON.stringify([]));
          toast.error("Session expired. Please log in again.");
          router.push("/");
          hideLoader();
          return null;
        }

        if (!res.ok) {
          return null;
        }

        return await res.json();
      });

      if (!resData) return;

      if (resData?.message === "UnAuthorized") {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("roles");
        window.localStorage.removeItem("activeAccount");
        window.localStorage.setItem("accounts", JSON.stringify([]));
        toast.error("Session expired. Please log in again.");
        router.push("/");
        hideLoader();
        return;
      }

      let data = resData.topics;

      if (data && data?.length > 0) {
        let items = data.map((item) => {
          return item.Title;
        });
        const frequency = items.reduce((acc, item) => {
          if (!item) return acc;
          const key = item.trim().toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        // Sort by frequency (descending) and extract only the top 80 names
        const topNames = Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 80)
          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

        setTitleSuggestions(topNames);
        window.localStorage.setItem(
          "titleSuggestions",
          JSON.stringify(topNames),
        );
      } else {
        setTitleSuggestions([]);
        window.localStorage.removeItem("titleSuggestions");
      }
    } catch (error) {
      console.log("err", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const storedSuggestions = window.localStorage.getItem("titleSuggestions");
    if (storedSuggestions) {
      try {
        setTitleSuggestions(JSON.parse(storedSuggestions));
      } catch (e) {
        console.error("Error parsing stored suggestions", e);
      }
    }
    if (!hasFetchedTitles.current) {
      hasFetchedTitles.current = true;
      fetchTitles();
    }
  }, [router]);

  useEffect(() => {
    return () => {
      cleanupFlyingPills();
    };
  }, []);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(16px) saturate(150%)",
      WebkitBackdropFilter: "blur(16px) saturate(150%)",
      boxShadow:
        "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
      borderRadius: { xs: "12px", sm: "14px" },
      fontSize: { xs: "16px", sm: "20px" },
      minHeight: { xs: "48px", sm: "66px" },
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "rgba(212, 160, 23, 0.35)",
        borderWidth: "1.5px",
      },
      "&:hover fieldset": {
        borderColor: "rgba(212, 160, 23, 0.35)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        boxShadow:
          "inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 20px rgba(212, 160, 23, 0.2)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(212, 160, 23, 0.6)",
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputBase-input": {
      color: "#ffffff",
      padding: { xs: "11px 13px", sm: "18px 20px" },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#8c8c8c",
      opacity: 1,
    },
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
      {
        WebkitAppearance: "none",
        margin: 0,
      },
    "& .clear-field-button": {
      color: "#8c8c8c",
      marginRight: { xs: "-4px", sm: "2px" },
      "&:hover": {
        color: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
      },
    },
  };

  const clearButton = (label, onClear) => (
    <InputAdornment position="end">
      <IconButton
        className="clear-field-button"
        type="button"
        size="small"
        aria-label={`Clear ${label}`}
        title={`Clear ${label}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClear}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </InputAdornment>
  );

  const selectSx = {
    color: type == "Expense" ? "#ff3b3f" : "#2fd06f",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px) saturate(150%)",
    WebkitBackdropFilter: "blur(16px) saturate(150%)",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
    borderRadius: { xs: "12px", sm: "14px" },
    fontSize: { xs: "13px", sm: "20px" },
    fontWeight: 700,
    minHeight: { xs: "48px", sm: "66px" },
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.3s ease",
    "& .MuiSelect-select": {
      cursor: "pointer",
      paddingRight: "14px !important",
      textAlign: "center",
    },
    "& .MuiSelect-icon": {
      display: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor:
        type == "Expense"
          ? "rgba(255, 59, 63, 0.5)"
          : "rgba(47, 208, 111, 0.5)",
      borderWidth: "1.5px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: type == "Expense" ? "#ff575a" : "#45df82",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 20px ${type == "Expense" ? "rgba(255, 59, 63, 0.2)" : "rgba(47, 208, 111, 0.2)"}`,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: type == "Expense" ? "#ff3b3f" : "#2fd06f",
      borderWidth: "1.5px",
    },
    "& .MuiSvgIcon-root": {
      color: type == "Expense" ? "#ff3b3f" : "#2fd06f",
    },
  };

  const restoreFields = (data) => {
    if (!data) return;
    setTopic(data.rawTopic ?? data.Title ?? "");
    setDescription(data.rawDescription ?? data.Description ?? "");
    setAmount(data.rawAmount ?? data.Amount ?? "");
    setType(data.rawType ?? data.Type ?? "Expense");
    if (data.rawDateValue) {
      setDateValue(data.rawDateValue);
    }
    if (data.rawSelectedDate) {
      setSelectedDate(data.rawSelectedDate);
    }
    if (data.rawTimeStamp) {
      setTimeStamp(data.rawTimeStamp);
    }
    setTimeout(() => {
      topicInputRef.current?.focus?.();
    }, 50);
  };

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault?.();
      if (selectedDate == "" || selectedDate == undefined) {
        setSelectedDateError("Please Select Date");
        return;
      }
      if (topic == "" || !topic.trim()) {
        setTopicError("Please Enter Topic");
        return;
      }
      if (amount == "" || amount == 0) {
        setAmountError("Please Enter Amount");
        return;
      }
      if (type == "") {
        setTypeError("Please Select Type");
        return;
      }

      const submittedData = {
        Title: topic.trim(),
        Amount: amount,
        Type: type,
        Description: description ? description.trim() : "",
        Date: selectedDate,
        TimeStamp: TimeStamp,
        rawTopic: topic,
        rawAmount: amount,
        rawDescription: description,
        rawType: type,
        rawDateValue: dateValue,
        rawSelectedDate: selectedDate,
        rawTimeStamp: TimeStamp,
      };

      const payload = {
        Title: submittedData.Title,
        Amount: submittedData.Amount,
        Type: submittedData.Type,
        Description: submittedData.Description,
        Date: submittedData.Date,
        TimeStamp: submittedData.TimeStamp,
      };

      const activeToken = window.localStorage.getItem("token") || "";
      const activeEmail =
        window.localStorage.getItem("activeAccount") ||
        currentUser?.email ||
        "";

      // Immediately clear inputs so the user can enter next data while this request is adding
      setDateValue(dayjs());
      setSelectedDate(dayjs().format("YYYY-MM-DD"));
      setTimeStamp(dayjs().valueOf());
      setTopic("");
      setDescription("");
      setAmount("");
      setType("Expense");
      setSelectedDateError("");
      setTopicError("");
      setDescriptionError("");
      setAmountError("");
      setTypeError("");
      setIsSuggestionsExpanded(false);

      // Re-focus topic input so the user can seamlessly type next data immediately
      // setTimeout(() => {
      //   topicInputRef.current?.focus?.();
      // }, 50);

      // Increment submitting count to show loader on the submit button (not full screen)
      setSubmittingCount((prev) => prev + 1);

      // If currently offline, queue immediately without waiting on network timeout
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const queued = enqueueOfflineTransaction(payload, {
          email: activeEmail,
          token: activeToken,
        });
        if (queued) {
          toast.info(
            `Saved offline for ${activeEmail}. Will auto-sync when online 📶`,
          );
        } else {
          restoreFields(submittedData);
          toast.error("Failed to save data. Previous inputs restored.");
        }
        setSubmittingCount((prev) => Math.max(0, prev - 1));
        return;
      }

      // Online submission (runs in background without blocking UI or showing full-screen loader)
      try {
        const res = await fetch(`${constant?.Live_url}/api/incomes`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            authorization: activeToken,
          },
          body: JSON.stringify(payload),
        });

        if (res?.ok) {
          toast.success("Created Successfully");
          clearRangeDataCache();
        } else {
          restoreFields(submittedData);
          let errMsg = "Failed to create data. Previous inputs restored.";
          try {
            const errJson = await res.json();
            if (errJson?.message) {
              errMsg = `${errJson.message}. Previous inputs restored.`;
            }
          } catch (_) {}
          toast.error(errMsg);
        }
      } catch (fetchErr) {
        console.error("Data creation error:", fetchErr);
        // Fallback to offline queue if network disconnected
        const queued = enqueueOfflineTransaction(payload, {
          email: activeEmail,
          token: activeToken,
        });
        if (queued) {
          toast.info(
            `Saved offline for ${activeEmail}. Will auto-sync when online 📶`,
          );
        } else {
          restoreFields(submittedData);
          toast.error("Failed to create data. Previous inputs restored.");
        }
      } finally {
        setSubmittingCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
    }
  };

  const [role, setRole] = useState();
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    router.prefetch("/viewDetails");
    router.prefetch("/settings");
    if (role === "admin") {
      router.prefetch("/authorize");
    }
  }, [router, role]);

  const loadAccounts = () => {
    try {
      var token = window.localStorage.getItem("token");
      var activeEmail = window.localStorage.getItem("activeAccount");
      var list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
      setAccounts(list);
      setRole(window.localStorage.getItem("roles"));
      var active =
        list.find((a) => a.email == activeEmail) ||
        list.find((a) => a.token == token) ||
        list[0];
      if (active) {
        setCurrentUser(active);
        if (active.email != activeEmail) {
          window.localStorage.setItem("activeAccount", active.email);
        }
      } else if (token) {
        var decoded = decodeToken(token);
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
  };

  const switchAccount = (account) => {
    clearRangeDataCache();
    window.localStorage.setItem("token", account.token);
    window.localStorage.setItem("roles", account.role);
    window.localStorage.setItem("activeAccount", account.email);
    setCurrentUser(account);
    setRole(account.role);
    setShowAccountMenu(false);

    // Reset form fields
    setTopic("");
    setDescription("");
    setAmount("");
    setType("Expense");
    setSelectedDateError("");
    setTopicError("");
    setDescriptionError("");
    setAmountError("");
    setTypeError("");
    setIsSuggestionsExpanded(false);

    // Fetch suggestions for the newly switched account
    fetchTitles(account.token);

    toast.success(`Switched to ${account.email}`);
  };

  const logoutAccount = () => {
    var activeEmail = window.localStorage.getItem("activeAccount");
    var list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    if (list.length > 1) {
      var remaining = list.filter((a) => a.email != activeEmail);
      window.localStorage.setItem("accounts", JSON.stringify(remaining));
      setAccounts(remaining);
      var next = remaining[0];
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

  const removeAccount = (accountToRemove, e) => {
    e?.stopPropagation();
    try {
      var activeEmail = window.localStorage.getItem("activeAccount");
      var list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
      var remaining = list.filter((a) => a.email !== accountToRemove.email);
      window.localStorage.setItem("accounts", JSON.stringify(remaining));
      setAccounts(remaining);
      toast.success(`Removed ${accountToRemove.email}`);

      if (activeEmail === accountToRemove.email) {
        if (remaining.length > 0) {
          var next = remaining[0];
          switchAccount(next);
        } else {
          window.localStorage.setItem("accounts", JSON.stringify([]));
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("roles");
          window.localStorage.removeItem("activeAccount");
          router.push("/");
        }
      }
    } catch (error) {
      console.log("🚀 ~ removeAccount ~ error:", error);
    }
  };

  const addAccount = () => {
    router.push("/?add=1");
  };

  useEffect(() => {
    if (showAccountMenu && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAccountMenu, isMobile]);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          setIsKeyboardOpen(false);
        }
      }, 150);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isShrunk =
          window.innerHeight - window.visualViewport.height > 150;
        setIsKeyboardOpen(isShrunk);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize,
        );
      }
    };
  }, []);

  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);
  const wasAtBottomOnStart = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;

    const handleTouchStart = (e) => {
      // Never trigger while keyboard is open or user is focusing an input
      const activeTag = document.activeElement?.tagName;
      const isInputFocused = activeTag === "INPUT" || activeTag === "TEXTAREA";
      if (isKeyboardOpen || isInputFocused) {
        wasAtBottomOnStart.current = false;
        return;
      }

      touchStartY.current = e.touches[0].clientY;
      touchDeltaY.current = 0;

      // User must ALREADY be resting at the bottom of the page before this swipe begins
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      wasAtBottomOnStart.current = scrollBottom >= documentHeight - 30;
    };

    const handleTouchMove = (e) => {
      if (!wasAtBottomOnStart.current) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY; // positive when swiping up
      touchDeltaY.current = deltaY;
    };

    const handleTouchEnd = () => {
      const activeTag = document.activeElement?.tagName;
      const isInputFocused = activeTag === "INPUT" || activeTag === "TEXTAREA";

      // Requires: was already at bottom on touchstart + not in keyboard mode + pull-up distance > 55px
      if (
        wasAtBottomOnStart.current &&
        !isKeyboardOpen &&
        !isInputFocused &&
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
  }, [isMobile, accounts.length, isKeyboardOpen]);

  useEffect(() => {
    loadAccounts();
    var handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setShowAccountMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <div className="create-detail-page">
        <GlowingBubbles />
        <main
          className={`expense-shell ${isKeyboardOpen ? "keyboard-open" : ""}`}
        >
          <header className="expense-header">
            <div className="expense-title-wrap">
              <span className="expense-title-icon">
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
              <h1>Expenses</h1>
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
                  {/* Desktop Menu - Preserved for non-mobile */}
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
                            <span className="account-menu-name">
                              {acc.name}
                            </span>
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

          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Date<span>*</span>
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={dateValue}
                  onChange={(e) => {
                    handleDateChange(e);
                  }}
                  format={
                    isMobile ? "DD MMM hh:mm A" : "dddd (DD MMMM YYYY hh:mm A)"
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Today",
                      sx: inputSx,
                    },
                  }}
                />
              </LocalizationProvider>
              {selectedDateError ? (
                <div className="field-error">{selectedDateError}</div>
              ) : (
                <></>
              )}
            </div>

            <div className="form-group">
              <label>
                Title<span>*</span>
              </label>
              <LiquidTextField
                inputRef={topicInputRef}
                value={topic}
                placeholder="Title"
                variant="outlined"
                onChange={(e) => {
                  setTopic(e.target.value);
                  setTopicError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: topic
                    ? clearButton("title", () => {
                        setTopic("");
                        setTopicError("");
                      })
                    : null,
                }}
              />
              {displayedSuggestions.length > 0 && (
                <div
                  className="suggestion-row-wrapper"
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <div
                    ref={suggestionRowRef}
                    className={`suggestion-row ${isSuggestionsExpanded ? "expanded" : ""}`}
                    aria-label="Title suggestions"
                  >
                    {displayedSuggestions.map((item) => {
                      const isActive =
                        (item || "").trim().toLowerCase() ===
                        (topic || "").trim().toLowerCase();
                      return (
                        <button
                          type="button"
                          className={`suggestion-chip ${isActive ? "active" : ""}`}
                          key={item}
                          onClick={(e) => {
                            if (suggestionRowRef.current) {
                              suggestionRowRef.current.scrollTo({
                                left: 0,
                                behavior: "smooth",
                              });
                            }
                            animatePillToInput({
                              sourceEl: e.currentTarget,
                              targetInputEl: topicInputRef.current,
                              text: item,
                              onComplete: () => {
                                setTopic(item);
                                setTopicError("");
                              },
                            });
                          }}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                  {displayedSuggestions.length > 0 && (
                    <IconButton
                      onClick={() =>
                        setIsSuggestionsExpanded(!isSuggestionsExpanded)
                      }
                      aria-label={
                        isSuggestionsExpanded
                          ? "Show less suggestions"
                          : "Show more suggestions"
                      }
                      sx={{
                        flexShrink: 0,
                        color: "#d4a017",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(212, 160, 23, 0.3)",

                        padding: "8px",
                        "&:hover": {
                          backgroundColor: "rgba(212, 160, 23, 0.1)",
                          borderColor: "rgba(212, 160, 23, 0.5)",
                        },
                      }}
                    >
                      {isSuggestionsExpanded ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  )}
                </div>
              )}
              {topicError ? (
                <div className="field-error">{topicError}</div>
              ) : (
                <></>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <LiquidTextField
                value={description}
                placeholder="Description"
                variant="outlined"
                multiline
                minRows={isShortMobile ? 2 : isMobile ? 3 : 4}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDescriptionError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: description
                    ? clearButton("description", () => {
                        setDescription("");
                        setDescriptionError("");
                      })
                    : null,
                }}
              />
              {descriptionError ? (
                <div className="field-error">{descriptionError}</div>
              ) : (
                <></>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Amount<span>*</span>
                </label>
                <LiquidTextField
                  value={amount}
                  type="number"
                  placeholder="Amount"
                  variant="outlined"
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  fullWidth
                  InputProps={{
                    endAdornment: amount
                      ? clearButton("amount", () => {
                          setAmount("");
                          setAmountError("");
                        })
                      : null,
                  }}
                />
                {amountError ? (
                  <div className="field-error">{amountError}</div>
                ) : (
                  <></>
                )}
              </div>

              <div className="form-group">
                <label>
                  Type<span>*</span>
                </label>
                <TypeToggleButton
                  id="type-select"
                  value={type}
                  onToggle={handleToggleType}
                />
                {typeError ? (
                  <div className="field-error">{typeError}</div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <PrimaryButton
              type="submit"
              className={`add-data-btn ${isSubmitting ? "is-submitting" : ""}`}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="submit-btn-loader" aria-label="Adding...">
                  <span className="submit-btn-spinner" />
                </span>
              ) : (
                "Add Data"
              )}
            </PrimaryButton>

            {/* {isMobile && accounts.length > 1 && (
              <div
                className="swipe-up-switch-hint"
                onClick={() => setShowAccountMenu(true)}
                role="button"
                tabIndex={0}
              >
                <KeyboardArrowUpIcon
                  className="swipe-up-hint-arrow"
                  fontSize="small"
                />
                <span>Swipe up to switch account</span>
              </div>
            )} */}
          </form>
        </main>
      </div>
    </>
  );
}
