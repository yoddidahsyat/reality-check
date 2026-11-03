"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { AnimationItem } from "lottie-web";

interface Props {
  data: object;
  loop?: boolean;
  className?: string;
  /** Accessible description; omit for purely decorative animations. */
  label?: string;
  /** Called once a non-looping animation reaches its last frame. */
  onComplete?: () => void;
}

/**
 * Renders a Lottie animation whose playhead is driven by a GSAP tween,
 * so it shares the GSAP ticker (and Lenis) instead of lottie's own RAF loop.
 */
export default function LottiePlayer({ data, loop = true, className, label, onComplete }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let anim: AnimationItem | undefined;
    let tween: gsap.core.Tween | undefined;
    let cancelled = false;

    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled) return;
      anim = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: structuredClone(data),
      });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const total = anim.totalFrames;
      if (reduce) {
        anim.goToAndStop(total - 1, true);
        completeRef.current?.();
        return;
      }

      const proxy = { frame: 0 };
      const item = anim;
      tween = gsap.to(proxy, {
        frame: total - 1,
        duration: total / item.frameRate,
        ease: "none",
        repeat: loop ? -1 : 0,
        onUpdate: () => item.goToAndStop(proxy.frame, true),
        onComplete: () => completeRef.current?.(),
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      anim?.destroy();
    };
  }, [data, loop]);

  return (
    <div
      ref={ref}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
