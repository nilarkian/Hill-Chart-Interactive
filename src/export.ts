// export.ts
import { Notice, App } from "obsidian";
import moment from "moment";

let cachedSvgText: string | null = null;
let cachedBg: string | null = null;
let cachedSvgRef: SVGSVGElement | null = null;

function inlineSvgStyles(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  const origWalker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
  const cloneWalker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);

  while (true) {
    const orig = origWalker.nextNode() as Element | null;
    const el = cloneWalker.nextNode() as Element | null;
    if (!orig || !el) break;

    const cs = getComputedStyle(orig);

    // inline only paint-critical styles (tight loop)
    el.setAttribute(
      "style",
      `fill:${cs.fill};stroke:${cs.stroke};stroke-width:${cs.strokeWidth};opacity:${cs.opacity};font:${cs.font};color:${cs.color}`
    );
  }

  return new XMLSerializer().serializeToString(clone);
}

export async function exportHillToVault(app: App, svg: SVGSVGElement) {
  // 🔁 invalidate cache if SVG instance changed
  if (cachedSvgRef !== svg) {
    cachedSvgRef = svg;
    cachedSvgText = null;
    cachedBg = null;
  }

  // background (once per SVG)
  if (!cachedBg) {
    const cs = getComputedStyle(svg);
    cachedBg =
      cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? cs.backgroundColor
        : "#ffffff";
  }

  // inline SVG once per SVG instance
  if (!cachedSvgText) {
    cachedSvgText = inlineSvgStyles(svg);
  }

  const img = new Image();
  const url = URL.createObjectURL(
    new Blob([cachedSvgText], { type: "image/svg+xml" })
  );

  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });

  const width = svg.viewBox.baseVal.width || svg.clientWidth;
  const height = svg.viewBox.baseVal.height || svg.clientHeight;
  if (!width || !height) return;

  const dpr = window.devicePixelRatio || 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = cachedBg!;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  URL.revokeObjectURL(url);

  const png = await new Promise<Blob>(res =>
    canvas.toBlob(b => res(b!), "image/png")
  );

  const filename = `Hill ${moment().format("Do MMMM YYYY hh.mmA")}.png`;
  const path = `3. resource/pictures/${filename}`;

  const buffer = await png.arrayBuffer();
  const existing = app.vault.getAbstractFileByPath(path);

  if (existing) {
    await app.vault.modifyBinary(existing as any, buffer);
  } else {
    await app.vault.createBinary(path, buffer);
  }

  await navigator.clipboard.writeText(`![[${filename}]]`);
  new Notice("📸 Hill saved to vault and link copied");
}
