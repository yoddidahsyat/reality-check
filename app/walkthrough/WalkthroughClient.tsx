"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Dots from "@/components/walkthrough/Dots";
import FadeText from "@/components/walkthrough/FadeText";
import { cubeStore, useSettledPose } from "@/lib/cubeStore";
import { clearWalkthroughResume, peekWalkthroughResume } from "@/lib/flow";
import styles from "./walkthrough.module.css";

const slides = [
  "Professionals around the world shared how they feel about technology and I’ve listened. Now it’s your turn.",
  "I’ll ask you a handful of meaningful questions and compare your responses with people in your industry.",
  "You’ll get insights into current industry sentiments and a reality check about technology in a few minutes. Deal? Great!",
];

// On every slide change the copy "reads itself": each letter fades from dim grey to white,
// first letter to last, as in the design (white up to the reading point, grey after it).
function animateIn(swiper: SwiperType) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const chars = swiper.slides[swiper.activeIndex]?.querySelectorAll("[data-char]");
  if (!chars?.length) return;
  gsap.killTweensOf(chars);
  gsap.fromTo(
    chars,
    { color: "#858689" },
    { color: "#fafafa", duration: 0.5, ease: "power1.out", stagger: { amount: 2.2 } }, // 2.2s sweep regardless of text length
  );
}

export default function WalkthroughClient() {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  // The text stays hidden until the cube has finished moving/scaling into its step-2 pose;
  // then it slides up and fades in (same motion as the Home title: 16px, 0.8s, power2.out)
  // while the first slide starts reading itself.
  // Next keeps previous screens alive (hidden) and restores them on return, so inline styles from an
  // earlier visit would still be there: this layout effect runs on every (re)mount and whenever
  // `ready` changes, and always re-applies the right state before paint.
  const ready = useSettledPose() === "step2";
  useLayoutEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    gsap.killTweensOf(swiper.el);

    if (!ready) {
      // Hidden until the cube has settled. Each visit opens on the first slide, except when
      // coming back from the form, which resumes on the last one.
      gsap.set(swiper.el, { opacity: 0, y: 16 });
      const target = peekWalkthroughResume() ? slides.length - 1 : 0;
      if (swiper.activeIndex !== target) swiper.slideTo(target, 0);
      return;
    }
    clearWalkthroughResume();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(swiper.el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(swiper.el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
    animateIn(swiper);
    return () => {
      gsap.killTweensOf(swiper.el);
    };
  }, [ready]);

  // Use the Swiper's real position, not React state: Next can restore this screen with a fresh
  // Swiper while old state is still around, which made the back button do nothing.
  const goBack = () => {
    const swiper = swiperRef.current;
    if (swiper && !swiper.destroyed && swiper.activeIndex > 0) swiper.slidePrev();
    else router.push("/");
  };

  return (
    <AppShell onBack={goBack}>
      {/* The cube above the text is the persistent one from the root layout (PersistentCube);
          only the copy is swiped. */}
      <Swiper
        className={styles.swiper}
        modules={[A11y, Keyboard]}
        keyboard={{ enabled: true }}
        a11y={{ slideLabelMessage: "Step {{index}} of {{slidesLength}}" }}
        onSwiper={(s) => {
          swiperRef.current = s; // first play is triggered by the effect above once the cube settles
          setIndex(s.activeIndex); // a restored screen gets a fresh Swiper: re-sync the slide state
        }}
        onSlideChange={(s) => {
          setIndex(s.activeIndex);
          if (cubeStore.getSettledPose() === "step2") animateIn(s);
        }}
      >
        {slides.map((text) => (
          <SwiperSlide key={text} className={styles.slide}>
            <FadeText text={text} className={styles.text} />
          </SwiperSlide>
        ))}
      </Swiper>

      <Dots count={slides.length} active={index} className={styles.dots} />

      {isLast ? (
        <Button variant="light" onClick={() => router.push("/form")}>
          Get started
        </Button>
      ) : (
        <Button variant="outline" onClick={() => swiperRef.current?.slideNext()}>
          Continue
        </Button>
      )}
    </AppShell>
  );
}

