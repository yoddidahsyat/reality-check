"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import type { AnimationItem } from "lottie-web";

interface Props {
  data: object;
  className?: string;
  /** Keep playing in a loop. `onComplete` still fires once, after the first pass. */
  loop?: boolean;
  /** Called once the first pass reaches its last frame (reduced motion: immediately). */
  onComplete?: () => void;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const GRADIENT_SRC = "/images/cube-gradient.jpg";

/**
 * Plays a Lottie shape animation but shows the gradient artwork *through* it.
 * The Lottie's layers are moved into an SVG <mask>, and the gradient bitmap is drawn
 * masked by them, so the gradient takes the animated outline of the Lottie shape.
 * Playback is driven by a GSAP tween (shares the GSAP ticker with the rest of the page).
 */
export default function GradientLottie({ data, className, loop = false, onComplete }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const maskId = `gl-mask-${useId().replace(/:/g, "")}`;
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
      const item = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: structuredClone(data),
      });
      anim = item;

      const setup = () => {
        if (cancelled) return;
        const svg = container.querySelector("svg");
        const layers = svg?.querySelector(":scope > g");
        if (!svg || !layers) return;
        const total = item.totalFrames;

        // 1) Layers → mask (white shapes), gradient image drawn through the mask
        const defs = svg.querySelector("defs") ?? svg.insertBefore(document.createElementNS(SVG_NS, "defs"), svg.firstChild);
        const style = document.createElementNS(SVG_NS, "style");
        style.textContent = `#${maskId} path { fill: #fff !important; }`;
        const mask = document.createElementNS(SVG_NS, "mask");
        mask.setAttribute("id", maskId);
        mask.setAttribute("maskUnits", "userSpaceOnUse");
        mask.setAttribute("x", "0");
        mask.setAttribute("y", "0");
        mask.setAttribute("width", "650");
        mask.setAttribute("height", "650");
        mask.appendChild(layers); // lottie keeps updating the moved elements by reference
        defs.append(style, mask);

        // 2) Size the gradient to the settled (last-frame) shape, like the Figma export:
        //    full shape height, ±3.7% beyond its width.
        item.goToAndStop(total - 1, true);
        const box = (mask.firstElementChild as SVGGraphicsElement).getBBox();
        const image = document.createElementNS(SVG_NS, "image");
        image.setAttribute("href", GRADIENT_SRC);
        image.setAttribute("preserveAspectRatio", "none");
        image.setAttribute("x", String(box.x - box.width * 0.037));
        image.setAttribute("y", String(box.y));
        image.setAttribute("width", String(box.width * 1.074));
        image.setAttribute("height", String(box.height));
        image.setAttribute("mask", `url(#${maskId})`);
        svg.appendChild(image);

        // 3) Play (or jump to the end with reduced motion)
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          completeRef.current?.();
          return;
        }
        item.goToAndStop(0, true);
        const proxy = { frame: 0 };
        let notified = false;
        const firstPassDone = () => {
          if (notified) return;
          notified = true;
          completeRef.current?.();
        };
        tween = gsap.to(proxy, {
          frame: total - 1,
          duration: total / item.frameRate,
          ease: "none",
          repeat: loop ? -1 : 0,
          onUpdate: () => item.goToAndStop(proxy.frame, true),
          onRepeat: firstPassDone, // looping: fires when the first pass wraps around
          onComplete: firstPassDone, // not looping: fires at the end
        });
      };

      if (item.isLoaded) setup();
      else item.addEventListener("DOMLoaded", setup);
    });

    return () => {
      cancelled = true;
      tween?.kill();
      anim?.destroy();
    };
  }, [data, maskId, loop]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
