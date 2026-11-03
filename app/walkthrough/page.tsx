import { Suspense } from "react";
import WalkthroughClient from "./WalkthroughClient";

export default function WalkthroughPage() {
  // Swiper reads the current time while rendering, which Cache Components
  // requires to be streamed rather than prerendered.
  return (
    <Suspense fallback={null}>
      <WalkthroughClient />
    </Suspense>
  );
}
