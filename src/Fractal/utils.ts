import { Complex, Point, Size } from "../shared";
import { Bounds, TILE_SIZE_PX, state } from "./state";

export class Task {
  private action: () => void;
  private runAfterMs: number;
  private timer: null | number = null;

  constructor(action: () => void, doAfterMs: number) {
    this.action = action;
    this.runAfterMs = doAfterMs;
  }

  schedule() {
    if (this.timer !== null) return;
    this.timer = setTimeout(this.action, this.runAfterMs);
  }

  cancel() {
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
  }
}

export function pixelToComplex(): number {
  const tileSizeComplex = 2 ** state.current.level;
  return tileSizeComplex / TILE_SIZE_PX;
}

export function screenBoundsComplex(size: Size): Bounds {
  const pixelRatio = pixelToComplex();
  const widthComplex = size.width * pixelRatio;
  const heightComplex = size.height * pixelRatio;
  const center = state.current.center;
  return {
    top: center.imaginary + heightComplex * 0.5,
    bottom: center.imaginary - heightComplex * 0.5,
    left: center.real - widthComplex * 0.5,
    right: center.real + widthComplex * 0.5,
  };
}

export function complexToViewport(position: Complex, screen: Size): Point {
  const pixelRatio = 1 / pixelToComplex();
  const center = state.current.center;
  const distance: Complex = {
    real: position.real - center.real,
    imaginary: position.imaginary - center.imaginary,
  };

  return {
    x: screen.width * 0.5 + distance.real * pixelRatio,
    y: screen.height * 0.5 - distance.imaginary * pixelRatio,
  };
}

export function viewportToComplex(position: Point, screen: Size): Complex {
  const pixelRatio = pixelToComplex();
  const center = state.current.center;
  const change: Point = {
    x: position.x - screen.width * 0.5,
    y: position.y - screen.height * 0.5,
  };

  return {
    real: center.real + change.x * pixelRatio,
    imaginary: center.imaginary - change.y * pixelRatio,
  };
}
