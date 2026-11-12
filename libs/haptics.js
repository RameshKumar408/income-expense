/**
 * Robust Cross-Platform Haptic Feedback Engine
 * - Native Vibration API for Android / Chrome
 * - iOS Taptic Engine bridge using an active, on-screen native switch element (<input type="checkbox" switch>)
 * - iOS Audio-Tactile Speaker Transient: Low-frequency sub-bass pulse (130Hz -> 35Hz) that physically kicks
 *   the iPhone speaker chassis, routed via navigator.audioSession 'playback' to bypass silent mode.
 * - Global polyfill for navigator.vibrate so all app vibration calls trigger tactile feedback on iOS.
 */

const nativeVibrate =
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
    ? navigator.vibrate.bind(navigator)
    : null;

let audioCtx = null;
let hapticBridgeLabel = null;
let hapticBridgeInput = null;

export function isHapticsEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("hapticsEnabled") !== "0";
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  // Force iOS to route audio to media playback so it plays even when mute switch is flipped
  if (typeof navigator !== "undefined" && "audioSession" in navigator) {
    try {
      navigator.audioSession.type = "playback";
    } catch (e) {}
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Ensures an active, visible-in-viewport (but invisible to eye) switch element exists
 * so WebKit evaluates it for native Taptic Engine feedback.
 */
function ensureHapticBridge() {
  if (typeof document === "undefined" || !document.body) return null;
  if (
    hapticBridgeLabel &&
    hapticBridgeInput &&
    document.body.contains(hapticBridgeLabel)
  ) {
    return hapticBridgeLabel;
  }

  const id = "ios-taptic-bridge";
  const existingInput = document.getElementById(id);
  const existingLabel = document.querySelector(`label[for="${id}"]`);
  if (existingInput && existingLabel) {
    hapticBridgeInput = existingInput;
    hapticBridgeLabel = existingLabel;
    return hapticBridgeLabel;
  }

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.id = id;
  // Position within the active viewport with near-zero opacity (not -9999px)
  // so WebKit's rendering tree keeps the control active
  input.style.position = "fixed";
  input.style.top = "0px";
  input.style.left = "0px";
  input.style.width = "1px";
  input.style.height = "1px";
  input.style.opacity = "0.001";
  input.style.zIndex = "-1";

  const label = document.createElement("label");
  label.htmlFor = id;
  label.setAttribute("aria-hidden", "true");
  label.style.position = "fixed";
  label.style.top = "0px";
  label.style.left = "0px";
  label.style.width = "1px";
  label.style.height = "1px";
  label.style.opacity = "0.001";
  label.style.zIndex = "-1";

  document.body.appendChild(input);
  document.body.appendChild(label);

  hapticBridgeInput = input;
  hapticBridgeLabel = label;
  return label;
}

/**
 * Fires the iOS switch toggle via a dispatched MouseEvent on the label.
 */
function triggerIOSSwitch() {
  try {
    const label = ensureHapticBridge();
    if (label) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      label.dispatchEvent(clickEvent);
    }
  } catch (e) {}
}

/**
 * Synthesizes a sharp 22ms low-frequency (130Hz -> 35Hz) mechanical pulse
 * through the iPhone speaker voice-coil, creating a palpable physical thump
 * in the phone chassis even on iOS versions where the switch hack is patched.
 */
function playTactileTransient(intensity = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.022);

    const safeIntensity = Math.max(0.2, Math.min(1, intensity));
    gain.gain.setValueAtTime(0.4 * safeIntensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch (e) {}
}

/**
 * Universal haptic trigger.
 * Accepts duration in ms (e.g. 15, 30, 50) or a pattern array [ms, pause, ms].
 */
export function triggerHaptic(pattern = 15) {
  if (typeof window === "undefined") return false;
  if (!isHapticsEnabled()) return false;

  // 1. Android / standard browsers with native Vibration API
  if (nativeVibrate) {
    try {
      nativeVibrate(pattern);
      return true;
    } catch (e) {}
  }

  // 2. iOS Safari / PWA Dual Feedback Engine
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS || !nativeVibrate) {
    const intensity = typeof pattern === "number" ? Math.min(1, pattern / 30) : 0.8;

    // Trigger native switch mechanism (for iOS 18.0 - 18.3 Taptic Engine)
    triggerIOSSwitch();

    // Trigger speaker motor tactile pulse (physical chassis thump for iOS 18.4+ / all iOS versions)
    playTactileTransient(intensity);

    // Multi-pulse pattern support (e.g. [30, 60, 30] for double tap)
    if (Array.isArray(pattern) && pattern.length > 2) {
      let delay = 0;
      for (let i = 2; i < pattern.length; i += 2) {
        delay += (pattern[i - 2] || 0) + (pattern[i - 1] || 0);
        setTimeout(() => {
          triggerIOSSwitch();
          playTactileTransient(intensity);
        }, delay);
      }
    } else if (typeof pattern === "number" && pattern >= 40) {
      // For longer patterns (e.g. 50ms), add a second micro-tap
      setTimeout(() => {
        triggerIOSSwitch();
        playTactileTransient(intensity * 0.7);
      }, 70);
    }
    return true;
  }

  return false;
}

// Global unlock on initial user touch to prime AudioContext and audioSession
if (typeof window !== "undefined") {
  const unlock = () => {
    try {
      getAudioContext();
      ensureHapticBridge();
    } catch (e) {}
  };

  window.addEventListener("touchstart", unlock, { passive: true, once: true });
  window.addEventListener("pointerdown", unlock, { passive: true, once: true });
  window.addEventListener("click", unlock, { passive: true, once: true });
}

// Polyfill navigator.vibrate globally
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
