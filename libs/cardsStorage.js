/**
 * Card utilities, validation, network detection, expiry status, and localStorage persistence.
 */

export const CARDS_STORAGE_KEY = "savedCards";

/**
 * Strip all non-digit characters from a card number string.
 */
export function sanitizeCardNumber(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 16);
}

/**
 * Auto-detect card network from card number digits.
 * Supports Visa, Mastercard, RuPay, Amex, or generic Card.
 */
export function detectCardNetwork(cardNumber = "") {
  const digits = sanitizeCardNumber(cardNumber);
  if (!digits) return "Card";

  // Amex: starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return "Amex";
  }

  // Visa: starts with 4
  if (/^4/.test(digits)) {
    return "Visa";
  }

  // RuPay: common BIN ranges (60, 652x, 81, 82, 508)
  if (/^(60|652\d|81|82|508)/.test(digits)) {
    return "RuPay";
  }

  // Mastercard: 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return "Mastercard";
  }

  return "Card";
}

/**
 * Format digits into groups of 4 (e.g. "1234 5678 9012 3456").
 */
export function formatCardNumberGrouped(value = "") {
  const digits = sanitizeCardNumber(value);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/**
 * Mask a card number for display, revealing only the last 4 digits.
 * Example: "•••• •••• •••• 1234"
 */
export function maskCardNumber(value = "") {
  const digits = sanitizeCardNumber(value);
  if (!digits) return "•••• •••• •••• ••••";
  const last4 = digits.slice(-4).padStart(4, "•");
  return `•••• •••• •••• ${last4}`;
}

/**
 * Format expiry input as MM/YY with automatic slash insertion.
 */
export function formatExpiryInput(value = "") {
  const digits = String(value).replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Mask CVV digits (e.g. "•••" or "••••").
 */
export function maskCvv(cvv = "") {
  const len = String(cvv).replace(/\D/g, "").length;
  return "•".repeat(len === 4 ? 4 : 3);
}

/**
 * Parse MM/YY against the current month and return expiry status:
 * - "expired" if past expiry
 * - "expiring_soon" if expiring within the current month or next 2 months
 * - null otherwise
 */
export function getCardExpiryStatus(expiry = "") {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(expiry).trim());
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);

  if (month < 1 || month > 12) return null;

  const now = new Date();
  const currentTotalMonths = now.getFullYear() * 12 + (now.getMonth() + 1);
  const expiryTotalMonths = year * 12 + month;
  const diff = expiryTotalMonths - currentTotalMonths;

  if (diff < 0) return "expired";
  if (diff <= 2) return "expiring_soon";
  return null;
}

/**
 * Validate card form fields and return { isValid, errors }.
 */
export function validateCardForm(values) {
  const errors = {};
  const bankName = String(values.bankName || "").trim();
  const cardHolderName = String(values.cardHolderName || "").trim();
  const cardDigits = sanitizeCardNumber(values.cardNumber);
  const expiry = String(values.expiry || "").trim();
  const cvv = String(values.cvv || "").replace(/\D/g, "");

  if (!bankName) {
    errors.bankName = "Bank name is required";
  }

  if (!cardHolderName) {
    errors.cardHolderName = "Cardholder name is required";
  }

  if (cardDigits.length < 13 || cardDigits.length > 16) {
    errors.cardNumber = "Card number must be 13 to 16 digits";
  }

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!expiryMatch) {
    errors.expiry = "Enter expiry as MM/YY";
  } else {
    const mm = parseInt(expiryMatch[1], 10);
    if (mm < 1 || mm > 12) {
      errors.expiry = "Month must be between 01 and 12";
    }
  }

  if (cvv.length < 3 || cvv.length > 4) {
    errors.cvv = "CVV must be 3 or 4 digits";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Load saved cards from localStorage safely.
 */
export function loadSavedCards() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load saved cards:", err);
    return [];
  }
}

/**
 * Persist cards array to localStorage safely.
 */
export function saveCardsToStorage(cards) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error("Failed to save cards:", err);
  }
}

/**
 * Build shareable card summary text, strictly excluding CVV.
 */
export function buildCardShareText(card) {
  const typeLabel = card.cardType === "debit" ? "Debit Card" : "Credit Card";
  const formattedNumber = formatCardNumberGrouped(card.cardNumber);
  return [
    `${card.bankName} (${typeLabel})`,
    `Network: ${card.network || detectCardNetwork(card.cardNumber)}`,
    `Cardholder: ${card.cardHolderName}`,
    `Card Number: ${formattedNumber}`,
    `Expiry: ${card.expiry}`,
  ].join("\n");
}

/**
 * Format backup filename matching mobile app: Cards_Backup_DD-MM-YYYY_HHMMSS.json
 */
export function getCardsBackupFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `Cards_Backup_${dd}-${mm}-${yyyy}_${hh}${min}${ss}.json`;
}

/**
 * Build backup JSON payload matching mobile app schema (version: 1).
 */
export function buildCardsBackupPayload(cards) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: Array.isArray(cards) ? cards : [],
  };
}

/**
 * Trigger browser download of cards backup JSON file.
 */
export function downloadCardsBackup(cards) {
  if (typeof window === "undefined") return { fileName: "" };
  const fileName = getCardsBackupFilename();
  const payload = buildCardsBackupPayload(cards);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { fileName };
}

/**
 * Parse and normalize a cards backup JSON string.
 * Supports { version, exportedAt, cards: [...] } or a raw array of cards.
 * Returns { cards, exportedAt } or throws an Error with a clear message.
 */
export function parseCardsBackupJson(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Invalid JSON file");
  }

  const rawCards = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.cards)
      ? parsed.cards
      : null;

  if (!rawCards) {
    throw new Error("Invalid backup format: missing cards array");
  }

  const normalized = [];
  for (let i = 0; i < rawCards.length; i++) {
    const item = rawCards[i];
    if (!item || typeof item !== "object") continue;

    const cleanNumber = sanitizeCardNumber(item.cardNumber);
    const bankName = String(item.bankName || "").trim();
    const cardHolderName = String(item.cardHolderName || "").trim();
    const expiry = String(item.expiry || "").trim();
    const cvv = String(item.cvv || "").replace(/\D/g, "").slice(0, 4);

    if (!bankName || cleanNumber.length < 13 || !expiry) {
      continue;
    }

    normalized.push({
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id.trim()
          : `card_${Date.now()}_${i}`,
      cardType: item.cardType === "debit" ? "debit" : "credit",
      bankName,
      cardHolderName: cardHolderName || "CARDHOLDER",
      cardNumber: cleanNumber,
      expiry,
      cvv: cvv || "000",
      network: item.network || detectCardNetwork(cleanNumber),
      createdAt: item.createdAt ?? Date.now(),
    });
  }

  if (normalized.length === 0) {
    throw new Error("No valid cards found in backup file");
  }

  return {
    cards: normalized,
    exportedAt: parsed?.exportedAt || null,
  };
}

