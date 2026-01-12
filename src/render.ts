// render.ts

import { HillItem } from "./adapter";
import HillChart from "hill-chart";
import { App, Notice, TFile } from "obsidian";
import { getHillColor } from "./hillColor";
import { exportHillToVault } from "./export";
import { setIcon } from "obsidian";




async function updateHillPos(
  app: App,
  filePath: string,
  description: string,
  newHillPos: number
) {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!(file instanceof TFile)) return; // guard invalid files

  const cache = app.metadataCache.getFileCache(file);
  const current = cache?.frontmatter?.hillPos;

  if (typeof current === "number" && current === newHillPos) return; // no-op guard

  await app.fileManager.processFrontMatter(file, (fm) => {
    fm.hillPos = newHillPos;
  });
}

export function renderHill(
  app: App,
  containerEl: HTMLElement,
  items: HillItem[]
): void {
  
  // --- debounce state (per file) ---
const writeTimers = new Map<string, number>();

// --- last committed hill position (per file) ---
const lastCommittedPos = new Map<string, number>();

  containerEl.empty(); // clean rerender
  containerEl.style.position = "relative"; // anchor overlay
  containerEl.style.width = "100%";
  containerEl.style.height = "100%";


  const unplaced = items.filter(i => !i.pos || i.pos <= 0);
const placed   = items.filter(i => i.pos && i.pos > 0);


  // --- hill pane (base layer) ---
  const hillPane = containerEl.createDiv("hill-chart-pane");


  if (placed.length === 0 && unplaced.length === 0) return; // nothing to render

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("hill-chart");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  hillPane.appendChild(svg);

  // --- initialize committed positions (placed only) ---
  lastCommittedPos.clear();
  for (const item of placed) {
    lastCommittedPos.set(item.path, item.pos);
  }

  const data = placed.map((item) => ({
    id: item.path,
    description: item.label.slice(0, -3),
    x: item.pos, // absolute 0–100
   
    size: Number(
  getComputedStyle(document.documentElement)
    .getPropertyValue("--hill-chart-point-size")
) || 8,

    color: getHillColor(item.pos),
  }));

  const rect = hillPane.getBoundingClientRect();
  const W = Math.max(300, rect.width);
  const H = Math.max(450, rect.height);

  const config = {
    target: svg,
    width: W,
    height: H,
    darkMode:
  getComputedStyle(document.documentElement)
    .getPropertyValue("--hill-chart-dark-mode")
    .trim() === "1",

    preview: false,
    // backgroundColor: "transparent",
    footerText: { show: true },
    margin: { top: 20, right: 20, bottom: 50, left: 20 },
  };

  const hill = new HillChart(data, config);
  hill.render();
  addLabelBackgrounds(svg);
  bringHoveredGroupToFront(svg);
  

  // --- export button (top-left overlay) ---
const btn = document.createElement("button");
btn.className = "hill-export-btn";
btn.textContent = "📸";
btn.onclick = async () => {
  // console.log("[hill-export] clicked");
  await exportHillToVault(this. app, svg);
  
  // console.log("[hill-export] done");
};

containerEl.appendChild(btn);



  
function addLabelBackgrounds(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGGElement>(".hill-chart-group").forEach(g => {
    const text = g.querySelector("text");
    if (!text) return;

    const bbox = text.getBBox();

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(bbox.x - 4));
    rect.setAttribute("y", String(bbox.y - 2));
    rect.setAttribute("width", String(bbox.width + 20));
    rect.setAttribute("height", String(bbox.height + 4));
    rect.setAttribute("rx", "3");
    rect.classList.add("hill-label-bg");

    g.insertBefore(rect, text);
  });
}
function bringHoveredGroupToFront(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGGElement>(".hill-chart-group").forEach(g => {
    g.addEventListener("mouseenter", () => {
      const parent = g.parentNode;
      if (parent) parent.appendChild(g); // SVG z-order = DOM order
    });
  });
}



  // --- navigation (placed items) ---
  hill.on("pointClick", async (payload: unknown) => {
    const p = payload as { description?: string };
    if (!p?.description) return;

    await app.workspace.openLinkText(p.description, "", false);
  });

  // --- persist only on real movement ---
  hill.on("moved", (payload: unknown) => {
    const p = payload as { id?: string; description?: string; x: number };
    if (!p?.id) return;

    const newHillPos = Math.min(100, Math.max(0, Math.round(p.x)));
    const prevPos = lastCommittedPos.get(p.id);

    if (prevPos === newHillPos) return; // ignore click / jitter

    lastCommittedPos.set(p.id, newHillPos);

    const prevTimer = writeTimers.get(p.id);
    if (prevTimer) window.clearTimeout(prevTimer);

    const timer = window.setTimeout(() => {
      updateHillPos(app, p.id!, p.description!, newHillPos);
      new Notice(`⛰️ position of ${p.description!} is ${newHillPos}`);
      writeTimers.delete(p.id!);
    }, 150);

    writeTimers.set(p.id, timer);
  });

  // --- unplaced overlay ---
  if (unplaced.length > 0) {
  const overlay = containerEl.createDiv("hill-unplaced-overlay");

  // --- toggle button ---
  overlay.classList.add("is-collapsed");
const toggle = overlay.createDiv("hill-unplaced-toggle");

const icon = toggle.createSpan();
const label = toggle.createSpan();

const updateToggle = () => {
  const collapsed = overlay.classList.contains("is-collapsed");
  setIcon(icon, collapsed ? "chevron-right" : "chevron-down");
  label.textContent = collapsed ? "Open notes" : "Hide notes";
};

updateToggle();

toggle.addEventListener("click", (e) => {
  e.stopPropagation();
  overlay.classList.toggle("is-collapsed");
  updateToggle();
});














  // --- items ---
  for (const item of unplaced) {
    const row = overlay.createDiv("hill-unplaced-item");
    row.textContent = item.label.slice(0, -3);
    row.draggable = true;

    row.addEventListener("click", async (e) => {
      e.preventDefault();
      await app.workspace.openLinkText(item.label, "", false);
    });

    row.addEventListener("dragstart", (e) => {
      e.dataTransfer!.setData("text/plain", item.path);
    });
  }
}



  // --- allow drop from overlay onto hill ---
  hillPane.addEventListener("dragover", (e) => e.preventDefault());

  hillPane.addEventListener("drop", (e) => {
    e.preventDefault();

    const path = e.dataTransfer!.getData("text/plain");
    if (!path) return;

    const r = svg.getBoundingClientRect();
    const x = e.clientX - r.left;
    const t = Math.min(1, Math.max(0, x / r.width));
    const newHillPos = Math.round(t * 100);

    updateHillPos(app, path, path, newHillPos); // first real placement
  });



}