import React from "react";
import type { TableData, RelationshipData } from "../lib/parser";
import { colorMap } from "../lib/constants";
import { useAppStore } from "../store/useAppStore";
import { CanvasSettings } from "../store/useAppStore";

interface ExportSvgRendererProps {
  settings: CanvasSettings;
  tables: TableData[];
  relationships: RelationshipData[];
  nodesLayout: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >;
  isDark: boolean;
  dashOffset?: number;
  width: number;
  height: number;
  minX: number;
  minY: number;
  usedIcons?: Record<string, string>;
  renderIcon?: (name: string, color: string, size: number) => React.ReactNode;
}

export const ExportSvgRenderer: React.FC<ExportSvgRendererProps> = ({
  tables,
  relationships,
  nodesLayout,
  isDark,
  dashOffset = 0,
  width,
  height,
  minX,
  minY,
  settings,
  usedIcons,
  renderIcon,
}) => {
  const bgColor = isDark ? "#020617" : "#f8fafc";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";
  const tableBg = isDark ? "#0f172a" : "#ffffff";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width={width}
      height={height}
      style={{ backgroundColor: bgColor, fontFamily: settings.fontFamily }}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle
            cx="2"
            cy="2"
            r="1.5"
            fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
          />
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy={settings.shadowBlur / 2}
            stdDeviation={Math.max(0, settings.shadowBlur / 3)}
            floodOpacity="0.1"
            floodColor="#000"
          />
        </filter>
        <marker
          id="arrow-end"
          markerWidth="14"
          markerHeight="14"
          refX="14"
          refY="7"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 2 L 14 7 L 0 12 z" fill={mutedColor} />
        </marker>
        <marker
          id="arrow-start"
          markerWidth="14"
          markerHeight="14"
          refX="14"
          refY="7"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 2 L 14 7 L 0 12 z" fill={mutedColor} />
        </marker>
      </defs>

      <rect x={minX} y={minY} width={width} height={height} fill="url(#grid)" />

      <g id="edges-group">
        {relationships.map((rel, i) => {
          const srcNode = nodesLayout[rel.sourceTable];
          const tgtNode = nodesLayout[rel.targetTable];
          if (!srcNode || !tgtNode) return null;

          const srcTableDef = tables.find((t) => t.name === rel.sourceTable);
          const tgtTableDef = tables.find((t) => t.name === rel.targetTable);
          if (!srcTableDef || !tgtTableDef) return null;

          const srcFieldIndex = srcTableDef.fields.findIndex(
            (f) => f.name === rel.sourceField,
          );
          const tgtFieldIndex = tgtTableDef.fields.findIndex(
            (f) => f.name === rel.targetField,
          );
          if (srcFieldIndex === -1 || tgtFieldIndex === -1) return null;

          const headerHeightObj = Math.max(
            settings.headerHeight,
            Math.max(settings.iconSize, settings.fontSize + 4) + 8,
          );
          const rowHeightObj = settings.fontSize + settings.rowPadding + 2;

          const srcY = srcNode.y + headerHeightObj + srcFieldIndex * rowHeightObj + rowHeightObj / 2;
          const tgtY = tgtNode.y + headerHeightObj + tgtFieldIndex * rowHeightObj + rowHeightObj / 2;

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

          const verticalDist = Math.abs(endY - startY);
          const horizontalDist = Math.abs(endX - startX);
          const distance = Math.max(horizontalDist * 0.5, 50) + verticalDist * 0.25;

          let pathD = "";
          if (settings.pathType === "straight") {
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
          } else if (settings.pathType === "step") {
            const offsetDir = startY > endY ? 1 : -1;
            const midX = startX + (endX - startX) / 2 + (verticalDist * 0.15 * offsetDir);
            pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
          } else {
            const cp1x = startX + (isLeftToRight ? distance : -distance);
            const cp2x = endX + (isLeftToRight ? -distance : distance);
            pathD = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;
          }

          const markerEnd =
            settings.edgeArrows && (rel.type === "<" || rel.type === "<>")
              ? "url(#arrow-end)"
              : undefined;
          const markerStart =
            settings.edgeArrows && rel.type === "<>"
              ? "url(#arrow-start)"
              : undefined;

          return (
            <g key={`edge-${i}`}>
              <path
                d={pathD}
                fill="none"
                stroke={mutedColor}
                strokeWidth={settings.edgeThickness}
                markerStart={markerStart}
                markerEnd={markerEnd}
                strokeOpacity={0.5}
              />
              {settings.pathAnimation && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth={settings.edgeThickness}
                  strokeDasharray="6 12"
                  strokeDashoffset={dashOffset}
                  opacity={0.8}
                />
              )}
            </g>
          );
        })}
      </g>

      <g id="nodes-group">
        {tables.map((table, i) => {
          const layout = nodesLayout[table.name];
          if (!layout) return null;

          let hexColor = "#3b82f6";
          if (table.meta.color) {
            if (table.meta.color.startsWith("#")) hexColor = table.meta.color;
            else {
              const mapped =
                colorMap[table.meta.color as keyof typeof colorMap];
              if (mapped) {
                hexColor = mapped.hex || hexColor;
              }
            }
          }

          const iconName = table.meta.icon || "table";

          // Parse border radius logic (from string like '1.5rem' or '24px' to number)
          // Simplified fallback: if 'rem' is present, multiply by 16
          let rx = 24;
          if (settings.borderRadius.includes("rem")) {
            rx = parseFloat(settings.borderRadius) * 16;
          } else if (settings.borderRadius.includes("px")) {
            rx = parseFloat(settings.borderRadius);
          }

          const headerHeight = Math.max(
            settings.headerHeight,
            Math.max(settings.iconSize, settings.fontSize + 4) + 8,
          );
          const rowHeight = settings.fontSize + settings.rowPadding + 2;

          return (
            <g key={i} transform={`translate(${layout.x}, ${layout.y})`}>
              {/* Drop Shadow */}
              {settings.tableShadow && (
                <rect
                  x={0}
                  y={0}
                  width={layout.width}
                  height={layout.height}
                  rx={rx}
                  fill="rgba(0,0,0,0.1)"
                  filter="url(#shadow)"
                />
              )}

              {/* Table Container */}
              <rect
                width={layout.width}
                height={layout.height}
                rx={rx}
                fill={tableBg}
                stroke={hexColor}
                strokeWidth={2}
              />

              {/* Header */}
              <path
                d={`M0 ${rx} C0 ${rx / 2.2} ${rx / 2.2} 0 ${rx} 0 L${layout.width - rx} 0 C${layout.width - rx / 2.2} 0 ${layout.width} ${rx / 2.2} ${layout.width} ${rx} L${layout.width} ${headerHeight} L0 ${headerHeight} Z`}
                fill={hexColor}
              />

              {/* Icon */}
              <g
                transform={`translate(${settings.contentPadding}, ${(headerHeight - settings.iconSize) / 2})`}
              >
                {renderIcon ? (
                   renderIcon(iconName, "#ffffff", settings.iconSize)
                ) : usedIcons && usedIcons[iconName] ? (
                   <svg 
                     width={settings.iconSize} 
                     height={settings.iconSize} 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="#ffffff" 
                     strokeWidth="2" 
                     strokeLinecap="round" 
                     strokeLinejoin="round"
                     dangerouslySetInnerHTML={{ __html: usedIcons[iconName] }}
                   />
                ) : null}
              </g>

              {/* Title */}
              <text
                x={settings.contentPadding + settings.iconSize + 8}
                y={headerHeight / 2 + settings.fontSize / 3 + 2}
                fill="#ffffff"
                fontSize={settings.fontSize + 2}
                fontWeight={
                  settings.fontWeight === "bold"
                    ? "700"
                    : settings.fontWeight === "medium"
                      ? "500"
                      : "400"
                }
              >
                {table.name}
              </text>

              {/* Fields */}
              {table.fields.map((f, j) => {
                const yPos = headerHeight + j * rowHeight;
                return (
                  <g key={j} transform={`translate(0, ${yPos})`}>
                    <rect
                      width={layout.width}
                      height={rowHeight}
                      fill={
                        !settings.fieldStriping || j % 2 === 0
                          ? "transparent"
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.02)"
                      }
                    />
                    <text
                      x={settings.contentPadding}
                      y={rowHeight / 2 + settings.fontSize / 3}
                      fill={textColor}
                      fontSize={settings.fontSize}
                    >
                      {f.name}
                    </text>
                    <text
                      x={layout.width - settings.contentPadding}
                      y={rowHeight / 2 + settings.fontSize / 3}
                      fill={mutedColor}
                      fontSize={Math.max(10, settings.fontSize - 3)}
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {f.type}
                    </text>
                    {f.isPk && (
                      <g
                        transform={`translate(${layout.width - 64}, ${rowHeight / 2 - 4})`}
                      >
                        <text fill={hexColor} fontSize={10} fontWeight="700">
                          PK
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
