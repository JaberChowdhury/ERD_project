import { create } from "zustand";
import dagre from "dagre";
import LZString from "lz-string";
import { parseCode } from "../lib/parser";
import type { TableData, RelationshipData } from "../lib/parser";

export interface NodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasSettings {
  nodesep: number;
  ranksep: number;
  pathType: "bezier" | "step" | "straight";
  pathAnimation: boolean;
  edgeArrows: boolean;
  edgeThickness: number;
  tableShadow: boolean;
  shadowBlur: number;
  fieldStriping: boolean;
  headerHeight: number;
  rowPadding: number;
  minTableWidth: number;
  contentPadding: number;
  borderRadius: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  iconSize: number;
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
  exportStatus: string;
  exportProgress: number;
  exportLogs: string[];
  previewDataUrl: string | null;
  previewType: "svg" | "png" | "gif" | null;
  showGrid: boolean;
  isHandMode: boolean;
  theme: "light" | "dark" | "system";
  canvasSettings: CanvasSettings;

  setCode: (code: string) => void;
  setHoveredTable: (table: string | null) => void;
  setHoveredEdge: (edgeId: string | null) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setViewport: (scale: number, translateX: number, translateY: number) => void;
  resetView: (containerWidth: number, containerHeight: number) => void;
  setExportState: (
    isExporting: boolean,
    status?: string,
    progress?: number,
  ) => void;
  addExportLog: (log: string) => void;
  setPreview: (url: string | null, type?: "svg" | "png" | "gif" | null) => void;
  clearExportLogs: () => void;
  setShowGrid: (show: boolean) => void;
  setHandMode: (mode: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
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

const getInitialState = () => {
  const defaultState = {
    code: initialCode,
    settings: {
      nodesep: 60,
      ranksep: 250,
      pathType: "bezier" as const,
      pathAnimation: true,
      edgeArrows: true,
      edgeThickness: 2,
      tableShadow: true,
      shadowBlur: 15,
      fieldStriping: true,
      headerHeight: 48,
      rowPadding: 10,
      minTableWidth: 260,
      contentPadding: 16,
      borderRadius: "1.5rem", // 24px default
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontWeight: "normal",
      fontSize: 12,
      iconSize: 16,
    },
  };

  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#data=")) {
      const compressed = hash.substring(6);
      const decompressed =
        LZString.decompressFromEncodedURIComponent(compressed);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        if (parsed.code) defaultState.code = parsed.code;
        if (parsed.settings)
          defaultState.settings = {
            ...defaultState.settings,
            ...parsed.settings,
          };
      }
    } else if (hash && hash.startsWith("#code=")) {
      const compressed = hash.substring(6);
      const decompressed =
        LZString.decompressFromEncodedURIComponent(compressed);
      if (decompressed) defaultState.code = decompressed;
    }
  } catch (e) {
    console.error("Failed to parse shared code", e);
  }
  return defaultState;
};

const initialState = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  code: initialState.code,
  tables: [],
  relationships: [],
  nodesLayout: {},
  hoveredTable: null,
  hoveredEdge: null,
  scale: 1,
  translateX: 0,
  translateY: 0,
  isExporting: false,
  exportStatus: "",
  exportProgress: 0,
  exportLogs: [],
  previewDataUrl: null,
  previewType: null,
  showGrid: true,
  isHandMode: false,
  theme: "light", // Default sweet white
  canvasSettings: initialState.settings,

  setPreview: (url, type) =>
    set({ previewDataUrl: url, previewType: type || null }),
  setHandMode: (mode) => set({ isHandMode: mode }),
  setTheme: (theme) => set({ theme }),
  updateCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
    if (
      settings.nodesep !== undefined ||
      settings.ranksep !== undefined ||
      settings.fontSize !== undefined ||
      settings.iconSize !== undefined ||
      settings.headerHeight !== undefined ||
      settings.rowPadding !== undefined ||
      settings.minTableWidth !== undefined ||
      settings.contentPadding !== undefined
    ) {
      get().compile();
    }
  },
  setCode: (code) => set({ code }),
  setHoveredTable: (table) => set({ hoveredTable: table }),
  setHoveredEdge: (edgeId) => set({ hoveredEdge: edgeId }),
  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodesLayout: {
        ...state.nodesLayout,
        [id]: { ...state.nodesLayout[id], x, y },
      },
    })),
  setViewport: (scale, translateX, translateY) =>
    set({ scale, translateX, translateY }),

  setExportState: (isExporting, status, progress) =>
    set((state) => ({
      isExporting,
      exportStatus: status ?? state.exportStatus,
      exportProgress: progress ?? state.exportProgress,
    })),

  addExportLog: (log) =>
    set((state) => ({ exportLogs: [...state.exportLogs, log] })),
  clearExportLogs: () => set({ exportLogs: [] }),
  setShowGrid: (show) => set({ showGrid: show }),

  resetView: (containerWidth: number, containerHeight: number) => {
    const { nodesLayout, tables } = get();
    if (tables.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    Object.values(nodesLayout).forEach((node) => {
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

    const translateX =
      (containerWidth - contentWidth * scale) / 2 - minX * scale;
    const translateY =
      (containerHeight - contentHeight * scale) / 2 - minY * scale;

    set({ scale, translateX, translateY });
  },

  compile: () => {
    const { code, canvasSettings } = get();
    const { tables, relationships } = parseCode(code);

    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: "LR",
      nodesep: canvasSettings.nodesep,
      ranksep: canvasSettings.ranksep,
      marginx: 50,
      marginy: 50,
    });
    g.setDefaultEdgeLabel(() => ({}));

    tables.forEach((t) => {
      // Calculate dynamic width and height based on font sizes and spacing settings
      const headerHeight = Math.max(
        canvasSettings.headerHeight,
        Math.max(canvasSettings.iconSize, canvasSettings.fontSize + 4) + 8,
      );
      const rowHeight = canvasSettings.fontSize + canvasSettings.rowPadding + 2;
      const width = Math.max(
        canvasSettings.minTableWidth,
        canvasSettings.fontSize * 14 + canvasSettings.contentPadding * 2,
      );
      const height = headerHeight + t.fields.length * rowHeight;
      g.setNode(t.name, { width, height });
    });

    relationships.forEach((r) => {
      if (g.hasNode(r.sourceTable) && g.hasNode(r.targetTable)) {
        g.setEdge(r.sourceTable, r.targetTable);
      }
    });

    dagre.layout(g);

    const nodesLayout: Record<string, NodeLayout> = {};
    tables.forEach((t) => {
      const node = g.node(t.name);
      if (node) {
        nodesLayout[t.name] = {
          id: t.name,
          x: node.x - node.width / 2,
          y: node.y - node.height / 2,
          width: node.width,
          height: node.height,
        };
      }
    });

    set({ tables, relationships, nodesLayout });

    setTimeout(() => {
      const el = document.getElementById("canvas-container");
      if (el) get().resetView(el.clientWidth, el.clientHeight);
    }, 50);
  },
}));
