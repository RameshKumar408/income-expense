"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { toast } from "react-toastify";
import GlowingBubbles from "@/components/GlowingBubbles";
import CardView from "@/components/CardView";
import CardTypeToggle from "@/components/CardTypeToggle";
import LiquidTextField from "@/components/LiquidTextField";
import PrimaryButton from "@/components/PrimaryButton";
import { useCards } from "@/app/context/CardsContext";
import {
  detectCardNetwork,
  formatCardNumberGrouped,
  formatExpiryInput,
  sanitizeCardNumber,
  validateCardForm,
} from "@/libs/cardsStorage";
import colors from "@/colors";
import "@/app/settings/cards/cards.css";

/**
 * Shared Add / Edit Card form page with live CardView preview,
 * CardTypeToggle, auto-grouped card number, network detection,
 * MM/YY auto-slash, and masked CVV.
 */
export default function CardFormPage({ cardId = null }) {
  const router = useRouter();
  const { isLoaded, getCardById, addCard, updateCard } = useCards();
  const isEditMode = Boolean(cardId);

  const [cardType, setCardType] = useState("credit");
  const [bankName, setBankName] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialized, setInitialized] = useState(!isEditMode);

  useEffect(() => {
    if (!isEditMode || !isLoaded || initialized) return;
    const existing = getCardById(cardId);
    if (!existing) {
      toast.error("Card not found");
      router.replace("/settings/cards");
      return;
    }
    setCardType(existing.cardType || "credit");
    setBankName(existing.bankName || "");
    setCardHolderName(existing.cardHolderName || "");
    setCardNumber(formatCardNumberGrouped(existing.cardNumber || ""));
    setExpiry(existing.expiry || "");
    setCvv(existing.cvv || "");
    setInitialized(true);
  }, [isEditMode, isLoaded, cardId, getCardById, initialized, router]);

  const detectedNetwork = detectCardNetwork(cardNumber);

  const previewCard = {
    cardType,
    bankName,
    cardHolderName,
    cardNumber,
    expiry,
    cvv: showCvv ? cvv : cvv ? "•".repeat(cvv.length) : "",
    network: detectedNetwork,
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumberGrouped(e.target.value);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryInput(e.target.value);
    setExpiry(formatted);
    if (errors.expiry) {
      setErrors((prev) => ({ ...prev, expiry: undefined }));
    }
  };

  const handleCvvChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(digits);
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      cardType,
      bankName,
      cardHolderName,
      cardNumber: sanitizeCardNumber(cardNumber),
      expiry,
      cvv,
    };

    const validation = validateCardForm(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    if (isEditMode) {
      updateCard(cardId, payload);
      toast.success("Card updated");
    } else {
      addCard(payload);
      toast.success("Card saved");
    }
    router.push("/settings/cards");
  };

  return (
    <div className="create-detail-page">
      <GlowingBubbles />
      <main className="cards-page-shell">
        <header className="cards-header">
          <div className="cards-header-left">
            <button
              type="button"
              className="cards-back-btn"
              onClick={() => router.push("/settings/cards")}
              aria-label="Back to Cards"
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
            </button>
            <div>
              <h1 className="cards-title">
                {isEditMode ? "Edit Card" : "Add Card"}
              </h1>
              <p className="cards-subtitle">
                {isEditMode
                  ? "Update your saved card details"
                  : "Saved locally on this device only"}
              </p>
            </div>
          </div>
        </header>

        {/* Live CardView Preview */}
        <div style={{ marginBottom: 20 }}>
          <CardView card={previewCard} isPreview />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Card Type Toggle */}
          <CardTypeToggle value={cardType} onToggle={setCardType} />

          {/* Bank Name */}
          <LiquidTextField
            fullWidth
            label="Bank Name"
            placeholder="e.g. HDFC Bank, Chase"
            value={bankName}
            onChange={(e) => {
              setBankName(e.target.value);
              if (errors.bankName) {
                setErrors((prev) => ({ ...prev, bankName: undefined }));
              }
            }}
            error={Boolean(errors.bankName)}
            helperText={errors.bankName}
            InputLabelProps={{
              style: { color: colors.text.secondary },
            }}
          />

          {/* Cardholder Name */}
          <LiquidTextField
            fullWidth
            label="Cardholder Name"
            placeholder="Name as on card"
            value={cardHolderName}
            onChange={(e) => {
              setCardHolderName(e.target.value);
              if (errors.cardHolderName) {
                setErrors((prev) => ({ ...prev, cardHolderName: undefined }));
              }
            }}
            error={Boolean(errors.cardHolderName)}
            helperText={errors.cardHolderName}
            InputLabelProps={{
              style: { color: colors.text.secondary },
            }}
          />

          {/* Card Number */}
          <LiquidTextField
            fullWidth
            label={`Card Number (${detectedNetwork})`}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            inputProps={{
              inputMode: "numeric",
              maxLength: 19,
            }}
            error={Boolean(errors.cardNumber)}
            helperText={errors.cardNumber}
            InputLabelProps={{
              style: { color: colors.text.secondary },
            }}
          />

          {/* Expiry & CVV Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <LiquidTextField
              fullWidth
              label="Expiry (MM/YY)"
              placeholder="MM/YY"
              name="card-expiry"
              autoComplete="off"
              value={expiry}
              onChange={handleExpiryChange}
              inputProps={{
                inputMode: "numeric",
                maxLength: 5,
                autoComplete: "off",
                "data-lpignore": "true",
                "data-form-type": "other",
              }}
              error={Boolean(errors.expiry)}
              helperText={errors.expiry}
              InputLabelProps={{
                style: { color: colors.text.secondary },
              }}
            />

            <LiquidTextField
              fullWidth
              label="CVV"
              placeholder="•••"
              name="card-cvv"
              type="text"
              autoComplete="off"
              value={cvv}
              onChange={handleCvvChange}
              inputProps={{
                inputMode: "numeric",
                maxLength: 4,
                autoComplete: "off",
                "data-lpignore": "true",
                "data-form-type": "other",
                style: {
                  WebkitTextSecurity: showCvv ? "none" : "disc",
                },
              }}
              error={Boolean(errors.cvv)}
              helperText={errors.cvv}
              InputLabelProps={{
                style: { color: colors.text.secondary },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() => setShowCvv((prev) => !prev)}
                      aria-label={showCvv ? "Hide CVV" : "Show CVV"}
                      edge="end"
                      sx={{ color: colors.text.secondary }}
                    >
                      {showCvv ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div style={{ marginTop: 6 }}>
            <PrimaryButton type="submit">
              {isEditMode ? "Update Card" : "Save Card"}
            </PrimaryButton>
          </div>
        </form>
      </main>
    </div>
  );
}
