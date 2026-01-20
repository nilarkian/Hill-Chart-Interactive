declare module "hill-chart" {
  type HillPoint = {
    id?: string;
    x?: number;
    y?: number;
    size?: number;
    color?: string;
    description?: string;
    link?: string;
  };

  type HillConfig = {
    target: string | SVGElement;
    width?: number;
    height?: number;
    preview?: boolean;
    darkMode?: boolean;
    backgroundColor?: string | boolean;
    footerText?: {
      show?: boolean;
      fontSize?: number;
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };

export default class HillChart {
  constructor(data: HillPoint[], config?: HillConfig);
  render(): void;
  on(
    event: "move" | "moved" | "home" | "end",
    handler: (...args: unknown[]) => void
  ): void;
}

}
