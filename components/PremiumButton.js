import React from 'react';
import styles from './PremiumButton.module.css';

export default function PremiumButton({ text = "View Premium", onClick }) {
  return (
    <button className={styles.premiumButton} type="button" onClick={onClick}>
      <span className={styles.buttonText}>{text}</span>
      <svg
        className={styles.arrow}
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 8.5H13.5M9 4L13.5 8.5L9 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
