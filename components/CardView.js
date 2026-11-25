"use client";

import React, { useEffect, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WifiIcon from "@mui/icons-material/Wifi";
import { toast } from "react-toastify";
import colors from "@/colors";
import {
  buildCardShareText,
  detectCardNetwork,
  formatCardNumberGrouped,
  getCardExpiryStatus,
  maskCardNumber,
  maskCvv,
} from "@/libs/cardsStorage";
import styles from "./CardView.module.css";

/**
 * Reusable Credit & Debit Card visual component.
 * Supports Dark & Light mode tokens, masked/revealed sensitive fields,
 * expiry alert pills, and action buttons (Reveal/Hide, Share, Edit, Delete).
 */
export default function CardView({
  card,
  isPreview = false,
  showActions = true,
  onEdit,
  onDelete,
  onCardClick,
  style,
  className = "",
}) {
  const [isRevealed, setIsRevealed] = useState(isPreview);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    // App is dark-first; only switch to light card tokens if explicitly light-themed
    const checkTheme = () => {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      setIsLightMode(dataTheme === "light");
    };
    checkTheme();
    mq.addEventListener?.("change", checkTheme);
    return () => mq.removeEventListener?.("change", checkTheme);
  }, []);

  const isDebit = card?.cardType === "debit";
  const theme = isDebit ? colors.cards.debit : colors.cards.credit;
  const modeTokens = isLightMode ? theme.light : theme.dark;

  const network =
    card?.network || detectCardNetwork(card?.cardNumber || "");
  const expiryStatus = getCardExpiryStatus(card?.expiry || "");

  const displayNumber =
    isPreview || isRevealed
      ? formatCardNumberGrouped(card?.cardNumber || "") || "•••• •••• •••• ••••"
      : maskCardNumber(card?.cardNumber || "");

  const displayCvv =
    isPreview || isRevealed
      ? String(card?.cvv || "").replace(/\D/g, "") || "•••"
      : maskCvv(card?.cvv || "");

  const handleToggleReveal = (e) => {
    e.stopPropagation();
    setIsRevealed((prev) => !prev);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = buildCardShareText(card);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${card.bankName || "Card"} Details`,
          text: shareText,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Card details copied (CVV excluded)");
        return;
      } catch {
        // Fallback below
      }
    }

    toast.error("Unable to share card details");
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(card);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(card);
  };

  return (
    <div className={`${styles.cardWrapper} ${className}`} style={style}>
      <div
        className={styles.cardSurface}
        onClick={onCardClick}
        style={{
          background: modeTokens.gradient,
          borderColor: theme.border,
          cursor: onCardClick ? "pointer" : "default",
        }}
      >
        {/* Top Header Strip */}
        <div className={styles.headerStrip}>
          <div className={styles.bankAndBadges}>
            <span className={styles.bankName}>
              {card?.bankName?.trim() || "Bank Name"}
            </span>
            <span
              className={styles.typeBadge}
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
              }}
            >
              {isDebit ? "DEBIT" : "CREDIT"}
            </span>

            {expiryStatus === "expired" && (
              <span
                className={styles.expiryBadge}
                style={{
                  color: colors.cards.expiry.expired.text,
                  backgroundColor: colors.cards.expiry.expired.bg,
                  borderColor: colors.cards.expiry.expired.border,
                }}
              >
                EXPIRED
              </span>
            )}

            {expiryStatus === "expiring_soon" && (
              <span
                className={styles.expiryBadge}
                style={{
                  color: colors.cards.expiry.expiringSoon.text,
                  backgroundColor: colors.cards.expiry.expiringSoon.bg,
                  borderColor: colors.cards.expiry.expiringSoon.border,
                }}
              >
                EXPIRING SOON
              </span>
            )}
          </div>

          <span
            className={styles.networkText}
            style={{ color: theme.badgeText }}
          >
            {network}
          </span>
        </div>

        {/* Metallic EMV Chip & Contactless Icon */}
        <div className={styles.chipRow}>
          <div
            className={styles.emvChip}
            style={{
              backgroundColor: theme.chip,
              borderColor: theme.chipBorder,
            }}
          >
            <div className={styles.emvChipLines} />
          </div>
          <span className={styles.contactlessIcon}>
            <WifiIcon
              sx={{
                fontSize: 20,
                color: theme.badgeText,
                transform: "rotate(90deg)",
              }}
            />
          </span>
        </div>

        {/* Card Number */}
        <div className={styles.numberRow}>{displayNumber}</div>

        {/* Footer: Cardholder, Expiry, CVV */}
        <div className={styles.footerRow}>
          <div className={`${styles.metaBlock} ${styles.metaHolder}`}>
            <span className={styles.metaLabel}>Card Holder</span>
            <span className={styles.metaValue}>
              {card?.cardHolderName?.trim() || "CARDHOLDER NAME"}
            </span>
          </div>

          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Expires</span>
            <span className={styles.metaMono}>
              {card?.expiry?.trim() || "MM/YY"}
            </span>
          </div>

          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>CVV</span>
            <span className={styles.metaMono}>{displayCvv}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Saved Cards Only) */}
      {!isPreview && showActions && (
        <div className={styles.actionsBar}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleToggleReveal}
            aria-label={isRevealed ? "Hide card details" : "Reveal card details"}
          >
            {isRevealed ? (
              <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
            ) : (
              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            )}
            <span>{isRevealed ? "Hide" : "Reveal"}</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleShare}
            aria-label="Share card details"
          >
            <ShareOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Share</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleEdit}
            aria-label="Edit card"
          >
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={handleDelete}
            aria-label="Delete card"
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
