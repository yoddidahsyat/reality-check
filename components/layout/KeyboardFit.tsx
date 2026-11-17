"use client";

import { useEffect } from "react";

/**
 * Keeps the app inside the *visible* area while the on-screen keyboard is open.
 *
 * On phones the keyboard shrinks the visual viewport but not the layout viewport, so the browser
 * scrolls the whole page up to reveal the focused field and the header/prompt end up off screen.
 * While a text field is focused and the visual viewport is clearly smaller than the window, this
 * adds `keyboard-open` to <html> and publishes the visible height/offset as CSS variables; the
 * frame styles (AppFrame.module.css, AppShell.module.css) then pin the app to exactly that area,
 * so the content compresses above the keyboard and the input sits just on top of it.
 */
export default function KeyboardFit() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;

    const update = () => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      const open = typing && vv.height < window.innerHeight * 0.85;
      root.classList.toggle("keyboard-open", open);
      root.style.setProperty("--vvh", `${vv.height}px`);
      root.style.setProperty("--vvt", `${vv.offsetTop}px`);
      if (open && window.scrollY !== 0) window.scrollTo(0, 0);
    };
    // After blur the keyboard animates away; re-check once it's settled.
    const afterBlur = () => window.setTimeout(update, 150);

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", afterBlur);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", afterBlur);
      root.classList.remove("keyboard-open");
      root.style.removeProperty("--vvh");
      root.style.removeProperty("--vvt");
    };
  }, []);

  return null;
}
