"use client";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import LiquidTextField from "@/components/LiquidTextField";
import dayjs from "dayjs";

export default function FilterBottomSheet({
  onClose,
  draftMode,
  setDraftMode,
  draftMonth,
  setDraftMonth,
  draftYear,
  setDraftYear,
  draftFrom,
  setDraftFrom,
  draftTo,
  setDraftTo,
  rangeError,
  setRangeError,
  availableYears,
  MONTH_NAMES,
  availableCategories = [],
  draftCategories = [],
  setDraftCategories,
  onReset,
  onApply,
}) {
  const updateDatesForMonthYear = (month, year) => {
    const mStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const mObj = dayjs(mStr);
    if (mObj.isValid()) {
      setDraftFrom(mObj.startOf("month").format("YYYY-MM-DD"));
      setDraftTo(mObj.endOf("month").format("YYYY-MM-DD"));
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    setDraftMonth(newMonth);
    updateDatesForMonthYear(newMonth, draftYear);
    if (setRangeError) setRangeError("");
  };

  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setDraftYear(newYear);
    updateDatesForMonthYear(draftMonth, newYear);
    if (setRangeError) setRangeError("");
  };

  return (
    <div
      className="history-filter-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Filter transactions"
      onClick={onClose}
    >
      <div
        className="history-filter-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="filter-sheet-drag-handle" />

        <div className="filter-sheet-header">
          <div className="filter-sheet-title-group">
            <h3>Filter Transactions</h3>
            <p>Choose month or custom date range</p>
          </div>
          <button
            type="button"
            className="filter-sheet-close-btn"
            aria-label="Close filter"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="filter-mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={draftMode === "month"}
            className={`filter-mode-tab ${draftMode === "month" ? "active" : ""}`}
            onClick={() => {
              setDraftMode("month");
              if (draftFrom) {
                const d = dayjs(draftFrom);
                if (d.isValid()) {
                  setDraftMonth(d.month());
                  setDraftYear(d.year());
                }
              }
              setRangeError("");
            }}
          >
            Month-wise
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={draftMode === "range"}
            className={`filter-mode-tab ${draftMode === "range" ? "active" : ""}`}
            onClick={() => {
              setDraftMode("range");
              updateDatesForMonthYear(draftMonth, draftYear);
              setRangeError("");
            }}
          >
            Custom Date Range
          </button>
        </div>

        <div className="filter-sheet-body">
          {draftMode === "month" ? (
            <div className="filter-month-selector-group">
              <span className="filter-group-title">Select Month</span>

              <div className="filter-month-year-grid">
                <div className="filter-select-field">
                  <span className="filter-select-label">Month</span>
                  <Select
                    value={draftMonth}
                    onChange={handleMonthChange}
                    fullWidth
                    sx={{
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: 700,
                      minHeight: "48px",
                      height: "48px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(212, 160, 23, 0.45)",
                        borderWidth: "1.5px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(212, 160, 23, 0.8)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d4a017",
                        borderWidth: "1.5px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#d4a017",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "rgba(20, 20, 24, 0.98)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          color: "#ffffff",
                          border: "1px solid rgba(212, 160, 23, 0.35)",
                          borderRadius: "12px",
                          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.75)",
                          maxHeight: "260px",
                          "& .MuiMenuItem-root": {
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "10px 16px",
                            "&:hover": {
                              backgroundColor: "rgba(212, 160, 23, 0.15)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(212, 160, 23, 0.25)",
                              color: "#d4a017",
                              fontWeight: 800,
                              "&:hover": {
                                backgroundColor: "rgba(212, 160, 23, 0.35)",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <MenuItem key={name} value={idx}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="filter-select-field">
                  <span className="filter-select-label">Year</span>
                  <Select
                    value={draftYear}
                    onChange={handleYearChange}
                    fullWidth
                    sx={{
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: 700,
                      minHeight: "48px",
                      height: "48px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(212, 160, 23, 0.45)",
                        borderWidth: "1.5px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(212, 160, 23, 0.8)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d4a017",
                        borderWidth: "1.5px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#d4a017",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "rgba(20, 20, 24, 0.98)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          color: "#ffffff",
                          border: "1px solid rgba(212, 160, 23, 0.35)",
                          borderRadius: "12px",
                          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.75)",
                          maxHeight: "260px",
                          "& .MuiMenuItem-root": {
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "10px 16px",
                            "&:hover": {
                              backgroundColor: "rgba(212, 160, 23, 0.15)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(212, 160, 23, 0.25)",
                              color: "#d4a017",
                              fontWeight: 800,
                              "&:hover": {
                                backgroundColor: "rgba(212, 160, 23, 0.35)",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {availableYears.map((yr) => (
                      <MenuItem key={yr} value={yr}>
                        {yr}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="filter-custom-range-group">
              <div className="filter-range-fields">
                <div className="filter-date-field">
                  <span className="filter-select-label">
                    Start date<b style={{ color: "#ff3b3f" }}>*</b>
                  </span>
                  <LiquidTextField
                    value={draftFrom}
                    type="date"
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                    onChange={(e) => {
                      setDraftFrom(e.target.value);
                      if (rangeError) setRangeError("");
                    }}
                    fullWidth
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      "& .MuiOutlinedInput-root": {
                        paddingLeft: { xs: "10px", sm: "14px" },
                        paddingRight: { xs: "8px", sm: "12px" },
                        minHeight: { xs: "50px", sm: "52px" },
                        height: { xs: "50px", sm: "52px" },
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                      },
                      "& .MuiInputBase-input, & input[type=date]": {
                        textAlign: "left",
                        padding: "0 !important",
                        height: "100% !important",
                        minHeight: "0 !important",
                        fontSize: { xs: "13.5px", sm: "14px" },
                        lineHeight: "normal !important",
                        whiteSpace: "nowrap",
                        WebkitAppearance: "none",
                        minWidth: 0,
                        width: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& input[type=date]::-webkit-date-and-time-value": {
                        textAlign: "left",
                        minWidth: 0,
                        lineHeight: "normal !important",
                        minHeight: "0 !important",
                        height: "auto !important",
                        margin: "0 !important",
                        padding: "0 !important",
                      },
                      "& input[type=date]::-webkit-calendar-picker-indicator": {
                        display: "none",
                        WebkitAppearance: "none",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          sx={{ pointerEvents: "none", ml: 0.5, mr: 0 }}
                        >
                          <CalendarTodayOutlinedIcon
                            sx={{
                              fontSize: { xs: "16px", sm: "18px" },
                              color: "rgba(255, 255, 255, 0.75)",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="filter-date-field">
                  <span className="filter-select-label">
                    End date<b style={{ color: "#ff3b3f" }}>*</b>
                  </span>
                  <LiquidTextField
                    value={draftTo}
                    type="date"
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                    onChange={(e) => {
                      setDraftTo(e.target.value);
                      if (rangeError) setRangeError("");
                    }}
                    fullWidth
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      "& .MuiOutlinedInput-root": {
                        paddingLeft: { xs: "10px", sm: "14px" },
                        paddingRight: { xs: "8px", sm: "12px" },
                        minHeight: { xs: "50px", sm: "52px" },
                        height: { xs: "50px", sm: "52px" },
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                      },
                      "& .MuiInputBase-input, & input[type=date]": {
                        textAlign: "left",
                        padding: "0 !important",
                        height: "100% !important",
                        minHeight: "0 !important",
                        fontSize: { xs: "13.5px", sm: "14px" },
                        lineHeight: "normal !important",
                        whiteSpace: "nowrap",
                        WebkitAppearance: "none",
                        minWidth: 0,
                        width: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& input[type=date]::-webkit-date-and-time-value": {
                        textAlign: "left",
                        minWidth: 0,
                        lineHeight: "normal !important",
                        minHeight: "0 !important",
                        height: "auto !important",
                        margin: "0 !important",
                        padding: "0 !important",
                      },
                      "& input[type=date]::-webkit-calendar-picker-indicator": {
                        display: "none",
                        WebkitAppearance: "none",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          sx={{ pointerEvents: "none", ml: 0.5, mr: 0 }}
                        >
                          <CalendarTodayOutlinedIcon
                            sx={{
                              fontSize: { xs: "16px", sm: "18px" },
                              color: "rgba(255, 255, 255, 0.75)",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>

              {rangeError && (
                <div className="filter-error-banner">
                  <span>⚠️ {rangeError}</span>
                </div>
              )}
            </div>
          )}

          {availableCategories && availableCategories.length > 0 && (
            <div className="filter-category-section">
              <div className="filter-category-header">
                <span className="filter-group-title">
                  Filter by Category (
                  {draftCategories.length > 0
                    ? `${draftCategories.length} selected`
                    : "All"}
                  )
                </span>
                {draftCategories.length > 0 && (
                  <button
                    type="button"
                    className="filter-category-clear-btn"
                    onClick={() => setDraftCategories([])}
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <div className="filter-category-chips">
                {availableCategories.map((cat) => {
                  const name = typeof cat === "string" ? cat : cat.name;
                  const count = typeof cat === "object" ? cat.count : null;
                  const isSelected = draftCategories.includes(name);

                  return (
                    <button
                      key={name}
                      type="button"
                      className={`filter-category-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setDraftCategories((prev) =>
                          isSelected
                            ? prev.filter((c) => c !== name)
                            : [...prev, name],
                        );
                      }}
                    >
                      {isSelected && <span className="chip-check">✓</span>}
                      <span>{name}</span>
                      {count != null && (
                        <span className="chip-count">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="filter-sheet-actions">
          <button type="button" className="filter-btn-reset" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="filter-btn-apply" onClick={onApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
