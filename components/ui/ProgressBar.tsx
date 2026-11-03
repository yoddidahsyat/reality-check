"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./ProgressBar.module.css";

interface Props {
  /** Seconds it takes to fill from 0 to 100%. */
  duration: number;
  /** Accessible name, e.g. "Submitting your answers". */
  label: string;
  className?: string;
}

/** Time-based progress bar: the fill grows linearly over `duration`, exposed as a progressbar. */
export default function ProgressBar({ duration, label, className = "" }: Props) {
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = bar.current;
    const el = fill.current;
    if (!track || !el) return;
    const progress = { value: 0 };
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration,
        ease: "none",
        onUpdate: () => {
          // scaleX is the current fraction; mirror it in aria-valuenow without re-rendering
          progress.value = Math.round(Number(gsap.getProperty(el, "scaleX")) * 100);
          track.setAttribute("aria-valuenow", String(progress.value));
        },
      },
    );
    return () => {
      tween.kill();
    };
  }, [duration]);

  return (
    <div
      ref={bar}
      className={`${styles.track} ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div ref={fill} className={styles.fill} />
    </div>
  );
}
