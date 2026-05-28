# True-Size — Webcam Garment Calibrator

Stop guessing your size online. Hold a credit card (or A4 sheet) against your
chest, snap a webcam photo, and the browser computes your shoulder and chest
in inches — then tells you exactly what size to buy at Zara, H&M, Uniqlo,
Nike, and ASOS.

Built with Next.js 14, TypeScript, Tailwind. **Zero server**: the camera feed,
the captured frame, and every measurement live entirely in the browser tab.

## The trick

A credit card is one of the most standardized physical objects on Earth:
**85.6 mm × 53.98 mm** (ISO/IEC 7810 ID-1). A4 paper is **210 × 297 mm**.
Either one in the same frame as your body gives you a pixels-per-mm ratio,
which converts any other pixel distance in that frame to real units.

```
pixelsPerMm = cardPixelWidth / 85.6
shoulderMm  = shoulderPixelWidth / pixelsPerMm
shoulderIn  = shoulderMm / 25.4
```

## Run

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The app asks for camera permission on the
"Capture" step.

## Flow

1. **Intro** — pitch + how it works.
2. **Capture** — webcam preview, optional 3-second timer, snap.
3. **Calibrate** — drag a rectangle (locked to the card's aspect ratio) so its
   edges sit on your reference object. This sets `pixelsPerMm`.
4. **Measure** — click to drop four markers: left/right shoulder tips, left/right
   chest at the widest point. We compute shoulder width and chest
   circumference (front width × 2 as a fit-relevant approximation).
5. **Sizes** — match against built-in brand size charts and surface the
   recommended size with an affiliate-link slot per brand.

## Monetization

Each brand card is an `<a href={brand.affiliateUrl} rel="sponsored">`. Replace
the placeholder URLs in [`lib/sizeCharts.ts`](lib/sizeCharts.ts) with your real
affiliate links (Awin, Skimlinks, Rakuten, brand-direct, etc.).

## What this is NOT (yet)

- Not auto-detection: the user manually aligns the reference rectangle. This
  is more reliable than edge-detection for a v1 demo and avoids shipping an ML
  model.
- Not a perfect circumference: we report `front width × 2`, which is what most
  brand charts effectively want for tops. Cut-aware fit calls would need depth.
- Not a women's-specific bust chart yet. Add a category switch in the size
  charts and corresponding ranges.

## Limits

The webcam image is 2D. If the user isn't facing straight on, or the card
isn't on the same plane as the shoulders, the numbers drift. The dashed
center box in the capture step nudges the user to stand correctly.
