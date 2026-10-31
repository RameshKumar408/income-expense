'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './TypeToggleButton.module.css';

/**
 * Ionicons swap-horizontal SVG icon (exact Ionicons 5 representation)
 */
function IoniconsSwapHorizontal({ size = 20, color = 'currentColor', className }) {
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
 * TypeToggleButton
 * Web replica of React Native TypeToggleButton component with spring animations,
 * text slide/fade, and Ionicons swap-horizontal icon.
 *
 * @param {Object|string} props.value - e.g. { label: 'Income', value: 1 } or 'Income' | 'Expense'
 * @param {Function} props.onToggle - Callback triggered on press/click
 * @param {Object} [props.colors] - Optional theme colors { green, error }
 * @param {Object} [props.style] - Inline CSS styles for container
 * @param {string} [props.className] - Additional CSS class name
 * @param {boolean} [props.compact] - If true, uses compact 40px height matching RN default
 */
export default function TypeToggleButton({
  value,
  onToggle,
  colors: propColors,
  style,
  className,
  compact = false,
  id,
  ariaLabel,
  disabled = false,
}) {
  // Normalize isIncome
  const isIncome =
    typeof value === 'object' && value !== null
      ? value.value === 1 || String(value.label).toLowerCase() === 'income'
      : typeof value === 'number'
      ? value === 1
      : String(value).toLowerCase() === 'income';

  // Label text
  const label =
    typeof value === 'object' && value !== null && value.label
      ? value.label
      : isIncome
      ? 'Income'
      : typeof value === 'string' && value
      ? value
      : 'Expense';

  // Color tokens matching React Native and web theme
  const greenColor = propColors?.green || '#05B534';
  const errorColor = propColors?.error || '#FC3728';
  const activeColor = isIncome ? greenColor : errorColor;

  const backgroundColor = isIncome
    ? 'rgba(5, 181, 52, 0.05)'
    : 'rgba(252, 55, 40, 0.05)';

  // Scale animation on press (simulating RN Animated.sequence scale)
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef(null);

  const handlePress = (e) => {
    if (disabled) return;
    if (e) {
      e.preventDefault();
    }

    setIsPressed(true);
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 120);

    if (onToggle) {
      onToggle();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
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
    <div className={`${styles.scaleWrapper} ${isPressed ? styles.isPressed : ''}`}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel || `Toggle transaction type, current is ${label}`}
        disabled={disabled}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        className={`${styles.container} ${compact ? styles.compact : ''} ${className || ''}`}
        style={{
          borderColor: activeColor,
          backgroundColor: backgroundColor,
          ...style,
        }}
      >
        <div className={styles.textWrapper}>
          <span
            key={isIncome ? 'income' : 'expense'}
            className={styles.text}
            style={{ color: activeColor }}
          >
            {label}
          </span>
        </div>

        <div
          className={`${styles.iconWrapper} ${isIncome ? styles.iconRotated : styles.iconDefault}`}
        >
          <IoniconsSwapHorizontal
            size={compact ? 18 : 22}
            color={activeColor}
            className={styles.iconSvg}
          />
        </div>
      </button>
    </div>
  );
}
