# Export Engine

The export system is located in `src/lib/export.ts` and handles rendering the ERD graph into PNG, SVG, or animated GIF formats.

## Pure Native SVG Engine
The original export engine relied on `html-to-image` capturing a hidden DOM element, which was highly prone to browser memory limits, hardware acceleration bugs, and arbitrary sizing glitches. 

The application now uses a **100% Native SVG Pipeline** completely bypassing browser layout rendering:
1. **Mathematical Layout**: The graph's bounding box is computed from the Zustand layout store.
2. **Virtual Rendering**: Instead of reading the DOM, `react-dom/server` (via `renderToString`) is used to render `<ExportSvgRenderer>`—a pure, standalone React component made exclusively of mathematically positioned `<svg>`, `<rect>`, and `<path>` tags representing tables, borders, and curved connections.
3. **Data URI Translation**: The resulting raw SVG markup string is encoded into an `image/svg+xml` Blob.

## PNG Export
To generate a rasterized PNG:
1. The standalone SVG Blob is loaded into an isolated, off-screen HTML5 `Canvas`.
2. Due to browser memory limits, large ERDs exceeding hardware acceleration maximums (e.g. `16384px`) are mathematically downscaled to fit within safe limits before rasterization.
3. The canvas is drawn and exported using `.toDataURL('image/png')`.

## GIF Animation
For animated GIFs, the engine:
1. Translates the SVG string to slightly offset the dashed lines for each frame.
2. Rasterizes each frame onto a canvas and extracts a JPEG data string (`image/jpeg` with quality compression is used to prevent OOM errors for complex ERDs).
3. Passes the compressed frame array to `gifshot`, compiling them into a looping animation.

## Automated UI Testing
The export engine relies heavily on Playwright E2E tests (`tests/export.spec.ts`) to simulate the `ExportPreviewModal` and ensure regression-free PNG rendering flows.
