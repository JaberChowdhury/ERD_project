import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAppStore, DEFAULT_SETTINGS } from "../store/useAppStore";
import { Share2, Copy, Check } from "lucide-react";
import { compressToUrl } from "../lib/compress";

export const ShareDialog = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [level, setLevel] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  const generateUrl = () => {
    let code = useAppStore.getState().code;
    const settings = useAppStore.getState().canvasSettings as Record<string, any>;
    
    // Apply minification based on level
    if (level >= 2) {
      // Level 2: Strip unnecessary whitespace/indentation but preserve newlines
      code = code.split('\n').map(l => l.trim().replace(/\s+/g, ' ')).filter(Boolean).join('\n');
    }
    if (level >= 3) {
      // Level 3: Strip visual metadata (icons, colors)
      code = code.replace(/\s*\[.*?\]\s*\{/g, ' {');
    }

    // Only include settings that differ from defaults
    const diffSettings: Record<string, any> = {};
    for (const key in settings) {
      if (settings[key] !== (DEFAULT_SETTINGS as Record<string, any>)[key]) {
        diffSettings[key] = settings[key];
      }
    }

    const payloadObj: any = { c: code };
    if (Object.keys(diffSettings).length > 0) {
      payloadObj.s = diffSettings;
    }
    
    const payload = JSON.stringify(payloadObj);
    const compressed = compressToUrl(payload);
    
    // Use #data1, #data2, #data3 based on the level as requested by the user
    // However, they all decompress identically since the data itself is minified.
    const baseUrl = window.location.href.split('#')[0];
    setUrl(`${baseUrl}#data${level}=${compressed}`);
  };

  useEffect(() => {
    generateUrl();
  }, [level]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="min-w-[320px] w-full max-w-[90vw] sm:max-w-[600px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" /> Share Diagram
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 px-2 sm:px-4">
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Compression Level
              </label>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-full">
                Level {level}
              </span>
            </div>
            
            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
              {[1, 2, 3].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    level === l
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Level {l}
                </button>
              ))}
            </div>
            
            <div className="bg-slate-50/80 dark:bg-slate-800/80 p-4 rounded-2xl text-sm text-slate-600 dark:text-slate-300 min-h[80px]">
              {level === 1 && (
                <p><strong>Lossless:</strong> Preserves exact formatting, spaces, and styling. Best for editing.</p>
              )}
              {level === 2 && (
                <p><strong>Minify Spaces (Lossy):</strong> Strips formatting and indentation to save space. Diagram remains functionally identical.</p>
              )}
              {level === 3 && (
                <p><strong>Strip Styling (Extreme):</strong> Removes all table icons and custom colors to achieve the absolute smallest URL.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Generated Link
              </label>
              <span className="text-xs text-slate-500">
                {url.length} characters
              </span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={url} 
                className="flex-1 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                onClick={handleCopy}
                className="shrink-0 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
