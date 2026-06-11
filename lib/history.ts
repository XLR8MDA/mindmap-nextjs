export interface MindmapEntry {
  id: string;
  query: string;
  markdown: string;
  createdAt: number;
}

const STORAGE_KEY = "mindmap-history";
const MAX_ENTRIES = 50;

export function loadHistory(): MindmapEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MindmapEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(query: string, markdown: string): MindmapEntry {
  const entry: MindmapEntry = {
    id: Date.now().toString(),
    query,
    markdown,
    createdAt: Date.now(),
  };
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry;
}

export function deleteEntry(id: string): MindmapEntry[] {
  const updated = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
