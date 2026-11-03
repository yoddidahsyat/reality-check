"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import GradientLottie from "@/components/lottie/GradientLottie";
import hexAnimation from "@/app/assets/hex.json";
import { useFormData } from "@/context/FormContext";
import styles from "./results.module.css";

export default function ResultsPage() {
  const router = useRouter();
  const { data, restart, restartForm } = useFormData();
  const root = useRef<HTMLDivElement>(null);
  const hasData = Boolean(data.firstName && data.email);

  // Nothing submitted (e.g. page refresh) → back to the start
  useEffect(() => {
    if (!hasData) router.replace("/");
  }, [hasData, router]);

  // Reveal: everything is hidden in CSS from the very first paint, and this layout effect (it
  // runs before paint, also when Next restores the screen) slides it all in, top to bottom.
  useLayoutEffect(() => {
    if (!hasData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-anim]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, [hasData]);

  if (!hasData) return null;

  return (
    <AppShell
      onBack={() => {
        restartForm(); // Next restores the form with its old step: make it start from the first step
        router.push("/form");
      }}
    >
      <div ref={root} className={styles.results}>
        <div data-anim className={styles.hexWrap}>
          {/* Same gradient cube as the homepage: the Lottie shape animation with the gradient inside it */}
          <GradientLottie data={hexAnimation} loop className={styles.hex} />
        </div>
        <h1 data-anim className={styles.title}>
          All done, {data.firstName}!
        </h1>
        <p data-anim className={styles.message}>
          Thanks for sharing your thoughts. Your reality check is on its way.
        </p>
        <dl data-anim className={styles.summary} aria-label="Your answers">
          <div className={styles.row}>
            <dt>First name</dt>
            <dd>{data.firstName}</dd>
          </div>
          <div className={styles.row}>
            <dt>Email address</dt>
            <dd>{data.email}</dd>
          </div>
        </dl>
        <div data-anim className={styles.cta}>
          <Button
            variant="light"
            onClick={() => {
              restart();
              router.push("/");
            }}
          >
            Start over
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
