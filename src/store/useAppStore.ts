import { create } from 'zustand';
import dagre from 'dagre';
import LZString from 'lz-string';
import { parseCode } from '../lib/parser';
import type { TableData, RelationshipData } from '../lib/parser';

export interface NodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AppState {
  code: string;
  tables: TableData[];
  relationships: RelationshipData[];
  nodesLayout: Record<string, NodeLayout>;
  hoveredTable: string | null;
  hoveredEdge: string | null;
  
  scale: number;
  translateX: number;
  translateY: number;

  isExporting: boolean;
  exportTitle: string;
  exportProgress: number;
  exportLogs: string[];
  showGrid: boolean;
  isHandMode: boolean;

  setCode: (code: string) => void;
  setHoveredTable: (table: string | null) => void;
  setHoveredEdge: (edgeId: string | null) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setViewport: (scale: number, translateX: number, translateY: number) => void;
  resetView: (containerWidth: number, containerHeight: number) => void;
  setExportState: (isExporting: boolean, title?: string, progress?: number) => void;
  addExportLog: (log: string) => void;
  clearExportLogs: () => void;
  setShowGrid: (show: boolean) => void;
  setHandMode: (mode: boolean) => void;
  compile: () => void;
}

const initialCode = `users [icon: user, color: blue] {
  id string pk
  fullName string
  email string
  phone string
  passwordHash string
  profileImage string
  isVerified boolean
  createdAt timestamp
  updatedAt timestamp
}

roles [icon: shield, color: purple] {
  id string pk
  name string
}

user_roles [icon: users, color: purple] {
  userId string
  roleId string
}

tenant_profiles [icon: search, color: green] {
  userId string pk
  occupation string
  preferredLocation string
  budgetMin number
  budgetMax number
}

properties [icon: building, color: orange] {
  id string pk
  ownerId string
  postedById string
  title string
  description text
  rentAmount number
  propertyType string
  availableFrom date
  isAvailable boolean
  status string
  viewCount number
  createdAt timestamp
  updatedAt timestamp
}

users.id <> user_roles.userId
roles.id <> user_roles.roleId
users.id - tenant_profiles.userId
users.id < properties.ownerId
users.id < properties.postedById`;

const getInitialCode = () => {
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#code=')) {
      const compressed = hash.substring(6);
      const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
      if (decompressed) return decompressed;
    }
  } catch (e) {
    console.error("Failed to parse shared code", e);
  }
  return initialCode;
};

export const useAppStore = create<AppState>((set, get) => ({
  code: getInitialCode(),
  tables: [],
  relationships: [],
  nodesLayout: {},
  hoveredTable: null,
  hoveredEdge: null,
  scale: 1,
  translateX: 0,
  translateY: 0,
  isExporting: false,
  exportTitle: 'Exporting...',
  exportProgress: 0,
  exportLogs: [],
  showGrid: true,
  isHandMode: false,

  setHandMode: (mode) => set({ isHandMode: mode }),
  setCode: (code) => set({ code }),
  setHoveredTable: (table) => set({ hoveredTable: table }),
  setHoveredEdge: (edgeId) => set({ hoveredEdge: edgeId }),
  updateNodePosition: (id, x, y) => set((state) => ({
    nodesLayout: {
      ...state.nodesLayout,
      [id]: { ...state.nodesLayout[id], x, y }
    }
  })),
  setViewport: (scale, translateX, translateY) => set({ scale, translateX, translateY }),
  
  setExportState: (isExporting, title, progress) => set((state) => ({
    isExporting,
    exportTitle: title ?? state.exportTitle,
    exportProgress: progress ?? state.exportProgress
  })),

  addExportLog: (log) => set((state) => ({ exportLogs: [...state.exportLogs, log] })),
  clearExportLogs: () => set({ exportLogs: [] }),
  setShowGrid: (show) => set({ showGrid: show }),

  resetView: (containerWidth: number, containerHeight: number) => {
    const { nodesLayout, tables } = get();
    if (tables.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    Object.values(nodesLayout).forEach(node => {
      const right = node.x + node.width;
      const bottom = node.y + node.height;
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) return;

    const scaleX = (containerWidth - 100) / contentWidth;
    const scaleY = (containerHeight - 100) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const translateX = (containerWidth - (contentWidth * scale)) / 2 - (minX * scale);
    const translateY = (containerHeight - (contentHeight * scale)) / 2 - (minY * scale);

    set({ scale, translateX, translateY });
  },

  compile: () => {
    const { code } = get();
    const { tables, relationships } = parseCode(code);
    
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 250, marginx: 50, marginy: 50 });
    g.setDefaultEdgeLabel(() => ({}));

    tables.forEach(t => {
      const width = 260;
      const height = 45 + (t.fields.length * 33);
      g.setNode(t.name, { width, height });
    });

    relationships.forEach(r => {
      if (g.hasNode(r.sourceTable) && g.hasNode(r.targetTable)) {
        g.setEdge(r.sourceTable, r.targetTable);
      }
    });

    dagre.layout(g);

    const nodesLayout: Record<string, NodeLayout> = {};
    tables.forEach(t => {
      const node = g.node(t.name);
      if (node) {
        nodesLayout[t.name] = {
          id: t.name,
          x: node.x - node.width / 2,
          y: node.y - node.height / 2,
          width: node.width,
          height: node.height
        };
      }
    });

    set({ tables, relationships, nodesLayout });

    setTimeout(() => {
      const el = document.getElementById('canvas-container');
      if (el) get().resetView(el.clientWidth, el.clientHeight);
    }, 50);
  }
}));
