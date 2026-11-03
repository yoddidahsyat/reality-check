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

/**
 * The cube is positioned at its Home size/place (centre y=305, 272px wide in the 390px design);
 * other screens are expressed as an offset + scale from that.
 * Step 2: centre y=258, 146px wide → y −47px, scale 146/272.
 */
const POSES = {
  home: { y: 0, scale: 1 },
  step2: { y: -47, scale: 146 / 272 },
} as const;

const poseFor = (pathname: string): Pose => (pathname === "/" ? "home" : pathname === "/walkthrough" ? "step2" : "hidden");

/**
 * One cube for the whole flow. It lives in the root layout, so it is not remounted on
 * navigation: the Lottie keeps playing while GSAP moves/scales it between screens.
 */
export default function PersistentCube() {
  const pathname = usePathname();
  const pose = poseFor(pathname);
  const { restartKey } = useFormData();
  const wrap = useRef<HTMLDivElement>(null);
  const introRan = useRef(-1); // restartKey the grow-in intro last played for
  const introTween = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%" };

    // Home after (re)start: replay the intro from blank. `isActive` keeps this idempotent
    // if React re-runs the effect (e.g. StrictMode in dev) while the intro is already playing.
    const playIntro = pose === "home" && (introRan.current !== restartKey || !!introTween.current?.isActive());

    gsap.killTweensOf(el);

    // `settledPose` is null while the cube is moving/fading and becomes the pose once it has
    // arrived; screens use it to hold their content back until the cube is done (step 2's text).
    const settle = () => cubeStore.setSettledPose(pose);

    if (pose === "hidden") {
      cubeStore.setSettledPose("hidden");
      gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.3 });
      return;
    }

    cubeStore.setSettledPose(null);

    if (playIntro) {
      introRan.current = restartKey;
      cubeStore.setIntroDone(false);
      gsap.set(el, { ...base, ...POSES.home, opacity: 1, scale: reduce ? 1 : 0 });
      if (reduce) settle();
      else introTween.current = gsap.to(el, { scale: 1, duration: 1.4, ease: "power3.out", onComplete: settle });
      return;
    }

    const target = POSES[pose];
    if (Number(gsap.getProperty(el, "opacity")) < 0.01) {
      // Landing directly here, or coming back from a screen without the cube: appear in place
      gsap.set(el, { ...base, ...target, opacity: 0 });
      gsap.to(el, { opacity: 1, duration: reduce ? 0 : 0.6, onComplete: settle });
    } else {
      // Moving between screens: same cube, scaled/moved smoothly
      gsap.to(el, { ...target, opacity: 1, duration: reduce ? 0 : 1, ease: "power3.inOut", onComplete: settle });
    }
  }, [pose, restartKey]);

  return (
    <div className={styles.layer} aria-hidden="true">
      <div ref={wrap} className={styles.cube}>
        <GradientLottie key={restartKey} data={hexAnimation} loop onComplete={() => cubeStore.setIntroDone(true)} />
      </div>
    </div>
  );
}
