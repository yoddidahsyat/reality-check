"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import GradientLottie from "@/components/lottie/GradientLottie";
import hexAnimation from "@/app/assets/hex.json";
import { useFormData } from "@/context/FormContext";
import { cubeStore } from "@/lib/cubeStore";
import styles from "./PersistentCube.module.css";

type Pose = "home" | "step2" | "hidden";

/** The Lottie canvas is 650px wide and its settled hexagon is ~578px of it. */
const HEX_RATIO = 578 / 650;

const poseFor = (pathname: string): Pose => (pathname === "/" ? "home" : pathname === "/walkthrough" ? "step2" : "hidden");

/**
 * Where the cube should be for a pose: the screen renders an invisible element marked
 * `data-cube-anchor="<pose>"` (its box is the cube's box) and the cube is moved/scaled onto it.
 * No pixel positions live here, so any layout — other widths, breakpoints, a desktop design —
 * only needs to place that anchor in CSS.
 */
function anchorPose(cube: HTMLElement, layer: HTMLElement, pose: Exclude<Pose, "hidden">) {
  const anchor = document.querySelector<HTMLElement>(`[data-cube-anchor="${pose}"]`);
  if (!anchor) return null;
  const a = anchor.getBoundingClientRect();
  if (!a.width) return null; // not displayed (e.g. a hidden, kept-alive screen)
  const l = layer.getBoundingClientRect();
  return {
    x: a.left + a.width / 2 - (l.left + l.width / 2),
    y: a.top + a.height / 2 - l.top,
    scale: a.width / (cube.offsetWidth * HEX_RATIO), // the hexagon, not the canvas, fills the anchor
  };
}

/**
 * One cube for the whole flow. It lives in the root layout, so it is not remounted on
 * navigation: the Lottie keeps playing while GSAP moves/scales it between screens' anchors.
 */
export default function PersistentCube() {
  const pathname = usePathname();
  const pose = poseFor(pathname);
  const { restartKey } = useFormData();
  const layer = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const introRan = useRef(-1); // restartKey the grow-in intro last played for
  const introTween = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    const layerEl = layer.current;
    if (!el || !layerEl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%" };

    // Home after (re)start: replay the intro from blank. `isActive` keeps this idempotent
    // if React re-runs the effect (e.g. StrictMode in dev) while the intro is already playing.
    const playIntro = pose === "home" && (introRan.current !== restartKey || !!introTween.current?.isActive());

    gsap.killTweensOf(el);

    if (pose === "hidden") {
      cubeStore.setSettledPose("hidden");
      gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.3 });
      return;
    }

    // `settledPose` is null while the cube is moving/fading and becomes the pose once it has
    // arrived; screens use it to hold their content back until the cube is done (step 2's text).
    const settle = () => cubeStore.setSettledPose(pose);
    cubeStore.setSettledPose(null);

    let resizeObserver: ResizeObserver | undefined;
    let waitForAnchor: MutationObserver | undefined;
    let giveUp: number | undefined;

    const start = (target: NonNullable<ReturnType<typeof anchorPose>>) => {
      if (playIntro) {
        introRan.current = restartKey;
        cubeStore.setIntroDone(false);
        gsap.set(el, { ...base, ...target, opacity: 1, scale: reduce ? target.scale : 0 });
        if (reduce) settle();
        else introTween.current = gsap.to(el, { scale: target.scale, duration: 1.4, ease: "power3.out", onComplete: settle });
      } else if (Number(gsap.getProperty(el, "opacity")) < 0.01) {
        // Landing directly here, or coming back from a screen without the cube: appear in place
        gsap.set(el, { ...base, ...target, opacity: 0 });
        gsap.to(el, { opacity: 1, duration: reduce ? 0 : 0.6, onComplete: settle });
      } else {
        // Moving between screens: same cube, scaled/moved smoothly onto the new anchor
        gsap.to(el, { ...target, opacity: 1, duration: reduce ? 0 : 1, ease: "power3.inOut", onComplete: settle });
      }

      // Once at rest, stay on the anchor when the layout changes (resize, breakpoint change).
      const follow = () => {
        if (cubeStore.getSettledPose() !== pose) return;
        const t = anchorPose(el, layerEl, pose);
        if (t) gsap.set(el, t);
      };
      resizeObserver = new ResizeObserver(follow);
      resizeObserver.observe(layerEl);
      // A scrollbar appearing/disappearing shifts the centred layout without resizing the layer
      // itself; the page's own width does change, so watch that too.
      resizeObserver.observe(document.documentElement);
      const anchorEl = document.querySelector(`[data-cube-anchor="${pose}"]`);
      if (anchorEl) resizeObserver.observe(anchorEl);
    };

    const target = anchorPose(el, layerEl, pose);
    if (target) {
      start(target);
    } else {
      // The screen's anchor isn't in the page yet: on a first visit or a refresh the screen's
      // content streams in after this effect runs. Wait for it to appear (settledPose stays null,
      // so the screen keeps its content hidden meanwhile) and then move the cube.
      waitForAnchor = new MutationObserver(() => {
        const t = anchorPose(el, layerEl, pose);
        if (!t) return;
        waitForAnchor?.disconnect();
        window.clearTimeout(giveUp);
        start(t);
      });
      waitForAnchor.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "hidden", "class"] });
      giveUp = window.setTimeout(() => {
        waitForAnchor?.disconnect();
        settle(); // this screen never rendered an anchor: don't leave it waiting forever
      }, 4000);
    }

    return () => {
      waitForAnchor?.disconnect();
      window.clearTimeout(giveUp);
      resizeObserver?.disconnect();
    };
  }, [pose, restartKey]);

  return (
    <div ref={layer} className={styles.layer} aria-hidden="true">
      <div ref={wrap} className={styles.cube}>
        <GradientLottie key={restartKey} data={hexAnimation} loop onComplete={() => cubeStore.setIntroDone(true)} />
      </div>
    </div>
  );
}
