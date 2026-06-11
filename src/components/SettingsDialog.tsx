import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAppStore } from "../store/useAppStore";
import { Settings2 } from "lucide-react";

export const SettingsDialog = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const settings = useAppStore((state) => state.canvasSettings);
  const updateSettings = useAppStore((state) => state.updateCanvasSettings);
  const showGrid = useAppStore((state) => state.showGrid);
  const setShowGrid = useAppStore((state) => state.setShowGrid);

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="min-w-[320px] w-full max-w-[90vw] sm:max-w-[720px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" /> Canvas Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3 px-2 sm:px-4 overflow-visible">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Layout
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Horizontal Gap ({settings.nodesep}px)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={settings.nodesep}
                    onChange={(e) =>
                      updateSettings({ nodesep: Number(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Vertical Gap ({settings.ranksep}px)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={settings.ranksep}
                    onChange={(e) =>
                      updateSettings({ ranksep: Number(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Canvas View
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="accent-primary w-4 h-4 rounded"
                  />
                  Show Grid
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.pathAnimation}
                    onChange={(e) =>
                      updateSettings({ pathAnimation: e.target.checked })
                    }
                    className="accent-primary w-4 h-4 rounded"
                  />
                  Animate Flow
                </label>
              </div>
            </div>
            <div className="space-y-3 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Connections
              </h4>
              <div className="grid gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Path Style
                  </label>
                  <select
                    value={settings.pathType}
                    onChange={(e) =>
                      updateSettings({ pathType: e.target.value as any })
                    }
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm border-0 focus:ring-2 focus:ring-primary"
                  >
                    <option value="bezier">Curved (Bezier)</option>
                    <option value="step">Orthogonal (Step)</option>
                    <option value="straight">Straight Line</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Edge Thickness ({settings.edgeThickness}px)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={settings.edgeThickness}
                    onChange={(e) =>
                      updateSettings({ edgeThickness: Number(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.edgeArrows}
                    onChange={(e) =>
                      updateSettings({ edgeArrows: e.target.checked })
                    }
                    className="accent-primary w-4 h-4 rounded"
                  />
                  Show Edge Arrows
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.tableShadow}
                    onChange={(e) =>
                      updateSettings({ tableShadow: e.target.checked })
                    }
                    className="accent-primary w-4 h-4 rounded"
                  />
                  Table Shadow
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Table Styling
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Border Radius
                </label>
                <select
                  value={settings.borderRadius}
                  onChange={(e) =>
                    updateSettings({ borderRadius: e.target.value })
                  }
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm border-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="0px">0px (Square)</option>
                  <option value="0.5rem">8px (Small)</option>
                  <option value="1rem">16px (Medium)</option>
                  <option value="1.5rem">24px (Large)</option>
                  <option value="2rem">32px (Pill)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) =>
                    updateSettings({ fontFamily: e.target.value })
                  }
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm border-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="ui-sans-serif, system-ui, sans-serif">System Sans</option>
                  <option value="'Geist', sans-serif">Geist</option>
                  <option value="ui-serif, Georgia, serif">System Serif</option>
                  <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Monospace</option>
                  <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Card Elevation ({settings.shadowBlur}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={settings.shadowBlur}
                  onChange={(e) =>
                    updateSettings({ shadowBlur: Number(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Header Height ({settings.headerHeight}px)
                </label>
                <input
                  type="range"
                  min="36"
                  max="80"
                  step="2"
                  value={settings.headerHeight}
                  onChange={(e) =>
                    updateSettings({ headerHeight: Number(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Row Padding ({settings.rowPadding}px)
                </label>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  value={settings.rowPadding}
                  onChange={(e) =>
                    updateSettings({ rowPadding: Number(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Min Table Width ({settings.minTableWidth}px)
                </label>
                <input
                  type="range"
                  min="220"
                  max="420"
                  step="10"
                  value={settings.minTableWidth}
                  onChange={(e) =>
                    updateSettings({ minTableWidth: Number(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Content Padding ({settings.contentPadding}px)
                </label>
                <input
                  type="range"
                  min="8"
                  max="28"
                  step="2"
                  value={settings.contentPadding}
                  onChange={(e) =>
                    updateSettings({ contentPadding: Number(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.fieldStriping}
                    onChange={(e) =>
                      updateSettings({ fieldStriping: e.target.checked })
                    }
                    className="accent-primary w-4 h-4 rounded"
                  />
                  Field Striping
                </label>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
