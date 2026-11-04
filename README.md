# Juicebox – Reality Check

Mobile-first web app built from the Juicebox Figma design for the Frontend Developer Assessment (Next.js + TypeScript, CSS variables, reusable components, accessibility, GSAP and Lottie animations).

The design and assessment brief are not part of this repository.

**Flow:** Home → Walkthrough (3 slides) → Multistep form (first name, email, "thanks") → 3-second submitting screen → Results.

## Features
- **Home:** a gradient cube driven by a Lottie shape animation (the Lottie shapes act as an SVG mask over the gradient). It grows in from nothing, then the statements, title and button fade in. The statements scale up 1.5× on hover (mouse) or tap (touch; tap again, or tap elsewhere, to restore). Smooth scrolling with Lenis.
- **Walkthrough:** the *same* cube scales down to its step-2 size and keeps animating. Swiper slides only the text; each slide's letters fade from dim to white, first letter to last.
- **Form:** name and email with validation and accessible error messages; the submit arrow turns white when the value is valid. After the final "Continue", a submitting screen (Lottie, message, progress bar) waits 3 seconds, then shows the results.
- **Results:** reveal animation, the gradient cube and a summary of the answers.
- **Header:** back arrow (goes back a slide/step/screen) and a refresh icon that restarts the whole flow from a blank Home, without reloading the page.

## Stack
- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- CSS variables (tokens in `app/styles.css`) + CSS Modules
- GSAP (all animation; also drives the Lottie playhead), Lenis, lottie-web, Swiper

## Run locally
Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

```bash
pnpm lint
pnpm build && pnpm start
```

Best viewed at a mobile viewport (390×844, the design size); on desktop the app renders in a centered phone-width column.

## Structure
```
app/             routes: / , /walkthrough, /form, /results
  assets/        hex.json – the Lottie animation
  fonts/         local fonts (Sohne, PP Agrandir)
components/
  layout/        AppShell, Header, AppFrame, PersistentCube (the cube that lives across screens)
  lottie/        LottiePlayer (flat Lottie), GradientLottie (gradient shown through the Lottie)
  form/          ChatInput
  ui/            Button, IconButton, ProgressBar
  walkthrough/   Dots, FadeText (per-letter colour fade)
context/         FormContext – answers, plus restart / form-reset keys
lib/             validation rules, cubeStore (cube intro/settled state), flow (walkthrough resume)
providers/       LenisProvider
public/images/   logo, icons, cube-gradient.jpg (the gradient picture used inside the Lottie mask)
```

## How it works
- **One cube for the whole flow.** `PersistentCube` lives in the root layout, so it is not remounted on navigation. Each screen renders an invisible anchor (`data-cube-anchor="home"` / `"step2"`); GSAP measures it and moves/scales the cube onto it while the Lottie keeps looping, and it follows the anchor if the layout changes (resize, breakpoint). Screens read `lib/cubeStore` to wait for the cube (Home fades its texts in after the first Lottie pass; step 2 reveals its text once the cube has scaled down).
- **Gradient through a Lottie.** `GradientLottie` moves the Lottie's layers into an SVG `<mask>` and draws the gradient bitmap through it, so the gradient follows the animated outline. The bitmap is sized to the shape's final frame.
- **Restoring screens.** Cache Components keeps visited screens alive and restores their state. Animations therefore re-apply on every visit (layout effects), and flows that must start over use keys (`restartKey`, `formKey`) instead of assuming a fresh mount.

## Responsive notes
- The design is a single 390px column (max 430px, centred); there is no separate desktop layout yet. Queried: `prefers-reduced-motion`, `(hover: hover)`, and one size query — on windows at least 768px wide and 700px tall the page is exactly the window's height (no page scroll), with Home's gap above the button compressing to fit. Smaller or shorter windows keep the natural, scrollable height. The scrollbar's space is always reserved (`scrollbar-gutter: stable`) so screens don't shift.
- The Home stage (cube anchor + statements) is sized in percentages of its width, and the headline size is fluid, so it scales down to roughly 340px.
- For a desktop layout: add breakpoint overrides for the tokens in `app/styles.css`, place the `data-cube-anchor` elements in the new layout (the cube follows them, no positions to change in JS), and use `gsap.matchMedia()` for any per-breakpoint timelines.

## Accessibility
Semantic landmarks, labelled icon buttons, hidden-but-present input labels, `aria-invalid`/`aria-describedby` with `role="alert"` errors, visible `:focus-visible` rings, keyboard support in Swiper, `role="progressbar"` and `role="status"` on the submitting screen, and a screen-reader copy of the per-letter text. `prefers-reduced-motion` turns off the GSAP, Lenis and Lottie motion and shows the final states.

## Notes
- **Validation:** name required (2+ letters, letters/spaces/hyphens/apostrophes); email required and format-checked.
- **State:** the answers live in memory only; opening `/results` without submitting redirects to `/`.
- **Results screen** has no Figma frame; it follows the same visual language.
- **Fonts:** the font files in `app/fonts` come from the assessment package. Check their licences before publishing the repository or deploying it.
- `/walkthrough` is wrapped in `Suspense` because Swiper reads the current time during render, which Next's Cache Components mode requires to be streamed.
- `next.config.ts` runs only `app/styles.css` through the Tailwind loader; a blanket `*.css` rule would also swallow CSS Modules.
