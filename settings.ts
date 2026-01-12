import { App, PluginSettingTab, Setting } from "obsidian";
import HillChartPlugin from "./main";
import { DEFAULT_SETTINGS } from "./settingTypes";

export class HillChartSettingTab extends PluginSettingTab {
  plugin: HillChartPlugin;

  constructor(app: App, plugin: HillChartPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // --- Unplaced notes font size ---
    new Setting(containerEl)
      .setName("Unplaced notes font size")
      .setDesc("Font size in rem (e.g. 0.85)")
      .addText(text =>
        text
          .setPlaceholder("0.85")
          .setValue(String(this.plugin.settings.unplacedFontSize))
          .onChange(async value => {
            const num = Number(value);
            if (Number.isNaN(num) || num <= 0) return;

            this.plugin.settings.unplacedFontSize = num;
            await this.plugin.saveSettings();
          })
      )
      .addExtraButton(btn =>
        btn.setIcon("rotate-ccw").onClick(async () => {
          this.plugin.settings.unplacedFontSize =
            DEFAULT_SETTINGS.unplacedFontSize;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    // --- Unplaced notes line height ---
    new Setting(containerEl)
      .setName("Unplaced notes line height")
      .setDesc("Line height (unitless, e.g. 1.4)")
      .addText(text =>
        text
          .setPlaceholder("1.4")
          .setValue(String(this.plugin.settings.unplacedLineHeight))
          .onChange(async value => {
            const num = Number(value);
            if (Number.isNaN(num) || num <= 0) return;

            this.plugin.settings.unplacedLineHeight = num;
            await this.plugin.saveSettings();
          })
      )
      .addExtraButton(btn =>
        btn.setIcon("rotate-ccw").onClick(async () => {
          this.plugin.settings.unplacedLineHeight =
            DEFAULT_SETTINGS.unplacedLineHeight;
          await this.plugin.saveSettings();
          this.display();
        })
      );


    // --- Hill chart group label font size ---
    new Setting(containerEl)
      .setName("Hill chart group label font size")
      .setDesc("Font size for group labels (rem)")
      .addText(text =>
        text
          .setPlaceholder("0.9")
          .setValue(String(this.plugin.settings.hillChartGroupFontSize))
          .onChange(async value => {
            const num = Number(value);
            if (Number.isNaN(num) || num <= 0) return;

            this.plugin.settings.hillChartGroupFontSize = num;
            await this.plugin.saveSettings();
          })
      );

  new Setting(containerEl)
  .setName("Hill chart point size")
  .setDesc("Size of points on the hill chart. ⚠️Requires refresh of view")
  .addText(text =>
    text
      .setPlaceholder("8")
      .setValue(String(this.plugin.settings.hillChartPointSize))
      .onChange(async value => {
        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) return;

        this.plugin.settings.hillChartPointSize = num;
        await this.plugin.saveSettings();
      })
  );



  new Setting(containerEl)
  .setName("Hill chart theme")
  .setDesc("Choose dark or light mode for the hill chart")
  .addDropdown(dropdown =>
    dropdown
      .addOption("dark", "Dark mode")
      .addOption("light", "Light mode")
      .setValue(this.plugin.settings.hillChartTheme)
      .onChange(async value => {
        this.plugin.settings.hillChartTheme = value as "dark" | "light";
        await this.plugin.saveSettings();
      })
  );

  }
}
