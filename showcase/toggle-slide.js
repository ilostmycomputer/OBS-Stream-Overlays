(() => {
  const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const sibling of buttons) {
        const active = sibling === button;
        sibling.classList.toggle("is-active", active);
        sibling.setAttribute("aria-pressed", String(active));
      }
    });
  }
})();
