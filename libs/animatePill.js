import { triggerHaptic } from "./haptics";

const activePills = new Set();

export function cleanupFlyingPills() {
  activePills.forEach((el) => {
    try {
      el.remove();
    } catch (e) {}
  });
  activePills.clear();
}

/**
 * Smoothly animates a suggestion chip pill to the target input field using
 * hardware-accelerated Web Animations API.
 */
export function animatePillToInput({
  sourceEl,
  targetInputEl,
  text,
  onComplete,
}) {
  triggerHaptic(12);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!sourceEl || !targetInputEl || prefersReducedMotion) {
    onComplete?.();
    return;
  }

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetInputEl.getBoundingClientRect();

  if (sourceRect.width === 0 || targetRect.width === 0) {
    onComplete?.();
    return;
  }

  // Remove any previously flying pills to prevent multi-pill overlap
  cleanupFlyingPills();

  const flyingPill = document.createElement("div");
  flyingPill.className = "flying-suggestion-pill";
  flyingPill.textContent = text;
  flyingPill.style.left = `${sourceRect.left}px`;
  flyingPill.style.top = `${sourceRect.top}px`;
  flyingPill.style.width = `${sourceRect.width}px`;
  flyingPill.style.height = `${sourceRect.height}px`;

  document.body.appendChild(flyingPill);
  activePills.add(flyingPill);

  // Target where text begins inside the input field
  const targetX = targetRect.left + 16 - sourceRect.left;
  const targetY =
    targetRect.top +
    (targetRect.height - sourceRect.height) / 2 -
    sourceRect.top;

  const scaleFactor = Math.min(
    1,
    Math.max(0.65, targetRect.height / sourceRect.height),
  );

  const animation = flyingPill.animate(
    [
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        opacity: 1,
        borderRadius: "999px",
      },
      {
        transform: `translate3d(${targetX * 0.45}px, ${targetY * 0.45}px, 0) scale(${1 - (1 - scaleFactor) * 0.3})`,
        opacity: 0.95,
        offset: 0.45,
      },
      {
        transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(${scaleFactor})`,
        opacity: 0,
        borderRadius: "14px",
      },
    ],
    {
      duration: 500,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    },
  );

  const finish = () => {
    activePills.delete(flyingPill);
    try {
      flyingPill.remove();
    } catch (e) {}

    onComplete?.();

    // Trigger arrival accent glow on the input container
    const containerEl =
      targetInputEl.closest(".MuiOutlinedInput-root") || targetInputEl;
    if (containerEl) {
      containerEl.classList.remove("input-arrival-glow");
      void containerEl.offsetWidth; // Force reflow
      containerEl.classList.add("input-arrival-glow");
      setTimeout(() => {
        containerEl.classList.remove("input-arrival-glow");
      }, 500);
    }

    triggerHaptic(10);
  };

  animation.onfinish = finish;
  animation.oncancel = finish;
}
