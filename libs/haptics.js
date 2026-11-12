/**
 * Cross-platform Haptic Feedback Engine
 * - Native Vibration API for Android / Chrome
 * - Native Taptic Engine switch trigger (<input type="checkbox" switch>) for iOS Safari / WebKit PWA
 * - Polyfills navigator.vibrate globally so all vibration calls work transparently on iOS
 */

const nativeVibrate =
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
    ? navigator.vibrate.bind(navigator)
    : null;

export function isHapticsEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("hapticsEnabled") !== "0";
}

function triggerIOSSwitch() {
  if (typeof document === "undefined" || !document.body) return;
  try {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.position = "fixed";
    label.style.top = "-9999px";
    label.style.left = "-9999px";
    label.style.opacity = "0";
    label.style.pointerEvents = "none";
    label.style.width = "1px";
    label.style.height = "1px";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.style.opacity = "0";
    input.style.pointerEvents = "none";

    label.appendChild(input);
    document.body.appendChild(label);

    label.click();

    setTimeout(() => {
      label.remove();
    }, 100);
  } catch (e) {
    // Graceful fallback
  }
}

export function triggerHaptic(pattern = 15) {
  if (typeof window === "undefined") return false;
  if (!isHapticsEnabled()) return false;

  // If native navigator.vibrate is available (e.g. Android), use it
  if (nativeVibrate) {
    try {
      nativeVibrate(pattern);
      return true;
    } catch (e) {}
  }

  // iOS Safari / WebKit fallback via native Taptic switch mechanism
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS || !nativeVibrate) {
    if (typeof pattern === "number") {
      triggerIOSSwitch();
      // If a strong or long pattern was requested (> 30ms), provide a second micro-tap
      if (pattern >= 35) {
        setTimeout(triggerIOSSwitch, 80);
      }
    } else if (Array.isArray(pattern) && pattern.length > 0) {
      let delay = 0;
      for (let i = 0; i < pattern.length; i += 2) {
        const dur = pattern[i];
        const pause = pattern[i + 1] || 0;
        setTimeout(triggerIOSSwitch, delay);
        delay += dur + pause;
      }
    } else {
      triggerIOSSwitch();
    }
    return true;
  }

  return false;
}

// Polyfill navigator.vibrate so existing code using navigator.vibrate(...) works on iOS
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  if (!navigator.vibrate) {
    try {
      navigator.vibrate = function (pattern) {
        return triggerHaptic(pattern);
      };
    } catch (e) {
      try {
        Object.defineProperty(navigator, "vibrate", {
          value: function (pattern) {
            return triggerHaptic(pattern);
          },
          writable: true,
          configurable: true,
        });
      } catch (err) {}
    }
  }

  if (typeof Navigator !== "undefined" && !Navigator.prototype.vibrate) {
    try {
      Navigator.prototype.vibrate = function (pattern) {
        return triggerHaptic(pattern);
      };
    } catch (e) {}
  }
}

