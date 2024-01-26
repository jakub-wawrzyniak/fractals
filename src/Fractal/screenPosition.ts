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
  private progress = 1;
  private variant: Fractal = INIT_FRACTAL;
  private readonly goingFrom = initPosition(this.variant);
  private readonly goingTo = initPosition(this.variant);
  readonly current = initPosition(this.variant);

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  private resetTransition() {
    this.goingFrom.changeTo(this.current);
    const isInTarget = this.current.equals(this.goingTo);
    this.progress = isInTarget ? 1 : 0;
    this.ticker.start();
  }

  private jumpTo(target: Position) {
    this.goingTo.changeTo(target);
    this.goingFrom.changeTo(target);
    this.current.changeTo(target);
    this.progress = 1;
    this.ticker.start();
  }

  changeGoingToBy(vector: Position) {
    this.goingTo.changeBy(vector);
    this.resetTransition();
  }

  setGoingTo(target: Position) {
    this.goingTo.changeTo(target);
    this.resetTransition();
  }

  onConfigChanged(newVariant: Fractal) {
    if (newVariant === this.variant) return;
    this.variant = newVariant;
    this.setGoingTo(initPosition(newVariant));
  }

  applyScheduledChange() {
    if (this.progress === 1) return;

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
