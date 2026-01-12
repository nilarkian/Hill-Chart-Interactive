export interface HillChartSettings {
  unplacedFontSize: number;
  unplacedLineHeight: number;
  hillChartGroupFontSize: number;
  hillChartPointSize: number;
  hillChartTheme: "dark" | "light"; // NEW

}

export const DEFAULT_SETTINGS: HillChartSettings = {
  unplacedFontSize: 0.85,
  unplacedLineHeight: 1.4,
  hillChartGroupFontSize: 1,
  hillChartPointSize: 8,
   hillChartTheme: "dark",
};

export function applyHillChartSettings(settings: HillChartSettings) {
  const root = document.documentElement;

  root.style.setProperty(
    "--hill-unplaced-font-size",
    `${settings.unplacedFontSize}rem`
  );

  root.style.setProperty(
    "--hill-unplaced-line-height",
    String(settings.unplacedLineHeight)
  );

  
  root.style.setProperty(
    "--hill-chart-group-font-size",
    `${settings.hillChartGroupFontSize}rem`
  );
  
   root.style.setProperty(
    "--hill-chart-point-size",
    String(settings.hillChartPointSize)
  );

  root.style.setProperty(
    "--hill-chart-dark-mode",
    settings.hillChartTheme === "dark" ? "1" : "0"
  );
}
