import { Fractal, FRACTAL_CONFIG, INIT_FRACTAL } from "../shared";
import { Position } from "./position";
import { Ticker } from "./ticker";

function easeOut(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function initPosition(variant: Fractal): Position {
  const center = FRACTAL_CONFIG[variant].offsetGraphInComplex;
  return new Position(center.real, center.imaginary, 1);
}

export class ScreenPosition {
  private readonly ticker: Ticker;
  private goingFrom = initPosition(INIT_FRACTAL);
  private goingTo = initPosition(INIT_FRACTAL);
  private progress = 1;
  current = initPosition(INIT_FRACTAL);

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  jumpTo(target: Position) {
    this.goingTo = target.clone();
    this.current = target.clone();
    this.goingFrom = target.clone();
    this.progress = 1;
    this.ticker.start();
  }

  changeGoingToBy(vector: Position) {
    this.goingFrom = this.current.clone();
    this.goingTo.changeBy(vector);
    const isInTarget = this.current.equals(this.goingTo);
    this.progress = isInTarget ? 1 : 0;
    this.ticker.start();
  }

  applyScheduledChange() {
    if (this.progress === 1) return false;

    const PROGRESS_EVERY_MS = 0.0007;
    const elapsedMs = this.ticker.sincePreviousFrame;
    const before = this.progress;
    const after = before + PROGRESS_EVERY_MS * elapsedMs;

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
