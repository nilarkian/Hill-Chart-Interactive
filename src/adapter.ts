// adapter.ts

export interface HillItem {
  path: string;
  label: string;
  pos: number;
}

// hot path: optimized for Bases Value + number
function extractNumber(raw: any): number | null {
  if (raw == null) return null;

  // Bases Value
  if (typeof raw === "object" && typeof raw.isEmpty === "function") {
    if (raw.isEmpty()) return null;
    const n = Number(raw.data);
    return Number.isNaN(n) ? null : n;
  }

  // primitive (number / string)
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function createHillItem(entry: any): HillItem | null {
  const file = entry?.file;
  if (!file?.path) return null; // fast fail

  const n = extractNumber(entry.getValue("hillPos"));

  return {
    path: file.path,
    label: file.name ?? file.path,
    pos: n ?? 0, // missing / invalid => unplaced
  };
}
