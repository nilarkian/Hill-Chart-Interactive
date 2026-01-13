import { App } from "obsidian";
import { exportHillToVault } from "../export";

export function attachExportButton(
  app: App,
  containerEl: HTMLElement,
  svg: SVGSVGElement
) {
  const btn = document.createElement("button");
  btn.className = "hill-export-btn";
  btn.textContent = "📸";

  btn.onclick = async () => {
    await exportHillToVault(app, svg);
  };

  containerEl.appendChild(btn);
}
