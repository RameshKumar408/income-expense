const activePills = new Set();

export function cleanupFlyingPills() {
  activePills.forEach((el) => {
    try {
      el.remove();
    } catch (e) {}
  });
  activePills.clear();
}

export function animatePillToInput({
  sourceEl,
  targetInputEl,
  text,
  onComplete,
}) {
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
      duration: 350,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    },
  );

  const finish = () => {
    onComplete?.();
    activePills.delete(flyingPill);
    try {
      flyingPill.remove();
    } catch (e) {}

    const containerEl =
      targetInputEl.closest(".MuiOutlinedInput-root") ||
      targetInputEl.parentElement ||
      targetInputEl;

    if (containerEl) {
      // 1. Hardware-accelerated Web Animations API directly on input container
      try {
        containerEl.animate(
          [
            {
              boxShadow:
                "inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 0 rgba(212, 160, 23, 0)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            },
            {
              boxShadow:
                "inset 0 1px 4px rgba(255, 255, 255, 0.35), 0 0 32px rgba(212, 160, 23, 0.9), 0 0 16px rgba(255, 215, 0, 0.8)",
              backgroundColor: "rgba(212, 160, 23, 0.18)",
            },
            {
              boxShadow:
                "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
            },
          ],
          {
            duration: 1000,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
        );
      } catch (e) {}

      // 2. Animate fieldset outline where MUI actually renders the border
      const fieldsetEl = containerEl.querySelector("fieldset");
      if (fieldsetEl) {
        try {
          fieldsetEl.animate(
            [
              {
                borderColor: "rgba(212, 160, 23, 0.45)",
                borderWidth: "1.5px",
              },
              {
                borderColor: "#ffd700",
                borderWidth: "2.5px",
              },
              {
                borderColor: "rgba(212, 160, 23, 0.45)",
                borderWidth: "1.5px",
              },
            ],
            {
              duration: 1000,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
          );
        } catch (e) {}
      }

      // 3. Fallback CSS animation class with reflow
      containerEl.classList.remove("input-arrival-glow");
      void containerEl.offsetWidth; // Force reflow
      containerEl.classList.add("input-arrival-glow");
      setTimeout(() => {
        containerEl.classList.remove("input-arrival-glow");
      }, 1200);
    }
  };

  animation.onfinish = finish;
  animation.oncancel = finish;
}
