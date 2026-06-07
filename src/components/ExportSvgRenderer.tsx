import React from 'react';
import { icons } from 'lucide-react';
import type { TableData, RelationshipData } from '../lib/parser';
import { colorMap } from '../lib/constants';

interface ExportSvgRendererProps {
  tables: TableData[];
  relationships: RelationshipData[];
  nodesLayout: Record<string, { x: number, y: number, width: number, height: number }>;
  isDark: boolean;
  dashOffset?: number;
  width: number;
  height: number;
  minX: number;
  minY: number;
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
  minY
}) => {
  const bgColor = isDark ? '#020617' : '#f8fafc';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const tableBg = isDark ? '#0f172a' : '#ffffff';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`${minX} ${minY} ${width} ${height}`} 
      width={width} 
      height={height} 
      style={{ backgroundColor: bgColor, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.1" floodColor="#000" />
        </filter>
        <marker id="arrow-end" markerWidth="14" markerHeight="14" refX="14" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 2 L 14 7 L 0 12 z" fill={mutedColor} />
        </marker>
        <marker id="arrow-start" markerWidth="14" markerHeight="14" refX="0" refY="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 0 2 L 14 7 L 0 12 z" fill={mutedColor} />
        </marker>
      </defs>
      
      <rect x={minX} y={minY} width={width} height={height} fill="url(#grid)" />

      <g id="edges-group">
        {relationships.map((rel, i) => {
          const srcNode = nodesLayout[rel.sourceTable];
          const tgtNode = nodesLayout[rel.targetTable];
          if (!srcNode || !tgtNode) return null;

          const srcTableDef = tables.find(t => t.name === rel.sourceTable);
          const tgtTableDef = tables.find(t => t.name === rel.targetTable);
          if (!srcTableDef || !tgtTableDef) return null;

          const srcFieldIndex = srcTableDef.fields.findIndex(f => f.name === rel.sourceField);
          const tgtFieldIndex = tgtTableDef.fields.findIndex(f => f.name === rel.targetField);
          if (srcFieldIndex === -1 || tgtFieldIndex === -1) return null;

          const srcY = srcNode.y + 45 + (srcFieldIndex * 33) + 16.5;
          const tgtY = tgtNode.y + 45 + (tgtFieldIndex * 33) + 16.5;

          let startX, startY = srcY;
          let endX, endY = tgtY;
          let isLeftToRight = srcNode.x < tgtNode.x;

          if (isLeftToRight) {
            startX = srcNode.x + srcNode.width;
            endX = tgtNode.x;
          } else {
            startX = srcNode.x;
            endX = tgtNode.x + tgtNode.width;
          }

          const distance = Math.max(Math.abs(endX - startX) * 0.5, 50);
          const cp1x = startX + (isLeftToRight ? distance : -distance);
          const cp2x = endX + (isLeftToRight ? -distance : distance);
          const pathD = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;

          const markerEnd = (rel.type === '<' || rel.type === '<>') ? 'url(#arrow-end)' : undefined;
          const markerStart = (rel.type === '<>') ? 'url(#arrow-start)' : undefined;

          return (
            <g key={`edge-${i}`}>
              <path 
                d={pathD} 
                fill="none" 
                stroke={mutedColor} 
                strokeWidth={2}
                markerStart={markerStart}
                markerEnd={markerEnd}
                strokeOpacity={0.5}
              />
              <path 
                d={pathD} 
                fill="none" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                strokeDasharray="6 12"
                strokeDashoffset={dashOffset}
                opacity={0.8}
              />
            </g>
          );
        })}
      </g>

      <g id="nodes-group">
        {tables.map((table, i) => {
          const layout = nodesLayout[table.name];
          if (!layout) return null;
          
          let hexColor = '#3b82f6';
          if (table.meta.color) {
            if (table.meta.color.startsWith('#')) hexColor = table.meta.color;
            else {
              const mapped = colorMap[table.meta.color as keyof typeof colorMap];
              if (mapped) hexColor = mapped.borderHex || mapped.hex || hexColor;
            }
          }

          const iconName = table.meta.icon || 'table';
          const pascalIcon = iconName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
          const IconComponent = icons[pascalIcon as keyof typeof icons] || icons['Table'];

          return (
            <g key={i} transform={`translate(${layout.x}, ${layout.y})`}>
              {/* Drop Shadow */}
              <rect x={0} y={0} width={layout.width} height={layout.height} rx={24} fill="rgba(0,0,0,0.1)" filter="url(#shadow)" />
              
              {/* Table Container */}
              <rect width={layout.width} height={layout.height} rx={24} fill={tableBg} stroke={hexColor} strokeWidth={2} />
              
              {/* Header */}
              <path d={`M0 24 C0 10.745 10.745 0 24 0 L${layout.width - 24} 0 C${layout.width - 10.745} 0 ${layout.width} 10.745 ${layout.width} 24 L${layout.width} 45 L0 45 Z`} fill={hexColor} />
              
              {/* Icon */}
              <g transform="translate(16, 14)">
                <IconComponent size={16} color="#ffffff" />
              </g>

              {/* Title */}
              <text x={40} y={27} fill="#ffffff" fontSize={15} fontWeight="600">{table.name}</text>

              {/* Fields */}
              {table.fields.map((f, j) => (
                <g key={j} transform={`translate(0, ${45 + j * 33})`}>
                  <rect width={layout.width} height={33} fill={j % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')} />
                  <text x={16} y={21} fill={textColor} fontSize={12} fontFamily="monospace">{f.name}</text>
                  <text x={layout.width - 16} y={21} fill={mutedColor} fontSize={10} fontFamily="monospace" textAnchor="end">{f.type}</text>
                  {f.isPk && (
                    <g transform={`translate(${layout.width - 64}, 12)`}>
                      <text fill={hexColor} fontSize={10} fontWeight="700">PK</text>
                    </g>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
