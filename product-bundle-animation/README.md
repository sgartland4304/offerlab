# Product Bundle Animation

A marketing visual prototype for the OfferLab website that shows three
products coming together to create a bundle.

Reference: [Figma — WWW Refresh / Apr 26 — Frame 2148:713](https://www.figma.com/design/eAtMjdmjuTLbAVhzOEq1gs/WWW-Refresh-%7C-Apr--26?node-id=2148-713)

## Animation sequence

1. **Still frame.** The scene loads in the exact composition from Figma:
   the Touchland mist (rotated +26°), Stanley tumbler (rotated -18°),
   power bank (rotated +18°), the brown rounded "Create bundle" button
   on top, and the magenta cursor resting over the right edge of the button.
2. **Reset.** After a brief beat the scene clears.
3. **Playful entrance.** Each product flies into view from a different
   off-screen direction with a spin and a slight overshoot, settling into
   its final Figma rotation (Touchland from the lower-left, Stanley from
   below, power bank from the lower-right).
4. **Button pops in.** The "Create bundle" button springs into place with
   a back-out ease.
5. **Cursor reveal.** The magenta cursor fades in and slides over the button.
6. **Tap.** The cursor nudges down/right while the button scales down to ~0.94
   and back to 1, and a white ripple expands from the tap point.
7. **Merge.** All three products spin (720°) toward the center of the canvas
   and shrink to nothing. The CTA and cursor fade out at the same time.
8. **Bundle reveal.** A soft yellow burst flashes from the center, then the
   final bundle image scales in as a rounded rectangle (1:1) with a bouncy
   back-out ease, then idles with a gentle float.
9. **Replay.** A "Replay ▶" button in the top-right re-runs the sequence.

## Files

```
product-bundle-animation/
├── index.html          # Full prototype (HTML + CSS animations + small JS controller)
├── README.md
└── assets/
    └── bundle.png      # ← drop your Kive.ai-generated bundle image here
```

## Assets

- **Product images and cursor** are referenced directly from the Figma
  asset CDN (the URLs returned by the Figma MCP server). They are valid
  for ~7 days after the design context was fetched. To make this prototype
  permanent, download those four images and drop them into `assets/` then
  swap the `src` attributes in `index.html`:

  | Element                  | Figma asset URL                                                                  |
  | ------------------------ | -------------------------------------------------------------------------------- |
  | Touchland mist           | `https://www.figma.com/api/mcp/asset/85fc2288-781c-4844-a2f1-23330ae812d8`       |
  | Stanley tumbler          | `https://www.figma.com/api/mcp/asset/77f9a66d-9414-4a7d-a7d1-7eecdbb5540a`       |
  | Power bank               | `https://www.figma.com/api/mcp/asset/f52da0ac-0b60-47e7-9689-36c41aa302a7`       |
  | Cursor (used as fallback)| `https://www.figma.com/api/mcp/asset/6b876da4-59de-4afc-8ca6-8a5a8ff5b2bb`       |

  The cursor in this prototype is also drawn inline as an SVG (so it
  doesn't depend on the Figma asset URL) and styled to match the magenta
  Figma cursor.

- **Bundle image.** The reveal at the end uses `assets/bundle.png`.
  Copy your Kive.ai-generated file into that location:

  ```bash
  mkdir -p assets
  cp "/Users/skg/Desktop/OfferLab Protoypes/product-bundle-floating-showcase/Generated with Kive.ai - Create a product bundle image showcasing these products together . (1).png" assets/bundle.png
  ```

## Running

It's a single static file. Just open it in a browser:

```bash
open index.html
```

Or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/product-bundle-animation/
```

## Reduced motion

If the user prefers reduced motion, all animations are disabled and the
scene stays in its still Figma composition.
