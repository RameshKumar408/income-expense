"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./TypeToggleButton.module.css";
import colors from "@/colors";

function SwapHorizontalIcon({ size = 20, color = "currentColor", className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="36"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M304 96l112 112-112 112M400 208H96M208 416L96 304l112-112M112 304h304" />
    </svg>
  );
}

/**
 * CardTypeToggle
 * Matches TypeToggleButton's spring press, text slide/fade, and animated swap icon
 * for switching between Credit Card and Debit Card.
 */
export default function CardTypeToggle({
  value = "credit",
  onToggle,
  disabled = false,
}) {
  const isCredit = value !== "debit";
  const label = isCredit ? "Credit Card" : "Debit Card";
  const theme = isCredit ? colors.cards.credit : colors.cards.debit;
  const activeColor = theme.border;
  const backgroundColor = theme.toggleBg;

  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef(null);

  const handlePress = (e) => {
    if (disabled) return;
    if (e) e.preventDefault();

    setIsPressed(true);
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 120);

    if (onToggle) {
      onToggle(isCredit ? "debit" : "credit");
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePress();
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`${styles.scaleWrapper} ${isPressed ? styles.isPressed : ""}`}
    >
      <button
        type="button"
        aria-label={`Toggle card type, current is ${label}`}
        disabled={disabled}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        className={styles.container}
        style={{
          borderColor: activeColor,
          backgroundColor,
        }}
      >
        <div className={styles.textWrapper}>
          <span
            key={isCredit ? "credit" : "debit"}
            className={styles.text}
            style={{ color: activeColor }}
          >
            {label}
          </span>
        </div>

        <div
          className={`${styles.iconWrapper} ${isCredit ? styles.iconRotated : styles.iconDefault}`}
        >
          <SwapHorizontalIcon
            size={22}
            color={activeColor}
            className={styles.iconSvg}
          />
        </div>
      </button>
    </div>
  );
}
