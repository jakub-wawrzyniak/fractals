import { Ticker } from "pixi.js";
import { Complex } from "../shared";
import { store } from "../store";
import { ticker } from "./ticker";

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

function initPosition() {
  const center = store.fractal.getConfig().offsetGraphInComplex;
  return new Position(center.real, center.imaginary, 1);
}

export const TILE_SIZE_PX = 512;
class ViewerState {
  private progress = 1;
  private goingFrom = initPosition();
  private goingTo = initPosition();
  current = initPosition();
  newTilesReady = false;
  isCacheStale = true;

  private resetTransition() {
    const isInTarget = this.current.equals(this.goingTo);
    this.progress = isInTarget ? 1 : 0;
    this.goingFrom = this.current.clone();
    this.startTicker();
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

  private startTicker() {
    if (Ticker.shared.started) return;
    else Ticker.shared.start();
  }

  onTileLoaded() {
    this.newTilesReady = true;
    this.startTicker();
  }

  onCacheInvalid() {
    this.isCacheStale = true;
    this.startTicker();
  }

  onFractalChange() {
    this.jumpTo(initPosition());
    this.onCacheInvalid();
  }

  shouldDraw() {
    const inTransition = this.progress !== 1;
    const drawsNewTiles = this.newTilesReady;
    this.newTilesReady = false;
    return inTransition || drawsNewTiles || this.isCacheStale;
  }

  applyScheduledChange() {
    if (this.progress === 1) return;

    const PROGRESS_EVERY_FRAME = 0.01;
    const before = this.progress;
    const after = before + PROGRESS_EVERY_FRAME * ticker.elapsedFrames;

    const reachesTarget = after > 1;
    if (reachesTarget) {
      this.current = this.goingTo.clone();
      this.progress = 1;
      return;
    }

    const fullDistance = this.goingFrom.distanceTo(this.goingTo);
    const travelsPart = easeOut(after) - easeOut(before);
    const travelsDistance = fullDistance.multiply(travelsPart);
    this.current.changeBy(travelsDistance);
    this.progress = after;
  }
}

export const state = new ViewerState();

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};
