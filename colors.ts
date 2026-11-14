/**
 * Centralized Design System Colors for Expenses Tracker
 * Single source of truth for all color values across the application.
 */

/**
 * Utility to compute rgba string from a hex color and alpha opacity (0 to 1).
 * Supports 3-digit (#RGB), 6-digit (#RRGGBB), and 8-digit (#RRGGBBAA) hex codes.
 */
export function alpha(hex: string, opacity: number): string {
  if (!hex || hex.startsWith("rgba")) return hex;
  const clean = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const palette = {
  // Brand & Gold Theme (Original Gold Palette)
  gold: "#d4a017",
  goldLight: "#ffd88a",
  goldDark: "#805200",
  goldHover: "#e5a92a",
  goldHoverDark: "#ad7622",
  goldDarkAccent: "#1a1000",
  goldDarkMuted: "#744a00",

  // Neutrals & Surface Dark Tones
  black: "#000000",
  dark0a: "#0a0a0a",
  dark14: "#141414",
  dark16: "#161618",
  dark18: "#181818",
  dark20: "#202024",
  white: "#ffffff",
  gray8f: "#8f8f93",
  gray66: "#666666",
  gray7c: "#7c7365",

  // Reds / Expenses
  redExpense: "#ff455b",
  redAlt: "#ff3043",
  redHover: "#e03248",
  redChart: "#ff3053",
  redToast: "#ff5252",
  redDark: "#d32f2f",
  pinkSoft: "#ff6b81",

  // Blues & Purples
  blueInfo: "#3b82f6",
  blueDeep: "#1d4ed8",
  blueSky: "#55acee",
  purpleViolet: "#8b5cf6",
  purpleAlt: "#5f27cd",
  violetBright: "#e056fd",
  indigoSoft: "#686de0",

  // Warnings / Oranges
  orangeWarning: "#f59e0b",
  orangeWarm: "#ff9f43",

  // Alpha / Transparent Glass & Overlays
  blackOverlay30: "rgba(0, 0, 0, 0.3)",
  blackOverlay72: "rgba(0, 0, 0, 0.72)",
  blackOverlay85: "rgba(0, 0, 0, 0.85)",
  darkModal95: "rgba(15, 15, 15, 0.95)",
  darkGlass75: "rgba(15, 15, 15, 0.75)",

  get goldAlpha15(): string {
    return alpha(this.gold, 0.15);
  },
  get goldAlpha25(): string {
    return alpha(this.gold, 0.25);
  },
  get goldAlpha30(): string {
    return alpha(this.gold, 0.3);
  },
  get goldAlpha45(): string {
    return alpha(this.gold, 0.45);
  },
  get goldAlpha50(): string {
    return alpha(this.gold, 0.5);
  },
  get goldAlpha65(): string {
    return alpha(this.gold, 0.65);
  },
  get goldAlpha80(): string {
    return alpha(this.gold, 0.8);
  },

  whiteAlpha08: "rgba(255, 255, 255, 0.08)",
  whiteAlpha10: "rgba(255, 255, 255, 0.1)",
  whiteAlpha15: "rgba(255, 255, 255, 0.15)",

  get redSubtle20(): string {
    return alpha(this.redChart, 0.2);
  },
};

export const colors = {
  // Brand & Gold Theme
  brand: {
    primary: palette.gold,
    highlight: palette.goldLight,
    shadow: palette.goldDark,
    hover: palette.goldHover,
    hoverDark: palette.goldHoverDark,
    darkAccent: palette.goldDarkAccent,
    darkMuted: palette.goldDarkMuted,
  },

  // Backgrounds
  background: {
    base: palette.black,
    surface: palette.dark0a,
    surfaceElevated: palette.dark14,
    surfaceHigh: palette.dark18,
    surfaceAlt: palette.dark16,
    surfaceLight: palette.dark20,
    surfaceModal: palette.darkModal95,
    surfaceGlass: palette.darkGlass75,
    overlay: palette.blackOverlay72,
    overlayDark: palette.blackOverlay85,
    overlayLight: palette.blackOverlay30,
  },

  // Typography
  text: {
    primary: palette.white,
    secondary: palette.gray8f,
    muted: palette.gray66,
    placeholder: palette.gray7c,
    inverse: palette.goldDarkAccent,
    gold: palette.gold,
    goldLight: palette.goldLight,
  },

  // Semantic Status & Actions
  semantic: {
    income: palette.gold,
    incomeSubtle: palette.goldAlpha25,

    expense: palette.redExpense,
    expenseAlt: palette.redAlt,
    expenseHover: palette.redHover,
    expenseChart: palette.redChart,
    expenseSubtle: palette.redSubtle20,

    warning: palette.orangeWarning,
    warningLight: palette.goldLight,
    warningOrange: palette.orangeWarm,

    success: palette.gold,
    successAlt: palette.goldHover,

    error: palette.redToast,
    errorDark: palette.redDark,

    info: palette.blueInfo,
    infoDeep: palette.blueDeep,
    infoAlt: palette.blueSky,

    purple: palette.purpleViolet,
    purpleAlt: palette.purpleAlt,
  },

  // Borders & Outlines
  border: {
    subtle: palette.goldAlpha15,
    input: palette.goldAlpha45,
    inputHover: palette.goldAlpha65,
    inputFocus: palette.goldAlpha80,
    gold: palette.gold,
    divider: palette.whiteAlpha08,
    dividerBright: palette.whiteAlpha15,
    glass: palette.whiteAlpha10,
  },

  // Liquid Glass & Shadows
  glass: {
    background: palette.darkGlass75,
    border: palette.goldAlpha45,
    borderFocus: palette.goldAlpha80,
    highlight: palette.whiteAlpha10,
    shadow: palette.goldAlpha25,
    glow: palette.goldAlpha30,
    glowStrong: palette.goldAlpha50,
  },

  // Chart Color Palette
  chart: {
    pie: [
      palette.gold,
      palette.redExpense,
      palette.blueInfo,
      palette.purpleViolet,
      palette.orangeWarm,
      palette.blueSky,
      palette.pinkSoft,
      palette.violetBright,
      palette.indigoSoft,
    ],
    income: {
      border: palette.gold,
      background: palette.goldAlpha25,
    },
    expense: {
      border: palette.redChart,
      background: palette.redSubtle20,
    },
  },
};

/**
 * Returns an object of CSS variables suitable for passing directly to
 * the React style prop on <html> so it hydrates cleanly with zero mismatch.
 */
export function getCssVariablesObject(): Record<string, string> {
  return {
    "--color-brand-primary": colors.brand.primary,
    "--color-brand-highlight": colors.brand.highlight,
    "--color-brand-shadow": colors.brand.shadow,
    "--color-brand-hover": colors.brand.hover,
    "--color-brand-hover-dark": colors.brand.hoverDark,
    "--color-brand-dark-accent": colors.brand.darkAccent,
    "--color-brand-dark-muted": colors.brand.darkMuted,

    "--color-bg-base": colors.background.base,
    "--color-bg-surface": colors.background.surface,
    "--color-bg-surface-elevated": colors.background.surfaceElevated,
    "--color-bg-surface-high": colors.background.surfaceHigh,
    "--color-bg-surface-alt": colors.background.surfaceAlt,
    "--color-bg-surface-light": colors.background.surfaceLight,
    "--color-bg-surface-modal": colors.background.surfaceModal,
    "--color-bg-surface-glass": colors.background.surfaceGlass,
    "--color-bg-overlay": colors.background.overlay,
    "--color-bg-overlay-dark": colors.background.overlayDark,
    "--color-bg-overlay-light": colors.background.overlayLight,

    "--color-text-primary": colors.text.primary,
    "--color-text-secondary": colors.text.secondary,
    "--color-text-muted": colors.text.muted,
    "--color-text-placeholder": colors.text.placeholder,
    "--color-text-inverse": colors.text.inverse,
    "--color-text-gold": colors.text.gold,
    "--color-text-gold-light": colors.text.goldLight,

    "--color-income": colors.semantic.income,
    "--color-income-subtle": colors.semantic.incomeSubtle,

    "--color-expense": colors.semantic.expense,
    "--color-expense-alt": colors.semantic.expenseAlt,
    "--color-expense-hover": colors.semantic.expenseHover,
    "--color-expense-chart": colors.semantic.expenseChart,
    "--color-expense-subtle": colors.semantic.expenseSubtle,

    "--color-warning": colors.semantic.warning,
    "--color-warning-light": colors.semantic.warningLight,
    "--color-warning-orange": colors.semantic.warningOrange,

    "--color-success": colors.semantic.success,
    "--color-success-alt": colors.semantic.successAlt,

    "--color-error": colors.semantic.error,
    "--color-error-dark": colors.semantic.errorDark,

    "--color-info": colors.semantic.info,
    "--color-info-deep": colors.semantic.infoDeep,
    "--color-info-alt": colors.semantic.infoAlt,

    "--color-purple": colors.semantic.purple,
    "--color-purple-alt": colors.semantic.purpleAlt,

    "--color-border-subtle": colors.border.subtle,
    "--color-border-input": colors.border.input,
    "--color-border-input-hover": colors.border.inputHover,
    "--color-border-input-focus": colors.border.inputFocus,
    "--color-border-gold": colors.border.gold,
    "--color-border-divider": colors.border.divider,
    "--color-border-divider-bright": colors.border.dividerBright,
    "--color-border-glass": colors.border.glass,

    "--color-glass-bg": colors.glass.background,
    "--color-glass-border": colors.glass.border,
    "--color-glass-border-focus": colors.glass.borderFocus,
    "--color-glass-highlight": colors.glass.highlight,
    "--color-glass-shadow": colors.glass.shadow,
    "--color-glass-glow": colors.glass.glow,
    "--color-glass-glow-strong": colors.glass.glowStrong,

    "--brand-gradient-start": colors.brand.highlight,
    "--brand-gradient-mid": colors.brand.primary,
    "--brand-gradient-end": colors.brand.shadow,

    "--bg-main": "var(--color-bg-base)",
    "--bg-card": "var(--color-bg-surface)",
    "--bg-card-elevated": "var(--color-bg-surface-elevated)",
    "--bg-input": "var(--color-bg-surface)",
    "--bg-pure-black": "var(--color-bg-base)",
    "--bg-dark-gray": "var(--color-bg-surface)",

    "--text-primary": "var(--color-text-primary)",
    "--text-secondary": "var(--color-text-gold)",
    "--text-placeholder": "var(--color-text-placeholder)",

    "--accent-expense": "var(--color-expense)",
    "--accent-expense-alt": "var(--color-expense-alt)",
    "--accent-expense-hover": "var(--color-expense-hover)",

    "--accent-income": "var(--color-income)",
    "--accent-income-hover": "var(--color-brand-shadow)",

    "--accent-warning": "var(--color-warning-light)",

    "--border-subtle": "var(--color-border-subtle)",
    "--border-input": "var(--color-border-input)",
    "--border-input-hover": "var(--color-border-input-hover)",

    "--toastify-color-dark": "var(--color-glass-bg)",
    "--toastify-toast-bd-radius": "16px",
    "--toastify-color-success": "var(--color-success)",
    "--toastify-color-error": "var(--color-error)",
    "--toastify-z-index": "999999",
  };
}

export function getCssVariablesCssString(): string {
  const vars = getCssVariablesObject();
  return Object.entries(vars)
    .map(([key, val]) => `${key}:${val};`)
    .join("");
}

export type BasePalette = typeof palette;
export type AppColors = typeof colors;
export default colors;
