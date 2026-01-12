// hillColor.ts

const COLOR_LUT: string[] = new Array(101);

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

// build once
(function buildLUT() {
  const stops = [
  { t: 0.0, h: 0   },   // red
  { t: 0.33, h: 50  },  // yellow
  { t: 0.66, h: 120 },  // green
  { t: 1.0, h: 170 },  // teal
];



  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    let j = 0;
    while (j < stops.length - 1 && t > stops[j + 1].t) j++;
    const a = stops[j], b = stops[j + 1];
    const lt = (t - a.t) / (b.t - a.t);
    const h = a.h + (b.h - a.h) * lt;
    COLOR_LUT[i] = hslToHex(h, 85, 55);
  }
})();

export function getHillColor(hillPos: number): string {
  if (!Number.isFinite(hillPos)) return "#9CA3AF";
  return COLOR_LUT[clamp(Math.round(hillPos), 0, 100)];
}
