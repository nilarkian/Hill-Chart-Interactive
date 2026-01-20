// adapter.ts

export interface HillItem {
  path: string;
  label: string;
  pos: number;
}

// hot path: optimized for Bases Value + number
function extractNumber(raw: unknown): number | null {
  if (raw == null) return null;

  // Bases value
  if (
    typeof raw === "object" &&
    raw !== null &&
    "isEmpty" in raw &&
    typeof (raw as any).isEmpty === "function" &&
    "data" in raw
  ) {
    const v = raw as { isEmpty(): boolean; data: unknown };
    if (v.isEmpty()) return null;

    const n = Number(v.data);
    return Number.isNaN(n) ? null : n;
  }

  // primitive (number / string)
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}


export function createHillItem(entry: unknown): HillItem | null {
  if (typeof entry !== "object" || entry === null) return null;

  const e = entry as {
    file?: { path?: string; name?: string };
    getValue?: (key: string) => unknown;
  };

  const file = e.file;
  if (!file?.path || typeof e.getValue !== "function") return null;

  const n = extractNumber(e.getValue("hillPos"));

  return {
    path: file.path,
    label: file.name ?? file.path,
    pos: n ?? 0, // missing / invalid => unplaced
  };
}

