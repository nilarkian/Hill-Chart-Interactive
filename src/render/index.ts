// render/index.ts

import { bringHoveredGroupToFront } from "./labelBackground";
import { App, HoverParent } from "obsidian";
import { HillItem } from "../adapter";
import { renderHillChart } from "./hillchart";
import { renderPlacedHoverTargets } from "./placedHover";
import { renderUnplacedOverlay } from "./unplacedOverlay";
import { updateHillPos } from "./persistence";

export function renderHill(
  app: App,
  containerEl: HTMLElement,
  items: HillItem[],
  hoverParent: HoverParent
): () => void {
  const cleanup: (() => void)[] = []; // teardown bucket
  let cleanupZOrder: (() => void) | null = null;
  let cleanupPlacedHover: (() => void) | null = null;
  let cleanupUnplaced: (() => void) | null = null;


  // --- container hygiene ---
  containerEl.empty();
  containerEl.style.position = "relative";
  containerEl.style.width = "100%";
  containerEl.style.height = "100%";

  const unplaced = items.filter(i => !i.pos || i.pos <= 0);
  const placed = items.filter(i => i.pos && i.pos > 0);

  if (placed.length === 0 && unplaced.length === 0) {
    return () => { }; // no-op cleanup
  }

  const {
    svg,
    hillPane,
    placedHoverLayer,
    placedItems,
  } = renderHillChart(app, containerEl, placed);
  cleanupZOrder?.();
  cleanupZOrder = bringHoveredGroupToFront(svg);


  // --- debounced hover refresh gate ---
  let hoverRefreshRaf: number | null = null;

  const refreshPlacedHover = () => {
    if (hoverRefreshRaf !== null) return; // already scheduled

    hoverRefreshRaf = requestAnimationFrame(() => {
      hoverRefreshRaf = null;

      cleanupPlacedHover?.();
      cleanupPlacedHover = renderPlacedHoverTargets(
        app,
        containerEl,
        svg,
        placedHoverLayer,
        placedItems,
        hoverParent
      );
    });
  };

  // --- drag & drop ---
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();

    const path = e.dataTransfer?.getData("text/plain");
    if (!path) return;

    const r = svg.getBoundingClientRect();
    const x = e.clientX - r.left;
    const t = Math.min(1, Math.max(0, x / r.width));
    const newHillPos = Math.round(t * 100);

    updateHillPos(app, path, path, newHillPos);

    // geometry changed → refresh hover
    refreshPlacedHover();
  };

  hillPane.addEventListener("dragover", onDragOver);
  hillPane.addEventListener("drop", onDrop);
  cleanup.push(() => {
    hillPane.removeEventListener("dragover", onDragOver);
    hillPane.removeEventListener("drop", onDrop);
  });

  // initial build
  refreshPlacedHover();

  // --- resize handling ---
  const onResize = () => refreshPlacedHover();
  window.addEventListener("resize", onResize);
  cleanup.push(() => window.removeEventListener("resize", onResize));

  cleanupUnplaced?.();
  cleanupUnplaced = renderUnplacedOverlay(
    app,
    containerEl,
    unplaced,
    hoverParent
  );


  // --- return teardown ---
  return () => {
    if (hoverRefreshRaf !== null) {
      cancelAnimationFrame(hoverRefreshRaf);
      hoverRefreshRaf = null;
    }
    cleanupPlacedHover?.();
    cleanupPlacedHover = null;

    cleanupZOrder?.();
    cleanupZOrder = null;

    cleanupUnplaced?.();
    cleanupUnplaced = null;


    cleanup.forEach(fn => fn());
  };
}
