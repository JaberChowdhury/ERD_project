import { useAppStore } from "../store/useAppStore";
import {
  Database,
  Download,
  Play,
  Focus,
  Grid3X3,
  Share2,
  Sun,
  Moon,
  Monitor,
  Settings2,
} from "lucide-react";
import { Button } from "./ui/button";
import { ExportDialog } from "./ExportDialog";
import { SettingsDialog } from "./SettingsDialog";
import LZString from "lz-string";

export const Topbar: React.FC = () => {
  const compile = useAppStore((state) => state.compile);
  const showGrid = useAppStore((state) => state.showGrid);
  const setShowGrid = useAppStore((state) => state.setShowGrid);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="m-3 rounded-full bg-background/80 shadow-lg backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 px-4 py-3 z-50 shrink-0 relative border border-border/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 bg-primary/20 rounded-full">
          <Database className="w-4 h-4 text-primary" />
        </div>
        <h1 className="font-bold text-foreground tracking-tight text-sm hidden sm:block">
          Schema Canvas
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "light" && <Sun className="w-4 h-4" />}
          {theme === "dark" && <Moon className="w-4 h-4" />}
          {theme === "system" && <Monitor className="w-4 h-4" />}
        </Button>
        <Button
          variant={showGrid ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Background"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <SettingsDialog>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            title="Canvas Settings"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </SettingsDialog>

        <ExportDialog>
          <Download className="w-3.5 h-3.5" /> Export Diagram...
        </ExportDialog>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs font-medium rounded-full"
          onClick={() => {
            const code = useAppStore.getState().code;
            const settings = useAppStore.getState().canvasSettings;
            const payload = JSON.stringify({ code, settings });
            const compressed = LZString.compressToEncodedURIComponent(payload);
            window.location.hash = `data=${compressed}`;
            navigator.clipboard.writeText(window.location.href);
            alert("Shareable link copied to clipboard!");
          }}
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
        <div className="w-px h-6 bg-border mx-2"></div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs font-medium rounded-full border-border bg-background hover:bg-muted"
          onClick={() => {
            const el = document.getElementById("canvas-container");
            if (el)
              useAppStore.getState().resetView(el.clientWidth, el.clientHeight);
          }}
        >
          <Focus className="w-3.5 h-3.5" /> Reset View
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium shadow-sm"
          onClick={() => compile()}
        >
          <Play className="w-3.5 h-3.5" /> Compile
        </Button>
      </div>
    </div>
  );
};
