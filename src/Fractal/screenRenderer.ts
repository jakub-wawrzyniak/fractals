import { Renderer } from "pixi.js";
import { Complex, Point, INIT_VIEWER_SIZE, TILE_SIZE_PX } from "../shared";
import { ScreenPosition } from "./screenPosition";

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export class ScreenRenderer extends Renderer {
  private readonly position: ScreenPosition;
  constructor(screen: ScreenPosition) {
    super({
      background: "#111",
      ...INIT_VIEWER_SIZE,
    });
    this.position = screen;
  }

  get current() {
    return this.position.current;
  }

  pixelToComplex() {
    const tileSizeComplex = 2 ** this.current.level;
    return tileSizeComplex / TILE_SIZE_PX;
  }

  complexToViewport(position: Complex): Point {
    const pixelRatio = 1 / this.pixelToComplex();
    const distance: Complex = {
      re: position.re - this.current.center.re,
      im: position.im - this.current.center.im,
    };

    return {
      x: this.width * 0.5 + distance.re * pixelRatio,
      y: this.height * 0.5 - distance.im * pixelRatio,
    };
  }

  viewportToComplex(position: Point): Complex {
    const pixelRatio = this.pixelToComplex();
    const change: Point = {
      x: position.x - this.width * 0.5,
      y: position.y - this.height * 0.5,
    };

    return {
      re: this.current.center.re + change.x * pixelRatio,
      im: this.current.center.im - change.y * pixelRatio,
    };
  }

  screenBoundsComplex(): Bounds {
    const topLeft = this.viewportToComplex({ x: 0, y: 0 });
    const bottomRight = this.viewportToComplex({
      x: this.width,
      y: this.height,
    });
    return {
      left: topLeft.re,
      top: topLeft.im,
      right: bottomRight.re,
      bottom: bottomRight.im,
    };
  }
}
