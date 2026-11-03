import { useSyncExternalStore } from "react";

/**
 * Tiny external store shared by the persistent cube (root layout) and the screens:
 *  - `introDone`: true once the cube's first Lottie pass has finished (Home fades its texts in then).
 *  - `settledPose`: which pose the cube has finished moving into; `null` while it is moving or
 *    fading in. Step 2 keeps its text hidden until this is "step2".
 * Lives at module level so it survives route changes.
 */
export type SettledPose = "home" | "step2" | "hidden" | null;

let introDone = false;
let settledPose: SettledPose = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const cubeStore = {
  getIntroDone: () => introDone,
  setIntroDone(value: boolean) {
    if (introDone === value) return;
    introDone = value;
    emit();
  },
  getSettledPose: () => settledPose,
  setSettledPose(value: SettledPose) {
    if (settledPose === value) return;
    settledPose = value;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useIntroDone() {
  return useSyncExternalStore(cubeStore.subscribe, cubeStore.getIntroDone, () => false);
}

export function useSettledPose() {
  return useSyncExternalStore(cubeStore.subscribe, cubeStore.getSettledPose, () => null);
}
