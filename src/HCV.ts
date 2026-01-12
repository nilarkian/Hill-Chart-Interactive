// hcv.ts
import { BasesView, QueryController } from "obsidian";
import { createHillItem } from "./adapter";
import { renderHill } from "./render";
import type { BasesQueryResult } from "obsidian";

export class HCV extends BasesView {
  readonly type = "hill-chart-view";

  private containerEl: HTMLElement; // required
  private lastData: BasesQueryResult | null = null; // cache data ourselves

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl;
    // console.log("[HCV] constructor");
  }

  onload(): void {
    // console.log("[HCV] onload");
    this.safeRender(); // render even if data not ready
  }

  onDataUpdated(): void {
    /* console.log("[HCV] onDataUpdated", {
      hasData: !!this.data,
      sameIdentity: this.lastData === this.data,
    });
 */
    this.lastData = this.data;
    this.safeRender();
  }

  private safeRender(): void {
    /* console.log("[HCV] safeRender", {
      connected: this.containerEl.isConnected,
      hasCachedData: !!this.lastData,
    }); */

    this.containerEl.empty();

    if (!this.lastData) {
      this.containerEl.createDiv({ text: "Loading hill…" });
      return;
    }

    const entries = this.lastData.data;
    // console.log("[HCV] rendering entries", entries.length);

    const items = entries
      .map(createHillItem)
      .filter((x): x is NonNullable<typeof x> => !!x);

    /* console.log("[HCV] hill items", items.length); */

    renderHill(this.app, this.containerEl, items);
  }
}