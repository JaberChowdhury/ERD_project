# Export Engine

The export system is located in `src/lib/export.ts` and handles rendering the ERD graph into PNG, SVG, or animated GIF formats.

## The Problem with Browser Exports
Exporting a live React DOM via `html-to-image` is notoriously difficult when the element has been scaled, translated, or pushed outside the viewport bounds by a user zooming in or scrolling.

## DOM Isolation Pattern
To guarantee a 100% pixel-perfect capture without clipping, the export engine utilizes a **DOM Isolation Sequence**:

1. **Calculate Bounds**: The engine iterates through the Zustand `nodesLayout` to find the extreme X and Y coordinates (minX, minY, maxX, maxY), establishing the absolute bounding box of the graph.
2. **Clone Node**: The target DOM node (`#zoom-layer`) is cloned (`cloneNode(true)`).
3. **Hidden Wrapper**: A new `div` is appended to `document.body` positioned off-screen (e.g., `left: -9999px`). The unscaled width and height of the bounding box are strictly applied to this wrapper.
4. **Translate**: The clone is injected into the wrapper with a transform matrix of `translate(-minX, -minY)` to force the top-left of the bounding box strictly into the `(0,0)` origin of the wrapper.
5. **Capture**: `html-to-image` is then pointed strictly at this isolated, unscaled clone, guaranteeing that no browser optimization or viewport constraint interferes with the render.

## GIF Animation
For animated GIFs, the export engine:
1. Calculates multiple frame offsets for the dashed SVG relationship lines.
2. Iterates and captures a PNG frame for each offset using `html-to-image`.
3. Passes the array of base64 PNGs to `gifshot`, which compiles them into a smooth 60fps looping animation.
