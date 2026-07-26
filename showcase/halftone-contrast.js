(() => {
  const STYLE_ID = "showcase-light-halftone-contrast";
  const LIGHT_BACKGROUND = "rgb(255, 255, 255)";
  const DOT_ALPHA = "54%";

  function boostLightHalftone(frame) {
    try {
      const doc = frame.contentDocument;
      const view = frame.contentWindow;
      const body = doc?.body;
      if (!doc || !view || !body) return;

      if (view.getComputedStyle(body).backgroundColor !== LIGHT_BACKGROUND) return;

      let style = doc.getElementById(STYLE_ID);
      if (!style) {
        style = doc.createElement("style");
        style.id = STYLE_ID;
        doc.head.append(style);
      }

      style.textContent = `
        body::before,
        body::after {
          background-image: radial-gradient(
            circle,
            rgb(17 17 17 / ${DOT_ALPHA}) 0 1px,
            transparent 1.2px
          ) !important;
          animation-name: showcase-halftone-radio-contrast !important;
        }

        @keyframes showcase-halftone-radio-contrast {
          0% {
            opacity: 0;
            transform: scale(.42);
          }

          14% {
            opacity: .36;
          }

          55% {
            opacity: .68;
          }

          82% {
            opacity: .32;
          }

          100% {
            opacity: 0;
            transform: scale(1.12);
          }
        }
      `;
    } catch {
      // Ignore frames that are temporarily unavailable while their source changes.
    }
  }

  function watchFrame(frame) {
    if (!(frame instanceof HTMLIFrameElement)) return;
    if (frame.dataset.halftoneContrastBound === "true") return;

    frame.dataset.halftoneContrastBound = "true";
    frame.addEventListener("load", () => boostLightHalftone(frame));

    if (frame.contentDocument?.readyState === "complete") {
      boostLightHalftone(frame);
    }
  }

  document.querySelectorAll(".preview-frame iframe").forEach(watchFrame);

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(".preview-frame iframe")) watchFrame(node);
        node.querySelectorAll?.(".preview-frame iframe").forEach(watchFrame);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
