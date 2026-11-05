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
import GlowingBubbles from "@/components/GlowingBubbles";
import Button from "@mui/material/Button";
import TypeToggleButton from "@/components/TypeToggleButton";

import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import dayjs from "dayjs";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { clearRangeDataCache, fetchDeduplicated } from "@/libs/dataCache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useLoader } from "@/app/context/LoaderContext";

export default function Home({ params }) {
  const isMobile = useMediaQuery("(max-width:520px)", { noSsr: true });
  const isShortMobile = useMediaQuery(
    "(max-width:520px) and (max-height:700px)",
    { noSsr: true },
  );
  const [dateValue, setDateValue] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [TimeStamp, setTimeStamp] = useState("");
  const [role, setRole] = useState();

  const [selectedDateError, setSelectedDateError] = useState("");
  const [topicError, setTopicError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [typeError, setTypeError] = useState("");

  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(false);
  const suggestionRowRef = useRef(null);

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

  const hasFetchedTitles = useRef(false);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const storedSuggestions =
          window.localStorage.getItem("titleSuggestions");
        if (storedSuggestions) {
          try {
            setTitleSuggestions(JSON.parse(storedSuggestions));
          } catch (e) {
            console.error("Error parsing stored suggestions", e);
          }
        }

        const token = window.localStorage.getItem("token");
        if (!token) return;

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

        const dedupeKey = `titles_${token.slice(-10)}_${startTimeStamp}_${endTimeStamp}`;

        const resData = await fetchDeduplicated(dedupeKey, async () => {
          let res = await fetch(`/api/getDateRange`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              authorization: token,
            },
            body: JSON.stringify(params),
          });
          return await res.json();
        });

        let data = resData?.topics;

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
        }
      } catch (error) {
        console.log("err", error);
      }
    };

    if (!hasFetchedTitles.current) {
      hasFetchedTitles.current = true;
      fetchTitles();
    }
  }, []);

  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

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
    const formattedDate = date.format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    setTimeStamp(date.valueOf());
    setSelectedDateError("");
  };

  const getPickerDateFromRecord = useCallback((item) => {
    const datePart = item?.Date ? dayjs(item.Date) : null;
    const timestampValue = Number(item?.TimeStamp);
    const timePart = Number.isFinite(timestampValue)
      ? dayjs(timestampValue)
      : null;

    if (datePart?.isValid()) {
      if (timePart?.isValid()) {
        return datePart
          .hour(timePart.hour())
          .minute(timePart.minute())
          .second(timePart.second())
          .millisecond(timePart.millisecond());
      }
      return datePart;
    }

    if (timePart?.isValid()) {
      return timePart;
    }

    return dayjs();
  }, []);

  const getDetails = useCallback(
    async (id) => {
      try {
        showLoader();
        const res = await fetch("/api/getelementid", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-type": "application/json",
            authorization: window.localStorage.getItem("token"),
          },
          body: JSON.stringify({ Id: id }),
        });

        if (res.status == 401) {
          router.push("/");
          return;
        }

        const resp = await res?.json();
        if (!res.ok || !resp?.topics) {
          toast.error(resp?.message || "Record not found");
          router.push("/viewDetails");
          return;
        }

        const item = resp.topics;
        setTopic(item.Title ?? "");
        setDescription(item.Description ?? "");
        setAmount(item.Amount ?? "");
        setType(item.Type ?? "Expense");
        const loadedDate = getPickerDateFromRecord(item);
        setDateValue(loadedDate);
        setSelectedDate(loadedDate.format("YYYY-MM-DD"));
        setTimeStamp(loadedDate.valueOf());
      } catch (error) {
        console.log("getDetails error:", error);
      } finally {
        hideLoader();
      }
    },
    [router, getPickerDateFromRecord, showLoader, hideLoader],
  );

  useEffect(() => {
    setRole(window.localStorage.getItem("roles"));
    if (params?.id) {
      getDetails(params.id);
    }
  }, [params?.id, getDetails]);

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      if (!selectedDate) {
        setSelectedDateError("Please Select Date");
      } else if (topic == "") {
        setTopicError("Please Enter Topic");
      }
      // else if (description == "") {
      //     setDescriptionError("Please Enter Description");
      // }
      else if (amount == "" || amount == 0) {
        setAmountError("Please Enter Amount");
      } else if (type == "") {
        setTypeError("Please Select Type");
      } else {
        showLoader();
        const res = await fetch("/api/getelementid", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            authorization: window.localStorage.getItem("token"),
          },
          body: JSON.stringify({
            Id: params?.id,
            Title: topic,
            Amount: Number(amount),
            Type: type,
            Description: description,
            Date: selectedDate,
            TimeStamp,
          }),
        });
        if (res?.ok) {
          hideLoader();
          clearRangeDataCache();
          toast.success("Updated Successfully");
          router.push("/viewDetails");
        } else {
          hideLoader();
          toast.error("Something Went Wrong");
        }
      }
    } catch (error) {
      hideLoader();
      console.log("handleSubmit error:", error);
    }
  };

  return (
    <div className="create-detail-page">
      <GlowingBubbles />
      <main className="expense-shell edit-shell">
        <header className="expense-header">
          <div className="expense-title-wrap">
            <button
              className="expense-back-btn"
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
            >
              <ArrowBackIcon />
            </button>
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
            <h1>Edit</h1>
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
              value={topic}
              placeholder="Title"
              variant="outlined"
              onChange={(e) => {
                setTopic(e.target.value);
                setTopicError("");
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
                        onClick={() => {
                          setTopic(item);
                          setTopicError("");
                          if (suggestionRowRef.current) {
                            suggestionRowRef.current.scrollTo({
                              left: 0,
                              behavior: "smooth",
                            });
                          }
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
                      marginTop: "4px",
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
                fullWidth
                InputProps={{
                  endAdornment:
                    amount !== ""
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
                id="edit-type-select"
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

          <Button className="add-data-btn" variant="contained" type="submit">
            Update
          </Button>
        </form>
      </main>
    </div>
  );
}
