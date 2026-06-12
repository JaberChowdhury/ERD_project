import { useAppStore } from '../store/useAppStore';
import gifshot from 'gifshot';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExportSvgRenderer } from '../components/ExportSvgRenderer';
import { icons } from 'lucide-react';

export const triggerDownload = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const generateNativeSvgString = (dashOffset = 0): { svgString: string, width: number, height: number } => {
  const store = useAppStore.getState();
  const { tables, relationships, nodesLayout } = store;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(nodesLayout).forEach(node => {
    if (node.x < minX) minX = node.x; if (node.y < minY) minY = node.y;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
    if (node.y + node.height > maxY) maxY = node.y + node.height;
  });
  const pad = 60;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);
  const isDark = document.documentElement.classList.contains('dark');

  const renderIcon = (name: string, color: string, size: number) => {
    const pascalIcon = name.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    const IconComponent = icons[pascalIcon as keyof typeof icons] || icons["Table"];
    return React.createElement(IconComponent, { color, size });
  };

  const svgString = renderToString(
    React.createElement(ExportSvgRenderer, {
      settings: store.canvasSettings, tables, relationships, nodesLayout, isDark, dashOffset, width, height, minX, minY, renderIcon
    })
  );

  return { svgString, width, height };
}

export const downloadAsSvg = async () => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Generating SVG...', 50);
  store.addExportLog('[Process] Compiling pure SVG tree...');
  
  try {
    const { svgString } = generateNativeSvgString();
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    
    store.addExportLog('[Success] SVG Compiled. Opening preview...');
    store.setPreview(dataUrl, 'svg');
    store.setExportState(false);
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};

const svgToCanvas = (svgString: string, width: number, height: number, scale: number): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('No canvas context');
    
    const img = new Image();
    const svgBlob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n${svgString}`], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export const downloadAsPng = async (scale: number = 2) => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Rendering PNG...', 50);
  store.addExportLog('[Process] Rendering native vectors to Canvas...');
  
  try {
    const { svgString, width, height } = generateNativeSvgString();
    const canvas = await svgToCanvas(svgString, width, height, scale);
    const dataUrl = canvas.toDataURL('image/png');
    
    store.addExportLog('[Success] PNG Generated. Opening preview...');
    store.setPreview(dataUrl, 'png');
    store.setExportState(false);
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};

export const downloadAsGif = async (scale: number = 1.5, framesCount: number = 15, delay: number = 66) => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Rendering GIF...', 10);
  store.addExportLog('[Process] Compiling SVG animation frames...');
  
  try {
    const frameImages: string[] = [];
    const { width, height } = generateNativeSvgString();
    
    for(let i=0; i<framesCount; i++) {
      const offset = -18 * (i / framesCount);
      const { svgString } = generateNativeSvgString(offset);
      const canvas = await svgToCanvas(svgString, width, height, scale);
      // Use JPEG with 0.8 quality instead of PNG to reduce memory footprint of the array by ~80%
      frameImages.push(canvas.toDataURL('image/jpeg', 0.8));
      store.setExportState(true, 'Rendering GIF...', 10 + Math.round((i/framesCount)*40));
    }
    
    store.addExportLog('[Process] Encoding GIF with gifshot...');
    
    gifshot.createGIF({
      images: frameImages,
      gifWidth: frameImages.length ? await getImgWidth(frameImages[0]) : 800,
      gifHeight: frameImages.length ? await getImgHeight(frameImages[0]) : 600,
      interval: delay / 1000,
      numWorkers: 4,
      sampleInterval: 10,
      progressCallback: (p: number) => {
        useAppStore.getState().setExportState(true, 'Encoding GIF...', 50 + Math.round(p * 50));
      }
    }, (obj: any) => {
      if(!obj.error) {
        store.addExportLog('[Success] GIF Encoded. Opening preview...');
        store.setPreview(obj.image, 'gif');
      } else {
        store.addExportLog(`[Error] ${obj.error}`);
      }
      store.setExportState(false);
    });
    
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};

const getImgWidth = (url: string): Promise<number> => new Promise(res => { const i = new Image(); i.onload = ()=>res(i.width); i.src = url; });
const getImgHeight = (url: string): Promise<number> => new Promise(res => { const i = new Image(); i.onload = ()=>res(i.height); i.src = url; });

const getUsedIcons = (tables: any[]) => {
  const usedIcons: Record<string, string> = {};
  tables.forEach(t => {
    const name = t.meta.icon || 'table';
    if (!usedIcons[name]) {
       const pascal = name.split("-").map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
       const Comp = icons[pascal as keyof typeof icons] || icons['Table'];
       const svgString = renderToString(React.createElement(Comp));
       const match = svgString.match(/<svg[^>]*>(.*?)<\/svg>/);
       if (match) {
          usedIcons[name] = match[1];
       }
    }
  });
  return usedIcons;
};
export const serverDownloadAsSvg = async () => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Server compiling SVG...', 50);
  store.addExportLog('[Server] Requesting SVG compilation from server...');
  
  try {
    const payload = {
      tables: store.tables,
      relationships: store.relationships,
      nodesLayout: store.nodesLayout,
      settings: store.canvasSettings,
      isDark: document.documentElement.classList.contains('dark'),
      usedIcons: getUsedIcons(store.tables)
    };

    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'svg', payload, options: {} })
    });

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const dataUrl = URL.createObjectURL(blob);
    
    store.addExportLog('[Success] SVG Returned from Server. Opening preview...');
    store.setPreview(dataUrl, 'svg');
    store.setExportState(false);
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};

export const serverDownloadAsPng = async (scale: number = 2) => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Server rendering PNG...', 50);
  store.addExportLog('[Server] Requesting PNG rasterization from server...');
  
  try {
    const payload = {
      tables: store.tables,
      relationships: store.relationships,
      nodesLayout: store.nodesLayout,
      settings: store.canvasSettings,
      isDark: document.documentElement.classList.contains('dark'),
      usedIcons: getUsedIcons(store.tables)
    };

    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'png', payload, options: { scale } })
    });

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const dataUrl = URL.createObjectURL(blob);
    
    store.addExportLog('[Success] PNG Returned from Server. Opening preview...');
    store.setPreview(dataUrl, 'png');
    store.setExportState(false);
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};

export const serverDownloadAsGif = async (scale: number = 1.5, framesCount: number = 15, delay: number = 66) => {
  const store = useAppStore.getState();
  store.setExportState(true, 'Server rendering GIF...', 50);
  store.addExportLog('[Server] Requesting animated GIF encoding from server...');
  
  try {
    const payload = {
      tables: store.tables,
      relationships: store.relationships,
      nodesLayout: store.nodesLayout,
      settings: store.canvasSettings,
      isDark: document.documentElement.classList.contains('dark'),
      usedIcons: getUsedIcons(store.tables)
    };

    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gif', payload, options: { scale, framesCount, delay } })
    });

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const dataUrl = URL.createObjectURL(blob);
    
    store.addExportLog('[Success] GIF Returned from Server. Opening preview...');
    store.setPreview(dataUrl, 'gif');
    store.setExportState(false);
  } catch(e) {
    store.addExportLog(`[Error] ${e}`);
    store.setExportState(false);
  }
};
