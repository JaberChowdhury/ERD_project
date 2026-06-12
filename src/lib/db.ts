// Use a global variable to ensure the map persists across hot-reloads in development
const globalForDb = globalThis as unknown as {
  _linkMap: Map<string, string>;
};

const linkMap = globalForDb._linkMap || new Map<string, string>();
if (process.env.NODE_ENV !== 'production') {
  globalForDb._linkMap = linkMap;
}

export function saveLink(id: string, payload: string) {
  linkMap.set(id, payload);
}

export function getLink(id: string): string | null {
  return linkMap.get(id) || null;
}
