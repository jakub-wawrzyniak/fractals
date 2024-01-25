import {
  Complex,
  Size,
  Point,
  Fractal,
  FRACTAL_CONFIG,
  INIT_FRACTAL,
  TILE_SIZE_PX,
} from "../shared";
import { Position } from "./position";
import { Renderer } from "pixi.js";
import { Ticker } from "./ticker";

function easeOut(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function initPosition(variant: Fractal): Position {
  const center = FRACTAL_CONFIG[variant].offsetGraphInComplex;
  return new Position(center.real, center.imaginary, 1);
}

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export class ScreenPosition {
  private goingFrom = initPosition(INIT_FRACTAL);
  private goingTo = initPosition(INIT_FRACTAL);
  ticker: Ticker;
  readonly size: Size;
  current = initPosition(INIT_FRACTAL);
  progress = 1;

  constructor(renderer: Renderer, ticker: Ticker) {
    this.size = renderer.view;
    this.ticker = ticker;
  }

  get inTransition() {
    return this.progress < 1;
  }

  jumpTo(target: Position) {
    this.goingTo = target.clone();
    this.current = target.clone();
    this.goingFrom = target.clone();
    this.progress = 1;
    this.ticker.start();
  }

  changeBy(vector: Position) {
    this.goingFrom = this.current.clone();
    this.goingTo.changeBy(vector);
    const isInTarget = this.current.equals(this.goingTo);
    this.progress = isInTarget ? 1 : 0;
    this.ticker.start();
  }

  pixelToComplex() {
    const tileSizeComplex = 2 ** this.current.level;
    return tileSizeComplex / TILE_SIZE_PX;
  }

  screenBoundsComplex(): Bounds {
    const pixelRatio = this.pixelToComplex();
    const widthComplex = this.size.width * pixelRatio;
    const heightComplex = this.size.height * pixelRatio;
    return {
      top: this.current.center.imaginary + heightComplex * 0.5,
      bottom: this.current.center.imaginary - heightComplex * 0.5,
      left: this.current.center.real - widthComplex * 0.5,
      right: this.current.center.real + widthComplex * 0.5,
    };
  }

  complexToViewport(position: Complex): Point {
    const pixelRatio = 1 / this.pixelToComplex();
    const distance: Complex = {
      real: position.real - this.current.center.real,
      imaginary: position.imaginary - this.current.center.imaginary,
    };

    return {
      x: this.size.width * 0.5 + distance.real * pixelRatio,
      y: this.size.height * 0.5 - distance.imaginary * pixelRatio,
    };
  }

  viewportToComplex(position: Point): Complex {
    const pixelRatio = this.pixelToComplex();
    const change: Point = {
      x: position.x - this.size.width * 0.5,
      y: position.y - this.size.height * 0.5,
    };

    return {
      real: this.current.center.real + change.x * pixelRatio,
      imaginary: this.current.center.imaginary - change.y * pixelRatio,
    };
  }

  applyScheduledChange() {
    if (this.progress === 1) return false;

    const PROGRESS_EVERY_FRAME = 0.01;
    const frames = this.ticker.elapsedFrames;
    const before = this.progress;
    const after = before + PROGRESS_EVERY_FRAME * frames;

    const reachesTarget = after >= 1;
    if (reachesTarget) {
      this.jumpTo(this.goingTo);
      return;
    }

    const fullDistance = this.goingFrom.distanceTo(this.goingTo);
    const travelsPart = easeOut(after) - easeOut(before);
    const travelsDistance = fullDistance.multiply(travelsPart);
    this.current.changeBy(travelsDistance);
    this.progress = after;
    this.ticker.start();
  }
}
