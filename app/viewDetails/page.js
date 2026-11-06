"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const FilterBottomSheet = dynamic(
  () => import("@/components/FilterBottomSheet"),
  { ssr: false }
);
import SearchIcon from "@mui/icons-material/Search";
import LiquidTextField from "@/components/LiquidTextField";
import PieChartIcon from "@mui/icons-material/PieChart";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import constant from "@/constant";
import { useLoader } from "@/app/context/LoaderContext";
import PrimaryButton from "@/components/PrimaryButton";
import GlowingBubbles from "@/components/GlowingBubbles";
import {
  getCachedRangeData,
  setCachedRangeData,
  clearRangeDataCache,
  fetchDeduplicated,
} from "@/libs/dataCache";

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const displayValueRef = useRef(0);

  useEffect(() => {
    let startTime;
    const duration = 500; // 1.2s animation
    const startValue = displayValueRef.current;
    const endValue = Number(value) || 0;

    if (startValue === endValue) return;

    let animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function: easeOutQuart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentVal = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(currentVal);
      displayValueRef.current = currentVal;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        displayValueRef.current = endValue;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return Number(displayValue).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Page() {
  const router = useRouter();
  const [datas, setDatas] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [from, setFrom] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

  // History filtering states: Month-wise vs Custom Date Range
  const [filterMode, setFilterMode] = useState("month"); // 'month' | 'range'
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const monthDropdownRef = useRef(null);

  // Compute current month and past 5 months (total 6 months)
  const recentMonths = useMemo(() => {
    const list = [];
    const now = dayjs();
    for (let i = 0; i < 6; i++) {
      const m = now.subtract(i, "month");
      list.push({
        label: m.format("MMMM YYYY"),
        value: m.format("YYYY-MM"),
        isCurrent: i === 0,
        monthIndex: m.month(),
        year: m.year(),
      });
    }
    return list;
  }, []);

  // Staging / draft states for bottom sheet
  const [draftMode, setDraftMode] = useState("month");
  const [draftMonth, setDraftMonth] = useState(dayjs().month()); // 0-11
  const [draftYear, setDraftYear] = useState(dayjs().year());
  const [draftFrom, setDraftFrom] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [draftTo, setDraftTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [rangeError, setRangeError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  const handleOpenSearch = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setShowSearch(true);
    if (headerRef.current) {
      headerRef.current.style.transition =
        "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      headerRef.current.style.transform = "translate3d(0, 0px, 0)";
      headerRef.current.style.pointerEvents = "auto";
      currentTranslateRef.current = 0;
    }
    // Synchronous focus directly inside user-gesture event handler
    // required for iOS Safari / iPhone WebApp to present virtual keyboard
    if (searchInputRef.current) {
      const formEl = searchInputRef.current.closest("form");
      if (formEl) {
        formEl.style.pointerEvents = "auto";
        formEl.style.opacity = "1";
      }
      searchInputRef.current.focus();
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchText("");
    isInteracting.current = true;
    setTimeout(() => {
      isInteracting.current = false;
    }, 800);
    getDetails({ requestRole: role, userId: selectedUser });
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleSearchEvent = (e) => {
      handleOpenSearch(e);
    };
    window.addEventListener("open-history-search", handleSearchEvent);
    return () => {
      window.removeEventListener("open-history-search", handleSearchEvent);
    };
  }, []);
  const [role, setRole] = useState(() =>
    typeof window !== "undefined"
      ? window?.localStorage?.getItem("roles") || ""
      : "",
  );
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [swipedCardId, setSwipedCardId] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [activeDrag, setActiveDrag] = useState({
    cardId: null,
    offset: 0,
    direction: null,
  });
  const [recordToDelete, setRecordToDelete] = useState(null);

  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isSwiping: false,
    cardId: null,
    initialOffset: 0,
  });
  const lastTouchTapTime = useRef(0);

  const handleDelete = async (id) => {
    try {
      showLoader();
      const res = await fetch(
        `${constant?.Live_url || ""}/api/incomes?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            authorization: `${window?.localStorage?.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok && data?.status) {
        toast.success("Deleted successfully");
        clearRangeDataCache();
        setDatas((prev) => prev.filter((item) => item._id !== id));
        getDetails({
          text: searchText,
          requestRole: role,
          userId: selectedUser,
        });
      } else {
        toast.error(data?.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete transaction");
      console.error("handleDelete error:", err);
    } finally {
      setRecordToDelete(null);
      setSwipedCardId(null);
      setSwipeDirection(null);
      setActiveDrag({ cardId: null, offset: 0, direction: null });
      hideLoader();
    }
  };

  const handleCardClick = (row) => {
    // If triggered right after a touch tap on mobile, ignore the duplicate synthetic click
    if (Date.now() - lastTouchTapTime.current < 450) {
      return;
    }
    if (swipedCardId) {
      setSwipedCardId(null);
      setSwipeDirection(null);
      return;
    }
    setExpandedCardId((prev) => (prev === row._id ? null : row._id));
  };

  const handleCardTouchStart = (e, row) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isSwiping: false,
      cardId: row._id,
      initialOffset: 0,
    };
  };

  const handleCardTouchMove = (e, row) => {
    if (!touchState.current || touchState.current.cardId !== row._id) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchState.current.startX;
    const diffY = touch.clientY - touchState.current.startY;

    if (!touchState.current.isSwiping) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          touchState.current.isSwiping = true;
        } else {
          touchState.current.cardId = null;
          return;
        }
      }
    }

    if (touchState.current.isSwiping) {
      // Allow fluid drag up to 96px in either direction
      const clampedOffset = Math.max(-96, Math.min(96, diffX));
      const direction =
        clampedOffset > 5 ? "right" : clampedOffset < -5 ? "left" : null;

      setActiveDrag({
        cardId: row._id,
        offset: clampedOffset,
        direction,
      });
    }
  };

  const handleCardTouchEnd = (e, row) => {
    if (!touchState.current || touchState.current.cardId !== row._id) return;
    const touch = e.changedTouches?.[0] || e.touches?.[0];
    const diffX = touch ? touch.clientX - touchState.current.startX : 0;
    const diffY = touch ? touch.clientY - touchState.current.startY : 0;
    const duration = Date.now() - touchState.current.startTime;

    if (touchState.current.isSwiping) {
      const SWIPE_THRESHOLD = 60; // Auto-trigger threshold

      if (diffX >= SWIPE_THRESHOLD) {
        // Swiped right past threshold -> automatically open Delete confirmation popup
        setRecordToDelete(row);
      } else if (diffX <= -SWIPE_THRESHOLD) {
        // Swiped left past threshold -> automatically trigger Edit
        router.push(`/editDetails/${row._id}`);
      }

      setSwipedCardId(null);
      setSwipeDirection(null);
      lastTouchTapTime.current = Date.now();
    } else {
      const dist = Math.hypot(diffX, diffY);
      if (dist < 12 && duration < 400) {
        lastTouchTapTime.current = Date.now();
        if (swipedCardId) {
          setSwipedCardId(null);
          setSwipeDirection(null);
        } else {
          setExpandedCardId((prev) => (prev === row._id ? null : row._id));
        }
      }
    }

    setActiveDrag({ cardId: null, offset: 0, direction: null });
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isSwiping: false,
      cardId: null,
      initialOffset: 0,
    };
  };

  const handleCardTouchCancel = () => {
    setActiveDrag({ cardId: null, offset: 0, direction: null });
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isSwiping: false,
      cardId: null,
      initialOffset: 0,
    };
  };

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (
        !e.target.closest(".history-card-item") &&
        !e.target.closest(".MuiDialog-root")
      ) {
        setSwipedCardId(null);
        setSwipeDirection(null);
        setActiveDrag({ cardId: null, offset: 0, direction: null });
      }
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
  }, []);
  const [loading, setLoading] = useState(false);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
  const headerRef = useRef(null);
  const currentTranslateRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const isInteracting = useRef(false);

  // Pull-to-refresh state
  const pullStartY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const formatIndianNumber = (num) => {
    const value = Number(num || 0);
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const dateToStart = (value) => dayjs(value).startOf("day").valueOf();
  const dateToEnd = (value) => dayjs(value).endOf("day").valueOf();

  const formatInputDate = (value) => dayjs(value).format("DD MMMM YYYY");

  const formatHistoryDate = (row) => {
    const date = row?.TimeStamp ? dayjs(row.TimeStamp) : null;
    return date?.isValid() ? date.format("DD-MMM-YY hh:mm A") : "";
  };

  const getDetails = useCallback(
    async ({
      text = "",
      requestRole = "",
      userId = "",
      customFrom = null,
      customTo = null,
    } = {}) => {
      try {
        setIsBackgroundFetching(true);
        setLoading(true);
        let fromTimestamp = customFrom;
        let toTimestamp = customTo;

        if (fromTimestamp == null || toTimestamp == null) {
          if (filterMode === "month") {
            const mObj = dayjs(
              `${selectedMonth || dayjs().format("YYYY-MM")}-01`,
            );
            fromTimestamp = mObj.startOf("month").startOf("day").valueOf();
            toTimestamp = mObj.endOf("month").endOf("day").valueOf();
          } else {
            fromTimestamp = dateToStart(from);
            toTimestamp = dateToEnd(to);
          }
        }

        const body = {
          From: fromTimestamp,
          To: toTimestamp,
        };

        if (text?.trim()) {
          body.text = text.trim();
        }

        if (requestRole == "admin") {
          if (!userId) {
            setLoading(false);
            return;
          }
          body.id = userId;
        }

        const token = window?.localStorage?.getItem("token") || "";
        const cacheKey = `${fromTimestamp}_${toTimestamp}_${text || ""}_${userId || "self"}_${token}`;

        // Stale-While-Revalidate: Instant render from cache, zero skeletons
        const cached = getCachedRangeData(cacheKey);
        if (cached) {
          setDatas(cached.topics || []);
          setTotalCount(cached.totalCount || null);
          setLoading(false);
        } else {
          setLoading(true);
        }

        // Deduplicate in-flight requests (prevent concurrent duplicate fetches)
        const response = await fetchDeduplicated(cacheKey, async () => {
          const res = await fetch(`/api/getDateRange`, {
            method: "POST",
            cache: "no-store",
            headers: {
              "Content-type": "application/json",
              authorization: token,
            },
            body: JSON.stringify(body),
          });

          if (res.status == 400) {
            router.push("/");
            return null;
          }

          return await res.json();
        });

        if (!response) return;

        const freshTopics = response?.topics || [];
        const freshTotal = response?.totalCount?.[0] || null;
        setDatas(freshTopics);
        setTotalCount(freshTotal);
        setCachedRangeData(cacheKey, {
          topics: freshTopics,
          totalCount: freshTotal,
        });
      } catch (error) {
        console.log("Error loading topics: ", error);
      } finally {
        setLoading(false);
        setIsBackgroundFetching(false);
      }
    },
    [from, to, filterMode, selectedMonth, router],
  );

  const usersLists = useCallback(
    async (currentText = "") => {
      try {
        const data = await fetch(`/api/web/usersList`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-type": "application/json",
            authorization: `${window?.localStorage?.getItem("token")}`,
          },
        });
        const dts = await data.json();
        if (dts?.result?.length > 0) {
          setUsers(dts.result);
          setSelectedUser(dts.result[0]?._id);
        }
      } catch (error) {
        console.log("usersLists error: ", error);
      }
    },
    [getDetails],
  );

  const filteredDatas = useMemo(() => {
    const list = [...(datas || [])];
    if (sortKey == "title") {
      return list.sort((a, b) =>
        `${a?.Title || ""}`.localeCompare(`${b?.Title || ""}`),
      );
    }
    if (sortKey == "amount") {
      return list.sort(
        (a, b) => Number(b?.Amount || 0) - Number(a?.Amount || 0),
      );
    }
    return list.sort(
      (a, b) => Number(b?.TimeStamp || 0) - Number(a?.TimeStamp || 0),
    );
  }, [datas, sortKey]);

  const totalBalance = totalCount?.netIncome || 0;

  useEffect(() => {
    router.prefetch("/createDetail");
    router.prefetch("/settings");
    if (role === "admin") {
      router.prefetch("/authorize");
    }
  }, [router, role]);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl || typeof window === "undefined") return;

    let rafId = null;
    let snapTimeout = null;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      // If at or near top, rubber-banding on iOS, loading, searching, or dropdown open: keep fully visible
      if (currentScrollY <= 10 || loading || showSearch || showMonthDropdown) {
        currentTranslateRef.current = 0;
        headerEl.style.transition =
          "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
        headerEl.style.transform = "translate3d(0, 0px, 0)";
        headerEl.style.pointerEvents = "auto";
        return;
      }

      // Check if user has focused an input/select inside the header or is interacting
      const activeEl = document.activeElement;
      const isFocused =
        activeEl &&
        headerEl.contains(activeEl) &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("role") === "combobox");

      if (isInteracting.current || isFocused) {
        currentTranslateRef.current = 0;
        headerEl.style.transition =
          "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
        headerEl.style.transform = "translate3d(0, 0px, 0)";
        headerEl.style.pointerEvents = "auto";
        return;
      }

      // During active scroll: 1:1 direct tracking with NO transition delay
      headerEl.style.transition = "none";
      const headerHeight = headerEl.offsetHeight || 180;

      // Calculate new translation
      let nextTranslate = currentTranslateRef.current - deltaY;
      if (nextTranslate > 0) nextTranslate = 0;
      if (nextTranslate < -headerHeight) nextTranslate = -headerHeight;

      currentTranslateRef.current = nextTranslate;
      headerEl.style.transform = `translate3d(0, ${nextTranslate}px, 0)`;
      headerEl.style.pointerEvents =
        nextTranslate <= -headerHeight ? "none" : "auto";

      // Settle smoothly when scroll movement ends
      if (snapTimeout) clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        if (typeof window === "undefined") return;
        const scrollY = window.scrollY;
        if (scrollY <= 10) {
          currentTranslateRef.current = 0;
          headerEl.style.transition =
            "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
          headerEl.style.transform = "translate3d(0, 0px, 0)";
          headerEl.style.pointerEvents = "auto";
        } else if (
          currentTranslateRef.current !== 0 &&
          currentTranslateRef.current !== -headerHeight
        ) {
          if (currentTranslateRef.current > -headerHeight * 0.45) {
            currentTranslateRef.current = 0;
          } else {
            currentTranslateRef.current = -headerHeight;
          }
          headerEl.style.transition =
            "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
          headerEl.style.transform = `translate3d(0, ${currentTranslateRef.current}px, 0)`;
          headerEl.style.pointerEvents =
            currentTranslateRef.current <= -headerHeight ? "none" : "auto";
        }
      }, 140);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(onScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (snapTimeout) clearTimeout(snapTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, showSearch, showMonthDropdown]);

  useEffect(() => {
    if (role == "admin") {
      usersLists();
    }
  }, [role, usersLists]);

  const currentYear = dayjs().year();
  const availableYears = useMemo(() => {
    const list = [];
    for (let y = currentYear - 8; y <= currentYear + 5; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const appliedFilterLabel = useMemo(() => {
    if (filterMode === "month") {
      return dayjs(`${selectedMonth || dayjs().format("YYYY-MM")}-01`).format(
        "MMMM YYYY",
      );
    }
    return `${dayjs(from).format("DD/MM/YYYY")} – ${dayjs(to).format("DD/MM/YYYY")}`;
  }, [filterMode, selectedMonth, from, to]);

  useEffect(() => {
    if (!showMonthDropdown) return;
    const handleClickOutside = (e) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target) &&
        !e.target.closest(".history-date-selector-btn")
      ) {
        setShowMonthDropdown(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMonthDropdown]);

  const handleToggleMonthDropdown = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setShowMonthDropdown((prev) => !prev);
  };

  const handleSelectDropdownMonth = (monthIndex, year) => {
    const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const monthObj = dayjs(`${monthStr}-01`);
    const fromStr = monthObj.startOf("month").format("YYYY-MM-DD");
    const toStr = monthObj.endOf("month").format("YYYY-MM-DD");

    setFilterMode("month");
    setSelectedMonth(monthStr);
    setFrom(fromStr);
    setTo(toStr);
    setShowMonthDropdown(false);

    const fromTimestamp = monthObj.startOf("month").startOf("day").valueOf();
    const toTimestamp = monthObj.endOf("month").endOf("day").valueOf();
    getDetails({
      requestRole: role,
      userId: selectedUser,
      text: searchText,
      customFrom: fromTimestamp,
      customTo: toTimestamp,
    });
  };

  const handleOpenFilterModal = () => {
    setShowMonthDropdown(false);
    setDraftMode(filterMode);
    const currentM = dayjs(`${selectedMonth || dayjs().format("YYYY-MM")}-01`);
    setDraftMonth(currentM.month());
    setDraftYear(currentM.year());
    setDraftFrom(from);
    setDraftTo(to);
    setRangeError("");
    setShowFilterModal(true);
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
    setRangeError("");
  };

  const handleResetFilter = () => {
    const currentMonthStr = dayjs().format("YYYY-MM");
    const currentMonthObj = dayjs();
    const defaultFrom = currentMonthObj.startOf("month").format("YYYY-MM-DD");
    const defaultTo = currentMonthObj.endOf("month").format("YYYY-MM-DD");

    setFilterMode("month");
    setSelectedMonth(currentMonthStr);
    setFrom(defaultFrom);
    setTo(defaultTo);

    setDraftMode("month");
    setDraftMonth(currentMonthObj.month());
    setDraftYear(currentMonthObj.year());
    setDraftFrom(defaultFrom);
    setDraftTo(defaultTo);
    setRangeError("");
    setShowFilterModal(false);

    const fromTimestamp = currentMonthObj
      .startOf("month")
      .startOf("day")
      .valueOf();
    const toTimestamp = currentMonthObj.endOf("month").endOf("day").valueOf();
    getDetails({
      requestRole: role,
      userId: selectedUser,
      text: searchText,
      customFrom: fromTimestamp,
      customTo: toTimestamp,
    });
  };

  const handleApplyFilter = () => {
    if (draftMode === "range") {
      if (dayjs(draftFrom).isAfter(dayjs(draftTo), "day")) {
        setRangeError("Start date cannot be later than end date");
        return;
      }
      setRangeError("");
      setFilterMode("range");
      setFrom(draftFrom);
      setTo(draftTo);
      setShowFilterModal(false);

      const fromTimestamp = dayjs(draftFrom).startOf("day").valueOf();
      const toTimestamp = dayjs(draftTo).endOf("day").valueOf();
      getDetails({
        requestRole: role,
        userId: selectedUser,
        text: searchText,
        customFrom: fromTimestamp,
        customTo: toTimestamp,
      });
    } else {
      setRangeError("");
      const monthStr = `${draftYear}-${String(draftMonth + 1).padStart(2, "0")}`;
      const monthObj = dayjs(`${monthStr}-01`);
      const fromStr = monthObj.startOf("month").format("YYYY-MM-DD");
      const toStr = monthObj.endOf("month").format("YYYY-MM-DD");

      setFilterMode("month");
      setSelectedMonth(monthStr);
      setFrom(fromStr);
      setTo(toStr);
      setShowFilterModal(false);

      const fromTimestamp = monthObj.startOf("month").startOf("day").valueOf();
      const toTimestamp = monthObj.endOf("month").endOf("day").valueOf();
      getDetails({
        requestRole: role,
        userId: selectedUser,
        text: searchText,
        customFrom: fromTimestamp,
        customTo: toTimestamp,
      });
    }
  };

  useEffect(() => {
    if (role == "admin" && !selectedUser) {
      return;
    }
    getDetails({ requestRole: role, userId: selectedUser });
  }, [from, to, filterMode, selectedMonth, selectedUser, role, getDetails]);

  const submitSearch = (e) => {
    e?.preventDefault();
    getDetails({ text: searchText, requestRole: role, userId: selectedUser });
  };

  const handleRecordTouchEnd = (row, event) => {
    if (touchStartX == null) {
      return;
    }
    const endX = event.changedTouches?.[0]?.clientX || touchStartX;
    if (touchStartX - endX > 70) {
      router.push(`/editDetails/${row?._id}`);
    }
    setTouchStartX(null);
  };

  const handlePullStart = (e) => {
    if (window.scrollY <= 5 && !loading && !isRefreshing) {
      pullStartY.current = e.touches[0].clientY;
    } else {
      pullStartY.current = null;
    }
  };

  const handlePullMove = (e) => {
    if (pullStartY.current !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY.current;
      if (diff > 0) {
        const distance = Math.min(diff * 0.4, 80);
        setPullDistance(distance);
        // Prevent native pull to refresh if possible, though React passive listeners might not let this work entirely
      }
    }
  };

  const handlePullEnd = async () => {
    if (pullDistance >= 60 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      if (navigator.vibrate) navigator.vibrate(50);

      await getDetails({ requestRole: role, userId: selectedUser });

      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      setPullDistance(0);
    }
    pullStartY.current = null;
  };

  return (
    <div
      className="history-page"
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      <GlowingBubbles />
      <style>{`
                @keyframes ptr-spin { 100% { transform: rotate(360deg); } }
                .ptr-spinning { animation: ptr-spin 1s linear infinite; }
            `}</style>

      <div
        style={{
          height: `${pullDistance}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition:
            isRefreshing || pullDistance === 0 ? "height 0.3s ease" : "none",
          color: "var(--text-secondary)",
        }}
      >
        {pullDistance > 10 && (
          <div
            style={{
              transform: `rotate(${isRefreshing ? 0 : pullDistance * 4}deg)`,
            }}
          >
            <svg
              className={isRefreshing ? "ptr-spinning" : ""}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: Math.min(pullDistance / 60, 1) }}
            >
              <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-11.1l5.5 5.5" />
            </svg>
          </div>
        )}
      </div>

      <main className="history-shell">
        <div
          id="history-sticky-header"
          ref={headerRef}
          className="history-sticky-wrapper"
          onPointerDown={() => {
            isInteracting.current = true;
            setTimeout(() => {
              isInteracting.current = false;
            }, 800);
          }}
        >
          <header
            className="history-header"
            style={{ position: "relative", marginTop: "20px" }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                transition:
                  "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s",
                opacity: showSearch ? 0 : 1,
                transform: showSearch ? "translateX(-20px)" : "translateX(0)",
                pointerEvents: showSearch ? "none" : "auto",
              }}
            >
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
                <h1>History</h1>
              </div>
              <button
                className="history-search-toggle"
                type="button"
                aria-label={
                  isBackgroundFetching ? "Syncing data..." : "Search history"
                }
                onClick={handleOpenSearch}
                style={{ marginLeft: "auto", color: "#d4a017" }}
              >
                {isBackgroundFetching ? (
                  <span className="history-header-spinner" title="Syncing..." />
                ) : (
                  <SearchIcon />
                )}
              </button>
            </div>

            <form
              className="history-search-form"
              onSubmit={submitSearch}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition:
                  "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s",
                opacity: showSearch ? 1 : 0,
                transform: showSearch ? "translateX(0)" : "translateX(20px)",
                pointerEvents: showSearch ? "auto" : "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <LiquidTextField
                  value={searchText}
                  placeholder="Search title"
                  type="search"
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}
                  inputRef={searchInputRef}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: { xs: "44px", sm: "52px" },
                      height: { xs: "44px", sm: "52px" },
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(20px) saturate(160%)",
                      WebkitBackdropFilter: "blur(20px) saturate(160%)",
                      boxShadow:
                        "inset 0 1px 2px rgba(255, 255, 255, 0.12), 0 8px 32px rgba(0, 0, 0, 0.45)",
                      "& fieldset": {
                        borderRadius: "10px",
                        borderColor: "rgba(212, 160, 23, 0.45)",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(212, 160, 23, 0.75)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        boxShadow:
                          "inset 0 1px 2px rgba(255, 255, 255, 0.18), 0 0 24px rgba(212, 160, 23, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(212, 160, 23, 1)",
                        borderWidth: "1.5px",
                      },
                      "& .MuiInputBase-input": {
                        color: "#ffffff",
                        background: "transparent !important",
                        padding: { xs: "8px 16px", sm: "12px 20px" },
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          aria-label="Search"
                          edge="end"
                          sx={{
                            color: "#d4a017",
                            height: "15px",
                            width: "15px",
                            mr: "3px",
                          }}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <button
                className="history-search-toggle"
                type="button"
                aria-label="Close search"
                onClick={handleCloseSearch}
                style={{
                  color: "var(--accent-expense)",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon />
              </button>
            </form>
          </header>

          {role == "admin" && (
            <Select
              className="history-account-select"
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
              }}
              aria-label="Select account"
              fullWidth
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(16px) saturate(150%)",
                WebkitBackdropFilter: "blur(16px) saturate(150%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
                borderRadius: { xs: "12px", sm: "14px" },
                fontSize: { xs: "16px", sm: "20px" },
                fontWeight: 700,
                minHeight: { xs: "48px", sm: "66px" },
                mb: 2,
                transition: "all 0.3s ease",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 0.45)",
                  borderWidth: "1.5px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 0.45)",
                },
                "&.Mui-focused": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 20px rgba(212, 160, 23, 0.2)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 0.8)",
                  borderWidth: "1.5px",
                },
                "& .MuiSvgIcon-root": {
                  color: "#d4a017",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "rgba(25, 25, 25, 0.65)",
                    backdropFilter: "blur(16px) saturate(150%)",
                    WebkitBackdropFilter: "blur(16px) saturate(150%)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                  },
                },
              }}
            >
              {users?.map((user) => (
                <MenuItem key={user?._id} value={user?._id}>
                  {user?.Name}
                </MenuItem>
              ))}
            </Select>
          )}

          <div className="history-compact-filter-bar">
            <button
              type="button"
              className={`history-date-selector-btn ${showMonthDropdown ? "active" : ""}`}
              onClick={handleToggleMonthDropdown}
              aria-label="Filter period selector"
              aria-expanded={showMonthDropdown}
            >
              <div className="filter-pill-content">
                <CalendarTodayOutlinedIcon className="filter-pill-icon" />
                <span className="filter-pill-label">{appliedFilterLabel}</span>
              </div>
              <KeyboardArrowDownIcon
                className={`filter-pill-arrow ${showMonthDropdown ? "rotated" : ""}`}
              />
            </button>

            <button
              type="button"
              className="history-filter-trigger-btn"
              onClick={handleOpenFilterModal}
              aria-label="Open filter options"
            >
              <FilterListIcon />
            </button>

            {showMonthDropdown && (
              <div
                ref={monthDropdownRef}
                className="history-month-dropdown"
                role="dialog"
                aria-label="Select month"
              >
                <div className="month-dropdown-header">
                  <span className="month-dropdown-title">Select Month</span>
                  <span className="month-dropdown-subtitle">Past 6 Months</span>
                </div>

                <div className="month-dropdown-list">
                  {recentMonths.map((m) => {
                    const isSelected =
                      filterMode === "month" && selectedMonth === m.value;

                    return (
                      <button
                        key={m.value}
                        type="button"
                        className={`month-dropdown-row ${isSelected ? "selected" : ""} ${m.isCurrent ? "current" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDropdownMonth(m.monthIndex, m.year);
                        }}
                      >
                        <div className="month-dropdown-row-main">
                          <span className="month-dropdown-row-label">
                            {m.label}
                          </span>
                          {m.isCurrent && (
                            <span className="month-dropdown-badge">
                              Current
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <CheckIcon
                            className="month-dropdown-check-icon"
                            fontSize="small"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="month-dropdown-footer">
                  <button
                    type="button"
                    className="month-dropdown-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFilterModal();
                    }}
                  >
                    Custom range or older months ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="history-sort-row" aria-label="Sort history">
            <button
              type="button"
              onClick={() => {
                setSortKey("title");
              }}
            >
              Title <span className={sortKey == "title" ? "active" : ""}></span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSortKey("date");
              }}
            >
              Date <span className={sortKey == "date" ? "active" : ""}></span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSortKey("amount");
              }}
            >
              Amount{" "}
              <span className={sortKey == "amount" ? "active" : ""}></span>
            </button>
          </div>
        </div>

        <section className="history-list" aria-label="History records">
          {loading ? (
            <div className="skeleton-container">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="history-skeleton-card">
                  <div className="skeleton-text-group">
                    <div className="skeleton-title" />
                    <div className="skeleton-date" />
                  </div>
                  <div className="skeleton-amount" />
                </div>
              ))}
            </div>
          ) : filteredDatas?.length > 0 ? (
            filteredDatas.map((row) => {
              const isDragging = activeDrag.cardId === row?._id;
              const isPastThreshold =
                isDragging && Math.abs(activeDrag.offset) >= 60;
              const swipingClass =
                isDragging && activeDrag.direction
                  ? `is-swiping-${activeDrag.direction}`
                  : "";
              const thresholdClass = isPastThreshold ? "is-past-threshold" : "";

              return (
                <div
                  className={`history-card-item ${swipingClass} ${thresholdClass}`}
                  key={row?._id}
                >
                  {/* Swipe Action Left: Delete */}
                  <div className="card-swipe-action action-left">
                    <button
                      type="button"
                      className="swipe-btn delete-action"
                      aria-label={`Delete ${row?.Title}`}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        setRecordToDelete(row);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecordToDelete(row);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </button>
                  </div>

                  {/* Main Transaction Card */}
                  <div
                    className={`history-card ${
                      expandedCardId === row?._id ? "expanded" : ""
                    }`}
                    style={
                      isDragging
                        ? {
                            transform: `translateX(${activeDrag.offset}px)`,
                            transition: "none",
                          }
                        : undefined
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(row)}
                    onTouchStart={(e) => handleCardTouchStart(e, row)}
                    onTouchMove={(e) => handleCardTouchMove(e, row)}
                    onTouchEnd={(e) => handleCardTouchEnd(e, row)}
                    onTouchCancel={handleCardTouchCancel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(row);
                      }
                    }}
                  >
                    <div className="history-card-main">
                      <div className="history-card-info">
                        <strong className="history-card-title">
                          {row?.Title}
                        </strong>
                        <small className="history-card-date">
                          {formatHistoryDate(row)}
                        </small>
                      </div>

                      <div className="history-card-amount-box">
                        <b
                          className={`history-card-amount ${
                            row?.Type === "Income" ? "income" : "expense"
                          }`}
                        >
                          ₹{formatIndianNumber(row?.Amount)}
                        </b>
                        {/* Desktop accessible Delete and Edit buttons */}
                        <div className="desktop-card-actions">
                          <button
                            type="button"
                            className="desktop-action-btn delete-btn"
                            title="Delete"
                            aria-label={`Delete ${row?.Title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordToDelete(row);
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                          <button
                            type="button"
                            className="desktop-action-btn edit-btn"
                            title="Edit"
                            aria-label={`Edit ${row?.Title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/editDetails/${row?._id}`);
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Description inline */}
                    <div
                      className={`history-card-description ${
                        expandedCardId === row?._id ? "open" : ""
                      }`}
                    >
                      <span className="desc-label">Description: </span>
                      <span
                        className="desc-content"
                        style={
                          !row?.Description?.trim()
                            ? { opacity: 0.65, fontStyle: "italic" }
                            : undefined
                        }
                      >
                        {row?.Description?.trim() || "No description"}
                      </span>
                    </div>
                  </div>

                  {/* Swipe Action Right: Edit */}
                  <div className="card-swipe-action action-right">
                    <button
                      type="button"
                      className="swipe-btn edit-action"
                      aria-label={`Edit ${row?.Title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/editDetails/${row?._id}`);
                      }}
                    >
                      <EditOutlinedIcon />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="history-empty">No data found</div>
          )}
        </section>

        <div className="history-floating-actions">
          <div className="history-balance">
            <span style={{ color: "#d4a017" }}>Total balance</span>
            <strong>
              ₹<AnimatedNumber value={totalBalance} />
            </strong>
          </div>
          <button
            className="history-detailed-view-btn"
            type="button"
            aria-label="Detailed View"
            title="Detailed View"
            onClick={() => {
              router.push(`/details?from=${from}&to=${to}`);
            }}
          >
            <PieChartIcon />
          </button>
        </div>

        {recordToDelete && (
          <Dialog
            open={Boolean(recordToDelete)}
            onClose={() => setRecordToDelete(null)}
            PaperProps={{
              sx: {
                backgroundColor: "rgba(22, 22, 26, 0.96)",
                backdropFilter: "blur(24px) saturate(160%)",
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                color: "#ffffff",
                border: "1px solid rgba(255, 59, 48, 0.35)",
                borderRadius: "20px",
                boxShadow:
                  "0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 59, 48, 0.15)",
                maxWidth: { xs: "92vw", sm: "420px" },
                width: "100%",
                padding: { xs: "20px", sm: "24px" },
                boxSizing: "border-box",
                overflow: "hidden",
              },
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background:
                    "radial-gradient(circle, rgba(255, 59, 48, 0.25) 0%, rgba(255, 59, 48, 0.08) 100%)",
                  border: "1px solid rgba(255, 59, 48, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "0 8px 20px rgba(255, 59, 48, 0.2)",
                }}
              >
                <DeleteOutlineIcon
                  sx={{ color: "#ff3b30", fontSize: "32px" }}
                />
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Delete Transaction?
              </h3>

              <p
                style={{
                  color: "rgba(255, 255, 255, 0.65)",
                  margin: "0 0 16px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to permanently delete this record? This
                action cannot be undone.
              </p>

              {/* Transaction details preview badge */}
              <div
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "22px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    textAlign: "left",
                    minWidth: 0,
                    flex: 1,
                    paddingRight: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "15px",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {recordToDelete?.Title}
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.45)",
                      fontSize: "12px",
                      marginTop: "2px",
                    }}
                  >
                    {formatHistoryDate(recordToDelete)}
                  </div>
                </div>

                <div
                  style={{
                    color:
                      recordToDelete?.Type === "Income" ? "#22c55e" : "#ff3b30",
                    fontSize: "16px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  ₹{formatIndianNumber(recordToDelete?.Amount)}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(recordToDelete._id)}
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #ff453a 0%, #e02828 100%)",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(255, 59, 48, 0.35)",
                    transition: "all 0.15s ease",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Dialog>
        )}

        {selectedRecord && (
          <div
            className="record-detail-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="History details"
            onClick={() => {
              setSelectedRecord(null);
            }}
          >
            <section
              className="record-detail-sheet"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="record-detail-head">
                <div>
                  <h2>{selectedRecord?.Title}</h2>
                  <span>{formatHistoryDate(selectedRecord)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                  }}
                >
                  Close
                </button>
              </div>

              <div className="record-detail-amount">
                <span>{selectedRecord?.Type}</span>
                <strong
                  className={
                    selectedRecord?.Type == "Income" ? "income" : "expense"
                  }
                >
                  ₹{formatIndianNumber(selectedRecord?.Amount)}
                </strong>
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {selectedRecord?.Description || "No description"}
              </p>

              <PrimaryButton
                type="button"
                onClick={() => {
                  router.push(`/editDetails/${selectedRecord?._id}`);
                }}
              >
                Edit
              </PrimaryButton>
            </section>
          </div>
        )}

        {showFilterModal && (
          <FilterBottomSheet
            onClose={handleCloseFilterModal}
            draftMode={draftMode}
            setDraftMode={setDraftMode}
            draftMonth={draftMonth}
            setDraftMonth={setDraftMonth}
            draftYear={draftYear}
            setDraftYear={setDraftYear}
            draftFrom={draftFrom}
            setDraftFrom={setDraftFrom}
            draftTo={draftTo}
            setDraftTo={setDraftTo}
            rangeError={rangeError}
            setRangeError={setRangeError}
            availableYears={availableYears}
            MONTH_NAMES={MONTH_NAMES}
            onReset={handleResetFilter}
            onApply={handleApplyFilter}
          />
        )}
      </main>
    </div>
  );
}
