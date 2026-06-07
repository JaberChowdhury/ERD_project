import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { colorMap } from "../lib/constants";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const getIcon = (name: string, size: number) => {
  const pascalName = name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  // @ts-ignore
  const Icon = LucideIcons[pascalName] || LucideIcons.Table;
  return <Icon size={size} className="opacity-90 shrink-0" />;
};

const TableNode = ({ table, layout }: { table: any; layout: any }) => {
  const { name, meta, fields } = table;
  const theme = colorMap[meta.color] || colorMap.default;
  const setHoveredTable = useAppStore((s) => s.setHoveredTable);
  const hoveredTable = useAppStore((s) => s.hoveredTable);
  const hoveredEdge = useAppStore((s) => s.hoveredEdge);
  const relationships = useAppStore((s) => s.relationships);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const scale = useAppStore((s) => s.scale);
  const settings = useAppStore((s) => s.canvasSettings);
  const headerHeight = Math.max(
    settings.headerHeight,
    Math.max(settings.iconSize, settings.fontSize + 4) + 8,
  );
  const rowHeight = settings.fontSize + settings.rowPadding + 2;
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ix: 0, iy: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const isHovered = hoveredTable === name;
  const isCustomColor = meta.color.startsWith("#");
  const customColor = isCustomColor ? meta.color : undefined;

  let isDimmed = false;

  if (hoveredTable && !isHovered) {
    const isConnected = relationships.some(
      (r) =>
        (r.sourceTable === name && r.targetTable === hoveredTable) ||
        (r.targetTable === name && r.sourceTable === hoveredTable),
    );
    if (!isConnected) isDimmed = true;
  }

  if (hoveredEdge) {
    const rel = relationships.find((_, i) => `edge-${i}` === hoveredEdge);
    if (rel && rel.sourceTable !== name && rel.targetTable !== name) {
      isDimmed = true;
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (useAppStore.getState().isHandMode) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, ix: layout.x, iy: layout.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      updateNodePosition(name, dragStart.ix + dx, dragStart.iy + dy);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, scale, name, updateNodePosition]);

  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-slate-900 overflow-hidden flex flex-col pointer-events-auto transition-all duration-300 border-2",
        !isCustomColor && theme.border,
        isDimmed
          ? "opacity-15 z-20"
          : isHovered
            ? "z-40 scale-[1.02]"
            : "z-30 hover:scale-[1.01]",
        isHovered && !isCustomColor && !isDragging && "ring-4 ring-primary/30",
        isDragging && "z-50 scale-105 cursor-grabbing ring-4 ring-primary/40",
        useAppStore.getState().isHandMode && "pointer-events-none",
      )}
      style={{
        width: layout.width,
        left: layout.x,
        top: layout.y,
        cursor: isDragging ? "grabbing" : "grab",
        borderColor: customColor,
        borderRadius: settings.borderRadius,
        fontFamily: settings.fontFamily,
        boxShadow: settings.tableShadow
          ? `0 10px ${settings.shadowBlur}px rgba(15, 23, 42, 0.12)`
          : undefined,
      }}
      data-table={name}
      onMouseEnter={() => !isDragging && setHoveredTable(name)}
      onMouseLeave={() => !isDragging && setHoveredTable(null)}
    >
      <div
        className={cn(
          "flex items-center gap-2 select-none border-b border-black/10 dark:border-white/10",
          !isCustomColor && theme.header,
          !isCustomColor && theme.text,
          isCustomColor && "text-white",
        )}
        style={{
          backgroundColor: customColor,
          minHeight: headerHeight,
          paddingLeft: settings.contentPadding,
          paddingRight: settings.contentPadding,
          paddingTop: 12,
          paddingBottom: 12,
        }}
        onMouseDown={handleMouseDown}
      >
        {getIcon(meta.icon || "table", settings.iconSize)}
        <span
          className="truncate"
          style={{
            fontSize: settings.fontSize + 2,
            fontWeight: settings.fontWeight,
          }}
        >
          {name}
        </span>
      </div>
      <div className="flex-1 py-1 bg-white dark:bg-slate-900 z-10 relative">
        {fields.map((f: any, j: number) => {
          let fieldHighlighted = false;
          if (hoveredEdge) {
            const rel = relationships.find(
              (_, i) => `edge-${i}` === hoveredEdge,
            );
            if (
              rel &&
              ((rel.sourceTable === name && rel.sourceField === f.name) ||
                (rel.targetTable === name && rel.targetField === f.name))
            ) {
              fieldHighlighted = true;
            }
          }

          return (
            <div
              key={f.name}
              data-field={f.name}
              className={cn(
                "flex justify-between items-center text-xs transition-colors border-b border-slate-50 last:border-b-0 dark:border-slate-800",
                fieldHighlighted
                  ? "bg-blue-100 dark:bg-blue-900/40"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800",
                !fieldHighlighted && settings.fieldStriping && j % 2 === 1
                  ? "bg-slate-50 dark:bg-slate-800/40"
                  : "",
              )}
              style={{
                minHeight: rowHeight,
                paddingLeft: settings.contentPadding,
                paddingRight: settings.contentPadding,
              }}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                {f.isPk ? (
                  <LucideIcons.Key
                    size={settings.fontSize}
                    className="text-yellow-500 shrink-0"
                  />
                ) : (
                  <div
                    className="shrink-0"
                    style={{ width: settings.fontSize }}
                  />
                )}
                <span
                  className={cn(
                    "text-slate-700 dark:text-slate-300 truncate",
                    f.isPk && "font-bold",
                  )}
                  style={{ fontSize: settings.fontSize }}
                >
                  {f.name}
                </span>
              </div>
              <span
                className="text-slate-400 dark:text-slate-500 font-mono shrink-0"
                style={{ fontSize: Math.max(10, settings.fontSize - 3) }}
              >
                {f.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DiagramCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tables = useAppStore((s) => s.tables);
  const relationships = useAppStore((s) => s.relationships);
  const nodesLayout = useAppStore((s) => s.nodesLayout);
  const settings = useAppStore((s) => s.canvasSettings);

  const scale = useAppStore((s) => s.scale);
  const translateX = useAppStore((s) => s.translateX);
  const translateY = useAppStore((s) => s.translateY);
  const setViewport = useAppStore((s) => s.setViewport);
  const showGrid = useAppStore((s) => s.showGrid);

  const hoveredTable = useAppStore((s) => s.hoveredTable);
  const hoveredEdge = useAppStore((s) => s.hoveredEdge);
  const setHoveredEdge = useAppStore((s) => s.setHoveredEdge);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const isHandMode = useAppStore((s) => s.isHandMode);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      isHandMode ||
      e.target === containerRef.current ||
      (e.target as HTMLElement).closest("svg") ||
      (e.target as HTMLElement).id === "zoom-layer"
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setViewport(scale, e.clientX - panStart.x, e.clientY - panStart.y);
    };

    const handleMouseUp = () => setIsPanning(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, panStart, scale, setViewport]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    const newScale = Math.max(0.15, Math.min(scale * (1 + delta), 3));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - translateX) * (newScale / scale);
    const newY = mouseY - (mouseY - translateY) * (newScale / scale);

    setViewport(newScale, newX, newY);
  };

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      className={cn(
        "flex-1 h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950",
        isHandMode || isPanning
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default",
      )}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <div
        className={cn(
          "absolute inset-0 origin-top-left transition-opacity duration-300 pointer-events-none bg-grid-pattern",
          showGrid ? "opacity-100" : "opacity-0",
        )}
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          width: "20000px",
          height: "20000px",
          left: "-5000px",
          top: "-5000px",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        id="zoom-layer"
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      >
        <svg
          id="svg-layer"
          className="absolute inset-0 overflow-visible w-full h-full pointer-events-none z-10"
        >
          <defs>
            <marker
              id="arrow-end"
              markerWidth="14"
              markerHeight="14"
              refX="14"
              refY="7"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 2 L 14 7 L 0 12 z" fill="#9ca3af" />
            </marker>
            <marker
              id="arrow-start"
              markerWidth="14"
              markerHeight="14"
              refX="0"
              refY="7"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 2 L 14 7 L 0 12 z" fill="#9ca3af" />
            </marker>
            <marker
              id="arrow-end-highlight"
              markerWidth="14"
              markerHeight="14"
              refX="14"
              refY="7"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 2 L 14 7 L 0 12 z" fill="#3b82f6" />
            </marker>
            <marker
              id="arrow-start-highlight"
              markerWidth="14"
              markerHeight="14"
              refX="0"
              refY="7"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 2 L 14 7 L 0 12 z" fill="#3b82f6" />
            </marker>
          </defs>
          <g id="edges-group">
            {relationships.map((rel, i) => {
              const srcNode = nodesLayout[rel.sourceTable];
              const tgtNode = nodesLayout[rel.targetTable];
              if (!srcNode || !tgtNode) return null;

              const srcTableDef = tables.find(
                (t) => t.name === rel.sourceTable,
              );
              const tgtTableDef = tables.find(
                (t) => t.name === rel.targetTable,
              );
              if (!srcTableDef || !tgtTableDef) return null;

              const srcFieldIndex = srcTableDef.fields.findIndex(
                (f) => f.name === rel.sourceField,
              );
              const tgtFieldIndex = tgtTableDef.fields.findIndex(
                (f) => f.name === rel.targetField,
              );
              if (srcFieldIndex === -1 || tgtFieldIndex === -1) return null;

              // Calculate EXACT field Y offsets (45px header + index * 33px + half row 16.5px)
              const srcY = srcNode.y + 45 + srcFieldIndex * 33 + 16.5;
              const tgtY = tgtNode.y + 45 + tgtFieldIndex * 33 + 16.5;

              let startX,
                startY = srcY;
              let endX,
                endY = tgtY;
              let isLeftToRight = srcNode.x < tgtNode.x;

              if (isLeftToRight) {
                startX = srcNode.x + srcNode.width;
                endX = tgtNode.x;
              } else {
                startX = srcNode.x;
                endX = tgtNode.x + tgtNode.width;
              }

              const distance = Math.max(Math.abs(endX - startX) * 0.5, 50);

              let pathD = "";
              if (settings.pathType === "straight") {
                pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              } else if (settings.pathType === "step") {
                const midX = startX + (endX - startX) / 2;
                pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
              } else {
                const cp1x = startX + (isLeftToRight ? distance : -distance);
                const cp2x = endX + (isLeftToRight ? -distance : distance);
                pathD = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;
              }

              const edgeId = `edge-${i}`;
              const isEdgeHovered =
                hoveredEdge === edgeId ||
                hoveredTable === rel.sourceTable ||
                hoveredTable === rel.targetTable;
              const isDimmed =
                (hoveredTable && !isEdgeHovered) ||
                (hoveredEdge && hoveredEdge !== edgeId);

              const markerEnd =
                settings.edgeArrows && (rel.type === "<" || rel.type === "<>")
                  ? isEdgeHovered
                    ? "url(#arrow-end-highlight)"
                    : "url(#arrow-end)"
                  : undefined;
              const markerStart =
                settings.edgeArrows && rel.type === "<>"
                  ? isEdgeHovered
                    ? "url(#arrow-start-highlight)"
                    : "url(#arrow-start)"
                  : undefined;

              return (
                <g
                  key={edgeId}
                  className={cn(
                    "pointer-events-auto cursor-pointer transition-opacity duration-200",
                    isDimmed ? "opacity-15" : "opacity-100",
                    isEdgeHovered ? "edge-highlight z-50" : "",
                  )}
                  onMouseEnter={() => setHoveredEdge(edgeId)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isEdgeHovered ? "#3b82f6" : "#cbd5e1"}
                    strokeWidth={
                      isEdgeHovered
                        ? Math.max(1, settings.edgeThickness + 1)
                        : settings.edgeThickness
                    }
                    markerStart={markerStart}
                    markerEnd={markerEnd}
                    className="transition-all duration-200"
                  />
                  {!isDimmed && settings.pathAnimation && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isEdgeHovered ? "#2563eb" : "#0ea5e9"}
                      strokeWidth={settings.edgeThickness}
                      strokeDasharray="6 12"
                      className="opacity-80 pointer-events-none"
                      style={{ animation: "flow 1s linear infinite" }}
                    />
                  )}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="15"
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div id="nodes-layer" className="absolute inset-0 z-20">
          {tables.map((table) => {
            const layout = nodesLayout[table.name];
            if (!layout) return null;
            return <TableNode key={table.name} table={table} layout={layout} />;
          })}
        </div>
      </div>

      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -18; }
        }
      `}</style>
    </div>
  );
};
