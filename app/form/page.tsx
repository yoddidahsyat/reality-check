"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import AppShell from "@/components/layout/AppShell";
import ChatInput from "@/components/form/ChatInput";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import LottiePlayer from "@/components/lottie/LottiePlayer";
import hexAnimation from "@/app/assets/hex.json";
import { useFormData } from "@/context/FormContext";
import { markWalkthroughResume } from "@/lib/flow";
import { validateEmail, validateFirstName } from "@/lib/validation";
import styles from "./form.module.css";

/** 0 name · 1 email · 2 "thanks" intro · 3 submitting (3s Lottie wait, then results) */
type Step = 0 | 1 | 2 | 3;

const SUBMIT_WAIT_MS = 3000;

export default function FormPage() {
  // Keyed so the steps can start over from the first one (back from Results, restart):
  // Next keeps a visited screen's state, so a new key is what resets it.
  const { formKey } = useFormData();
  return <FormFlow key={formKey} />;
}

function FormFlow() {
  const router = useRouter();
  const { data, update } = useFormData();
  const [step, setStep] = useState<Step>(0);
  const [error, setError] = useState<string | null>(null);
  const content = useRef<HTMLDivElement>(null);

  // Animate each step in
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !content.current) return;
    const tween = gsap.fromTo(content.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    return () => {
      tween.kill();
    };
  }, [step]);

  // After the form is submitted, wait 3 seconds (animation + message), then show the results.
  // Leaving the step (e.g. the back button) clears the timer, which cancels the submit.
  useEffect(() => {
    if (step !== 3) return;
    const timer = setTimeout(() => router.push("/results"), SUBMIT_WAIT_MS);
    return () => clearTimeout(timer);
  }, [step, router]);

  const goBack = () => {
    setError(null);
    if (step > 0) setStep((s) => (s - 1) as Step);
    else {
      markWalkthroughResume(); // coming back: the walkthrough opens on its last slide
      router.push("/walkthrough");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const message = step === 0 ? validateFirstName(data.firstName) : validateEmail(data.email);
    setError(message);
    if (message) return;
    update({ firstName: data.firstName.trim(), email: data.email.trim() });
    setStep((s) => (s + 1) as Step);
  };

  return (
    <AppShell onBack={goBack}>
      <div ref={content} className={styles.step} aria-live="polite">
        {/* Animated purple cube (Lottie), decorative; larger on the submitting screen */}
        {step < 3 && <LottiePlayer data={hexAnimation} className={styles.gem} />}

        {step === 0 && (
          <form onSubmit={submit} noValidate className={styles.form}>
            <p className={styles.prompt}>Let’s start with the basics. Type in your first name.</p>
            <ChatInput
              key="name"
              label="First name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              valid={validateFirstName(data.firstName) === null}
              value={data.firstName}
              onChange={(v) => {
                setError(null);
                update({ firstName: v });
              }}
              error={error}
              autoFocusField
            />
          </form>
        )}

        {step === 1 && (
          <form onSubmit={submit} noValidate className={styles.form}>
            <p className={styles.prompt}>How should we contact you? Type in your email address.</p>
            <ChatInput
              key="email"
              label="Email address"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              valid={validateEmail(data.email) === null}
              value={data.email}
              onChange={(v) => {
                setError(null);
                update({ email: v });
              }}
              error={error}
              autoFocusField
            />
          </form>
        )}

        {step === 2 && (
          <div className={styles.form}>
            <p className={styles.prompt}>Thanks, {data.firstName}! Now, it’s time to get a reality check.</p>
            <p className={`${styles.prompt} ${styles.second}`}>This will take 2-3 minutes.</p>
            <div className={styles.cta}>
              <Button variant="light" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.submitting} role="status">
            <LottiePlayer data={hexAnimation} className={styles.bigGem} />
            <p className={styles.submittingTitle}>Hold tight, {data.firstName}!</p>
            <p className={styles.submittingText}>We’re comparing your thoughts with people in your industry.</p>
            <ProgressBar duration={SUBMIT_WAIT_MS / 1000} label="Submitting your answers" className={styles.progress} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
