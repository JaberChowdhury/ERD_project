import { NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import GIFEncoder from "gif-encoder-2";
import React from "react";
import { ExportSvgRenderer } from "../../../src/components/ExportSvgRenderer";

async function generateSvgString(payload: any, offset = 0) {
  const { tables, relationships, nodesLayout, settings, isDark, usedIcons } = payload;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(nodesLayout).forEach((node: any) => {
    if (node.x < minX) minX = node.x; if (node.y < minY) minY = node.y;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
    if (node.y + node.height > maxY) maxY = node.y + node.height;
  });
  
  const pad = 60;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);

  // Bypass Next.js static analyzer for react-dom/server
  const rds = "react-dom/server";
  const { renderToString } = await import(rds);

  const svgString = renderToString(
    React.createElement(ExportSvgRenderer, {
      settings, tables, relationships, nodesLayout, isDark, dashOffset: offset, width, height, minX, minY, usedIcons
    })
  );

  return { svgString, width, height };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload, options } = body;

    if (type === "svg") {
      const { svgString } = await generateSvgString(payload);
      return new NextResponse(svgString, {
        headers: { "Content-Type": "image/svg+xml" }
      });
    }

    if (type === "png") {
      const { svgString } = await generateSvgString(payload);
      const resvg = new Resvg(svgString, {
        fitTo: { mode: "zoom", value: options.scale || 2 },
        font: { loadSystemFonts: false }
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      return new NextResponse(pngBuffer as any, {
        headers: { "Content-Type": "image/png" }
      });
    }

    if (type === "gif") {
      const framesCount = options.framesCount || 15;
      const delay = options.delay || 66;
      const scale = options.scale || 1.5;

      const { width, height } = await generateSvgString(payload);
      const scaledWidth = Math.round(width * scale);
      const scaledHeight = Math.round(height * scale);

      const encoder = new GIFEncoder(scaledWidth, scaledHeight, "neuquant", true, framesCount);
      encoder.setDelay(delay);
      encoder.start();

      for (let i = 0; i < framesCount; i++) {
        const offset = -18 * (i / framesCount);
        const { svgString } = await generateSvgString(payload, offset);
        
        const resvg = new Resvg(svgString, {
          fitTo: { mode: "zoom", value: scale },
          font: { loadSystemFonts: false },
          background: payload.isDark ? "#020617" : "#f8fafc"
        });
        
        const pngData = resvg.render();
        // Resvg returns pixels in RGBA format, but GIFEncoder needs it.
        // Wait, GIFEncoder.addFrame takes a Canvas context or raw pixels array?
        // gif-encoder-2 accepts Uint8Array of pixels in addFrame(pixels).
        encoder.addFrame(pngData.pixels);
      }

      encoder.finish();
      const gifBuffer = encoder.out.getData();

      return new NextResponse(gifBuffer as any, {
        headers: { "Content-Type": "image/gif" }
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });

  } catch (error: any) {
    console.error("Export Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
