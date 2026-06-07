import gifshot from 'gifshot';
import { useAppStore } from '../store/useAppStore';
import { toPng, toSvg } from 'html-to-image';

export const exportCanvas = async (
  format: 'png' | 'svg' | 'gif',
  options?: { scale?: number, frames?: number, delay?: number }
) => {
  const store = useAppStore.getState();
  store.clearExportLogs();
  
  const container = document.getElementById('zoom-layer');
  if (!container) return;

  // Calculate bounding box of all nodes
  const { nodesLayout } = useAppStore.getState();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(nodesLayout).forEach(node => {
    if (node.x < minX) minX = node.x; if (node.y < minY) minY = node.y;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
    if (node.y + node.height > maxY) maxY = node.y + node.height;
  });

  const pad = 60;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const width = maxX - minX;
  const height = Math.max(maxY - minY, 100);

  const isDark = document.documentElement.classList.contains('dark');
  const bgColor = isDark ? '#020617' : '#f8fafc'; // slate-950 or slate-50

  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'absolute';
  cloneWrapper.style.left = '-9999px';
  cloneWrapper.style.top = '0';
  cloneWrapper.style.width = `${width}px`;
  cloneWrapper.style.height = `${height}px`;
  cloneWrapper.className = container.className;

  const clone = container.cloneNode(true) as HTMLElement;
  clone.style.transform = `translate(${-minX}px, ${-minY}px)`;
  cloneWrapper.appendChild(clone);
  document.body.appendChild(cloneWrapper);

  const getCaptureOptions = (scale: number) => ({
    width: width,
    height: height,
    canvasWidth: width * scale,
    canvasHeight: height * scale,
    backgroundColor: bgColor,
    style: {
      transform: 'scale(1)',
      width: `${width}px`,
      height: `${height}px`
    },
    filter: (node: HTMLElement) => {
      // Ignore background grid so the background color renders cleanly
      if (node.classList?.contains('bg-grid-pattern')) return false;
      return true;
    }
  });

  if (format === 'svg') {
    store.setExportState(true, 'Exporting SVG...', 10);
    store.addExportLog('[System] Initiating DOM to SVG Compilation...');
    
    try {
      store.setExportState(true, 'Exporting SVG...', 50);
      store.addExportLog('[Process] Capturing DOM hierarchy...');
      const dataUrl = await toSvg(cloneWrapper, getCaptureOptions(1));
      
      store.setExportState(true, 'Exporting SVG...', 100);
      store.addExportLog('[Success] Download starting...');
      download(dataUrl, 'schema-diagram.svg');
      setTimeout(() => store.setExportState(false), 800);
    } catch (err) {
      store.addExportLog(`[Error] SVG Export failed: ${err}`);
      setTimeout(() => store.setExportState(false), 2000);
    } finally {
      document.body.removeChild(cloneWrapper);
    }
    return;
  }

  if (format === 'png') {
    const scale = options?.scale || 4;
    store.setExportState(true, 'Exporting High-Res PNG...', 10);
    store.addExportLog(`[System] Initiating PNG Render at ${scale}x scale...`);
    
    try {
      store.setExportState(true, 'Exporting High-Res PNG...', 50);
      store.addExportLog('[Process] Rendering High-Res DOM Capture...');
      const dataUrl = await toPng(cloneWrapper, getCaptureOptions(scale));
      
      store.setExportState(true, 'Exporting High-Res PNG...', 100);
      store.addExportLog('[Success] Render complete. Downloading file...');
      download(dataUrl, 'schema-diagram.png');
      setTimeout(() => store.setExportState(false), 800);
    } catch (err) {
      store.addExportLog(`[Error] PNG Export failed: ${err}`);
      setTimeout(() => store.setExportState(false), 2000);
    } finally {
      document.body.removeChild(cloneWrapper);
    }
    return;
  }

  if (format === 'gif') {
    const framesCount = options?.frames || 15;
    const frameDelay = options?.delay || 66;
    
    store.setExportState(true, 'Exporting Animated GIF...', 0);
    store.addExportLog(`[System] Initiating GIF Compilation (${framesCount} frames, ${frameDelay}ms delay)...`);
    
    try {
      const frameImages: string[] = [];
      const origW = width;
      const origH = height;

      const maxDim = 2400; // Capped to 2400px to prevent Out of Memory crash
      let gifScale = options?.scale || 1;
      if (origW * gifScale > maxDim || origH * gifScale > maxDim) {
        gifScale = maxDim / Math.max(origW, origH);
        store.addExportLog(`[System] Warning: Target resolution exceeded memory limit. Downscaling to safe threshold (${Math.round(gifScale*origW)}px).`);
      }
      const gifW = Math.round(origW * gifScale);
      const gifH = Math.round(origH * gifScale);

      store.addExportLog(`[Process] Optimized GIF resolution to ${gifW}x${gifH}`);
      
      const captureOpts = getCaptureOptions(gifScale);
      
      // To simulate the dashed line flow, we inject a CSS keyframe animation offset temporarily into the DOM
      const edgesGroup = cloneWrapper.querySelector('#edges-group');
      
      for (let i = 0; i < framesCount; i++) {
        store.addExportLog(`[Process] Capturing DOM frame ${i + 1}/${framesCount}...`);
        
        if (edgesGroup) {
          const offset = -18 * (i / framesCount);
          // Manually apply dash offset to all animated lines
          const animLines = edgesGroup.querySelectorAll('.opacity-80.pointer-events-none');
          animLines.forEach((el: any) => {
            el.style.animation = 'none';
            el.style.strokeDashoffset = offset.toString();
          });
        }

        const dataUrl = await toPng(cloneWrapper, captureOpts);
        frameImages.push(dataUrl);
        
        store.setExportState(true, 'Exporting Animated GIF...', Math.round((i / framesCount) * 40));
      }

      // Restore animation
      if (edgesGroup) {
        const animLines = edgesGroup.querySelectorAll('.opacity-80.pointer-events-none');
        animLines.forEach((el: any) => {
          el.style.animation = 'flow 1s linear infinite';
          el.style.strokeDashoffset = '';
        });
      }

      store.addExportLog('[Process] Initializing Gifshot engine...');
      store.addExportLog('[Process] Combining frames and quantizing colors...');

      let lastPercent = 0;

      gifshot.createGIF({
        images: frameImages,
        gifWidth: gifW,
        gifHeight: gifH,
        interval: frameDelay / 1000,
        numWorkers: 2,
        sampleInterval: 10,
        progressCallback: function (captureProgress: number) {
          const pct = Math.round(captureProgress * 100);
          if (pct > lastPercent + 10) {
            lastPercent = pct;
            useAppStore.getState().addExportLog(`[Process] Quantization & Encoding... ${pct}%`);
          }
          useAppStore.getState().setExportState(true, 'Exporting Animated GIF...', 40 + Math.round(captureProgress * 60));
        }
      }, function (obj: any) {
        if (!obj.error) {
          store.addExportLog('[Success] Encoding finished. Downloading...');
          download(obj.image, 'schema-diagram.gif');
        } else {
          store.addExportLog('[Error] GIF generation failed.');
          alert('Error generating GIF');
        }
        useAppStore.getState().setExportState(true, 'Exporting Animated GIF...', 100);
        setTimeout(() => useAppStore.getState().setExportState(false), 800);
      });
    } catch (err) {
      console.error("GIF export failed:", err);
      store.addExportLog(`[Error] ${err}`);
      store.setExportState(false);
      alert("Export failed. Please check the console.");
    } finally {
      if (document.body.contains(cloneWrapper)) {
        document.body.removeChild(cloneWrapper);
      }
    }
  }
};

const download = (dataUrl: string, name: string) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
