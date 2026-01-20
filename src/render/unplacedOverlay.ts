// render/unplacedOverlay.ts

import { App, setIcon, HoverParent } from "obsidian";
import { HillItem } from "../adapter";

export function renderUnplacedOverlay(
  app: App,
  containerEl: HTMLElement,
  items: HillItem[],
  hoverParent: HoverParent
): () => void {
  const cleanup: (() => void)[] = [];

  const overlay = containerEl.createDiv({
    cls: ["hill-unplaced-overlay", "is-collapsed"],
  });

  const toggle = overlay.createDiv("hill-unplaced-toggle");
  const icon = toggle.createSpan();
  const label = toggle.createSpan();

  const updateToggle = (collapsed: boolean) => {
    setIcon(icon, collapsed ? "chevron-right" : "chevron-down");
    label.textContent = collapsed ? "Open notes" : "Hide notes";
  };

  updateToggle(true);

  const onToggleClick = (e: MouseEvent) => {
    e.stopPropagation();
    const collapsed = overlay.classList.toggle("is-collapsed");
    updateToggle(collapsed);
  };

  toggle.addEventListener("click", onToggleClick);
  cleanup.push(() => toggle.removeEventListener("click", onToggleClick));

  for (const item of items) {
    const text = item.label.slice(0, -3);

    const row = overlay.createDiv("hill-unplaced-item");
    row.draggable = true;

    const link = row.createEl("a", {
      text,
      cls: "internal-link",
    });

    const onMouseOver = (evt: MouseEvent) => {
      app.workspace.trigger("hover-link", {
        event: evt,
        source: "hill-chart",
        hoverParent,
        targetEl: link,
        linktext: item.path,
      });
    };

    const onDblClick = (e: MouseEvent) => {
      e.preventDefault();
      void app.workspace.openLinkText(item.path, "", true);
    };

    const onDragStart = (e: DragEvent) => {
      e.dataTransfer?.setData("text/plain", item.path);
    };

    link.addEventListener("mouseover", onMouseOver);
    link.addEventListener("dblclick", onDblClick);
    row.addEventListener("dragstart", onDragStart);

    cleanup.push(() => {
      link.removeEventListener("mouseover", onMouseOver);
      link.removeEventListener("dblclick", onDblClick);
      row.removeEventListener("dragstart", onDragStart);
    });
  }

  return () => {
    cleanup.forEach(fn => fn());
    overlay.remove(); // defensive DOM cleanup
  };
}
