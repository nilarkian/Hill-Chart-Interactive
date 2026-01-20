// render/hillChart.ts

import { addLabelBackgrounds} from "./labelBackground"; // label visuals
import { attachExportButton } from "./exportButton"; // export svg
import { App, Notice } from "obsidian"; // obsidian api
import HillChart from "hill-chart"; // chart lib
import { HillItem } from "../adapter"; // data adapter
import { getHillColor } from "../hillColor"; // color mapping
import { updateHillPos } from "./persistence"; // persistence

export function renderHillChart(
  app: App,
  containerEl: HTMLElement,
  placed: HillItem[]
) {
  const hillPane = containerEl.createDiv("hill-chart-pane"); // chart wrapper

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // svg root
  svg.classList.add("hill-chart"); // css hook
  svg.setAttribute("width", "100%"); // responsive
  svg.setAttribute("height", "100%"); // responsive
  hillPane.appendChild(svg); // mount svg

  // --- hover layer (used by placedHover) ---
const placedHoverLayer = containerEl.createDiv("hill-placed-hover-layer");
placedHoverLayer.addClass("hc-pos-absolute");
placedHoverLayer.addClass("hc-inset-0");
placedHoverLayer.addClass("hc-pointer-none");
placedHoverLayer.addClass("hc-z-hover");

// ⬆️ END BLOCK
const data = placed
  .filter(item => item.pos != null)
  .map(item => ({
    id: item.path, // stable id
    description: item.label.slice(0, -3), // label text
    x: item.pos, // position
    size:
      Number(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--hill-chart-point-size")
      ) || 8, // point size
    color: getHillColor(item.pos), // color by position
  }));


  const rect = hillPane.getBoundingClientRect(); // container size

  const hill = new HillChart(data, {
    target: svg, // render target
    width: Math.max(300, rect.width), // min width
    height: Math.max(450, rect.height), // min height
    darkMode:
      getComputedStyle(document.documentElement)
        .getPropertyValue("--hill-chart-dark-mode")
        .trim() === "1", // theme sync
    preview: false, // no preview mode
    footerText: { show: true }, // footer
    margin: { top: 20, right: 20, bottom: 50, left: 20 }, // layout
  });

  hill.render(); // draw chart

  addLabelBackgrounds(svg); // add rects behind labels
  attachExportButton(app, containerEl, svg); // export button

  svg.querySelectorAll<SVGGElement>(".hill-chart-group").forEach((g, i) => {
    const item = placed[i]; // corresponding item
    if (!item) return; // safety
    g.setAttribute("data-id", item.path); // bind id
  });

  hill.on("moved", (payload: unknown) => {
    const p = payload as { id?: string; description?: string; x: number }; // moved payload
    if (!p?.id) return; // guard

    const pos = Math.round(Math.min(100, Math.max(0, p.x))); // clamp
    void updateHillPos(app, p.id, p.description ?? "", pos);
    new Notice(`⛰️ position of ${p.description} is ${pos}`); // feedback
   
    requestAnimationFrame(() => {
      const evt = new Event("hillchart:moved");
      window.dispatchEvent(evt);
});

  });

  return {
    svg, // svg element
    hillPane, // container
    placedHoverLayer,
    placedItems: placed, // data
  };
}
