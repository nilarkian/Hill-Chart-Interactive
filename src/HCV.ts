// hcv.ts
import { BasesView, QueryController, HoverPopover} from "obsidian";
import { createHillItem } from "./adapter";
import { renderHill } from "./render";

export class HCV extends BasesView {
  readonly type = "hill-chart-view";

  hoverPopover: HoverPopover | null = null;

  private containerEl: HTMLElement;
  private lastData: this["data"] | null = null;


  private cleanupHill: (() => void) | null = null;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl;
  }

  onload(): void {
    this.safeRender();
  }

  onDataUpdated(): void {
    this.lastData = this.data;
    this.safeRender();
  }

  private safeRender(): void {
    this.containerEl.empty();

    if (!this.lastData) {
      this.containerEl.createDiv({ text: "Loading hill…" });
      return;
    }

    const items = this.lastData.data
      .map(createHillItem)
      .filter((x): x is NonNullable<typeof x> => !!x);

    this.cleanupHill?.();
    this.cleanupHill = renderHill(this.app, this.containerEl, items, this);
  }

  onClose(): void {
    this.cleanupHill?.();
    this.cleanupHill = null;
  }
}
