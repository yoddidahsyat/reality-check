"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { useFormData } from "@/context/FormContext";
import { useIntroDone, useSettledPose } from "@/lib/cubeStore";
import styles from "./home.module.css";

const statements = [
  "WA businesses feel confident about future growth",
  "AI cant replace creativity",
  "Sales measure true success",
  "Human connection drives WA business",
  "The primary barrier to digital transformation is financial investment",
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const { restartKey } = useFormData();

  // Anchor the "technology" gradient to the whole headline box (as in the Figma fill):
  // size it to the headline's width and shift it back by the word's left offset.
  useLayoutEffect(() => {
    const h1 = root.current?.querySelector("h1");
    const word = h1?.querySelector<HTMLElement>(`.${styles.accent}`);
    if (!h1 || !word) return;
    const measure = () => {
      const box = h1.getBoundingClientRect();
      word.style.setProperty("--grad-w", `${box.width}px`);
      word.style.setProperty("--grad-x", `${box.left - word.getBoundingClientRect().left}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(h1);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Touching/clicking anywhere outside the statements restores any enlarged one to its original size.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest(`.${styles.statement}`)) return;
      root.current?.querySelectorAll<HTMLElement>(`.${styles.statement}[data-active]`).forEach((el) => {
        delete el.dataset.active;
      });
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // The cube itself lives in the root layout (PersistentCube) and plays its intro there.
  // `introDone` flips to true after its first Lottie pass; that's when the texts fade in.
  // The texts show only when the first Lottie pass is done AND the cube sits in its Home pose
  // (so coming back from step 2 they wait for the cube to finish travelling back).
  const introDone = useIntroDone();
  const settledPose = useSettledPose();
  const show = introDone && settledPose === "home";

  // Texts: hidden until the cube is ready, then statements → title → button.
  // Re-runs from blank on restart, and when Next restores this screen after a visit elsewhere.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.set([`.${styles.statement}`, `.${styles.headline}`, `.${styles.cta}`], { opacity: 0 });
        if (!show) return; // wait for the cube

        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          // Statements only fade (no movement) so they stay exactly where the design puts them
          .to(`.${styles.statement}`, { opacity: 1, duration: 0.9, stagger: 0.18 })
          // Then the title once the cube's texts are in, and the button after the title
          .fromTo(`.${styles.headline}`, { y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
          .fromTo(`.${styles.cta}`, { y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2");
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [restartKey, show]);

  return (
    <AppShell showBack={false}>
      <div ref={root} className={styles.home}>
        <div className={styles.stage}>
          <ul className={styles.statements} aria-label="What professionals are saying">
            {statements.map((s, i) => (
              <li
                key={s}
                className={`${styles.statement} ${styles[`s${i + 1}`]}`}
                // Touch / pen: first tap enlarges and keeps it, second tap restores it (mouse uses CSS :hover)
                onClick={(e) => {
                  if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
                  const el = e.currentTarget;
                  if (el.dataset.active === "true") delete el.dataset.active;
                  else el.dataset.active = "true";
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
        <h1 className={styles.headline}>
          Compare your thoughts on <span className={styles.accent}>technology</span> with current industry opinions.
        </h1>
        <Button href="/walkthrough" className={styles.cta}>
          Get a reality check
        </Button>
      </div>
    </AppShell>
  );
}
