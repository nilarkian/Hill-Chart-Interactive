// render/placedHover.ts

import { App, HoverParent } from "obsidian";
import { HillItem } from "../adapter";

export function renderPlacedHoverTargets(
  app: App,
  containerEl: HTMLElement,
  svg: SVGSVGElement,
  layer: HTMLElement,
  placed: HillItem[],
  hoverParent: HoverParent
): () => void {
  const cleanup: (() => void)[] = [];

  layer.empty();

  const containerRect = containerEl.getBoundingClientRect();
  let ctrlDown = false;
  const hits: HTMLElement[] = [];

  const setHoverActive = (active: boolean) => {
    for (const h of hits) {
      h.style.pointerEvents = active ? "auto" : "none";
    }
  };

  // --- global keydown (scoped & removable) ---
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Control" && !ctrlDown) {
      ctrlDown = true;
      setHoverActive(true);
    }
  };

  window.addEventListener("keydown", onKeyDown);
  cleanup.push(() => window.removeEventListener("keydown", onKeyDown));

  // --- build hit targets ---
  svg.querySelectorAll<SVGGElement>(".hill-chart-group").forEach(g => {
    const id = g.getAttribute("data-id");
    if (!id) return;

    const item = placed.find(p => p.path === id);
    if (!item) return;

    // pre-warm cache
    app.metadataCache.getFirstLinkpathDest(item.path, "");

    const rect = g.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const hit = layer.createEl("a", {
      cls: "hill-placed-hit i-link",
    });

    const pad = 4;
    hit.style.position = "absolute";
    hit.style.left   = `${rect.left - containerRect.left - pad}px`;
    hit.style.top    = `${rect.top  - containerRect.top  - pad}px`;
    hit.style.width  = `${rect.width  + pad * 2}px`;
    hit.style.height = `${rect.height + pad * 2}px`;
    hit.style.pointerEvents = "none"; // drag-first
    hit.style.willChange = "opacity";

    hits.push(hit);

    // --- hover (Ctrl-gated) ---
    const onMouseEnter = (evt: MouseEvent) => {
      if (!ctrlDown) return;
      app.workspace.trigger("hover-link", {
        event: evt,
        source: "hill-chart",
        hoverParent,
        targetEl: hit,
        linktext: item.path,
      });
    };

    const onMouseLeave = () => {
      ctrlDown = false;
      setHoverActive(false);
    };

    const onclick = (evt: MouseEvent) => {
      evt.preventDefault();
      app.workspace.openLinkText(item.path, "", true);
    };

    hit.addEventListener("mouseenter", onMouseEnter);
    hit.addEventListener("mouseleave", onMouseLeave);
    hit.addEventListener("click", onclick);

    cleanup.push(() => {
      hit.removeEventListener("mouseenter", onMouseEnter);
      hit.removeEventListener("mouseleave", onMouseLeave);
      // hit.removeEventListener("click", onclick);
    });
  });

  // --- teardown ---
  return () => {
    cleanup.forEach(fn => fn());
    layer.empty(); // defensive: remove orphaned hits
  };
}
