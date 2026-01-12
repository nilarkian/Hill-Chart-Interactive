import { Plugin } from "obsidian";
import { HCV } from "./src/HCV";
import { HillChartSettingTab } from "./settings";
import {
  DEFAULT_SETTINGS,
  HillChartSettings,
  applyHillChartSettings,
} from "./settingTypes";

export const HCV_VIEW = "hill-chart-view";

export default class HillChartPlugin extends Plugin {
  settings!: HillChartSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new HillChartSettingTab(this.app, this));
    applyHillChartSettings(this.settings);

    this.registerBasesView(HCV_VIEW, {
      name: "Hill Chart",
      icon: "lucide-mountain",
      factory: (controller, containerEl) => {
        return new HCV(controller, containerEl);
      },
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    applyHillChartSettings(this.settings);
  }
}
