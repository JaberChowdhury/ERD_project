import { useAppStore } from '../store/useAppStore';
import { Database, Download, Play, Focus, Grid3X3, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { ExportDialog } from './ExportDialog';
import LZString from 'lz-string';

export const Topbar: React.FC = () => {
  const compile = useAppStore(state => state.compile);
  const showGrid = useAppStore(state => state.showGrid);
  const setShowGrid = useAppStore(state => state.setShowGrid);

  return (
    <div className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 z-50 shrink-0 shadow-sm relative dark:bg-slate-950/80 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-sm hidden sm:block">Schema Canvas</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant={showGrid ? "secondary" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid Background">
          <Grid3X3 className="w-4 h-4" />
        </Button>


        <ExportDialog>
          <Download className="w-3.5 h-3.5" /> Export Diagram...
        </ExportDialog>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium" onClick={() => {
          const code = useAppStore.getState().code;
          const compressed = LZString.compressToEncodedURIComponent(code);
          window.location.hash = `code=${compressed}`;
          navigator.clipboard.writeText(window.location.href);
          alert('Shareable link copied to clipboard!');
        }}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium" onClick={() => {
          const el = document.getElementById('canvas-container');
          if (el) useAppStore.getState().resetView(el.clientWidth, el.clientHeight);
        }}>
          <Focus className="w-3.5 h-3.5" /> Reset View
        </Button>
        <Button size="sm" className="h-8 gap-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium" onClick={() => compile()}>
          <Play className="w-3.5 h-3.5" /> Compile
        </Button>
      </div>
    </div>
  );
};
