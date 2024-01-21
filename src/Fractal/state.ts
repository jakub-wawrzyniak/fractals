import { Complex, Point, Size } from "../shared";

export class Position {
  center: Complex;
  level: number;

  constructor(real: number, imaginary: number, level: number) {
    this.center = { real, imaginary };
    this.level = level;
  }

  clone() {
    return new Position(this.center.real, this.center.imaginary, this.level);
  }

  changeBy(vector: Position) {
    this.level += vector.level;
    this.center.real += vector.center.real;
    this.center.imaginary += vector.center.imaginary;
  }

  equals(pos: Position): boolean {
    return (
      this.level === pos.level &&
      this.center.real === pos.center.real &&
      this.center.imaginary === pos.center.imaginary
    );
  }

  distanceTo(pos: Position): Position {
    return new Position(
      pos.center.real - this.center.real,
      pos.center.imaginary - this.center.imaginary,
      pos.level - this.level
    );
  }

  multiply(factor: number): Position {
    return new Position(
      this.center.real * factor,
      this.center.imaginary * factor,
      this.level * factor
    );
  }
}

function easeOut(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export const TILE_SIZE_PX = 256;
const INIT_POSITION = new Position(0, 0, -2);
class State {
  current = INIT_POSITION.clone();
  private goingFrom = INIT_POSITION.clone();
  private goingTo = INIT_POSITION.clone();
  private progress = 1;

  private resetTransition() {
    const isInTarget = this.current.equals(this.goingTo);
    this.progress = isInTarget ? 1 : 0;
    this.goingFrom = this.current.clone();
  }

  jumpTo(target: Position) {
    this.goingTo = target;
    this.current = target.clone();
    this.resetTransition();
  }

  changeBy(vector: Position) {
    this.goingTo.changeBy(vector);
    this.resetTransition();
  }

  applyScheduledChange(elapsedFrames: number) {
    if (this.progress === 1) return;

    const PROGRESS_EVERY_FRAME = 0.01;
    const before = this.progress;
    const after = before + PROGRESS_EVERY_FRAME * elapsedFrames;

    const reachesTarget = after > 1;
    if (reachesTarget) {
      this.current = this.goingTo.clone();
      this.progress = 1;
    }

    const fullDistance = this.goingFrom.distanceTo(this.goingTo);
    const travelsPart = easeOut(after) - easeOut(before);
    const travelsDistance = fullDistance.multiply(travelsPart);
    this.current.changeBy(travelsDistance);
    this.progress = after;
  }
}

export const state = new State();

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function pixelToComplex(): number {
  const tileSizeComplex = 2 ** state.current.level;
  return tileSizeComplex / TILE_SIZE_PX;
}

export function screenBounds(size: Size): Bounds {
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
