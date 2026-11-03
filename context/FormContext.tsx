"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface FormData {
  firstName: string;
  email: string;
}

interface FormContextValue {
  data: FormData;
  update: (patch: Partial<FormData>) => void;
  reset: () => void;
  /** Clears the form and bumps `restartKey` so screens can replay their intro animation. */
  restart: () => void;
  restartKey: number;
  /** Changes whenever the form's steps must start over from the first step (data is kept). */
  formKey: number;
  restartForm: () => void;
}

const empty: FormData = { firstName: "", email: "" };
const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(empty);
  const update = useCallback((patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch })), []);
  const [restartKey, setRestartKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const reset = useCallback(() => setData(empty), []);
  const restartForm = useCallback(() => setFormKey((k) => k + 1), []);
  const restart = useCallback(() => {
    setData(empty);
    setRestartKey((k) => k + 1);
    setFormKey((k) => k + 1); // a restarted flow also opens the form on its first step
  }, []);
  const value = useMemo(
    () => ({ data, update, reset, restart, restartKey, formKey, restartForm }),
    [data, update, reset, restart, restartKey, formKey, restartForm],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormData() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormData must be used within FormProvider");
  return ctx;
}
