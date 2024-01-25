import { Sprite } from "pixi.js";
import { Complex, Point } from "../shared";
import { Bounds, ScreenPosition } from "./screenPosition";

const { floor } = Math;
export class Tile extends Sprite {
  private static cache = new Map<string, Tile>();
  status: "ready" | "empty" | "loading" | "updating" = "empty";
  lastUsedAt = -1;
  renderedForConfig: string = "";
  readonly hash: string;
  readonly level: number;
  readonly point: Point;

  private constructor(x: number, y: number, level: number, hash: string) {
    super();
    this.point = { x, y };
    this.level = level;
    this.hash = hash;
    this.name = hash;
    this.anchor.set(0, 1);
  }

  static getHash(x: number, y: number, level: number): string {
    return `l=${level}  x=${x}  y=${y}`;
  }

  static byHash(hash: string): Tile | undefined {
    return this.cache.get(hash);
  }

  static get(x: number, y: number, level: number): Tile {
    const hash = Tile.getHash(x, y, level);
    const cachedTile = this.cache.get(hash);
    if (cachedTile !== undefined) return cachedTile;
    const newTile = new Tile(x, y, level, hash);
    this.cache.set(hash, newTile);
    return newTile;
  }

  static deleteStaleCache(frameTimestamp: number, config: string) {
    for (const tile of Tile.cache.values()) {
      const notUsed = tile.lastUsedAt !== frameTimestamp;
      const stale = tile.renderedForConfig !== config;
      if (notUsed && stale) tile.destroy();
    }
  }

  static withPoint(level: number, point: Complex): Tile {
    const size = 2 ** level;
    const x = floor(point.real / size);
    const y = floor(point.imaginary / size);
    return Tile.get(x, y, level);
  }

  bounds(): Bounds {
    const sizeComplex = 2 ** this.level;
    const left = this.point.x * sizeComplex;
    const bottom = this.point.y * sizeComplex;
    return {
      left,
      bottom,
      right: left + sizeComplex,
      top: bottom + sizeComplex,
    };
  }

  center(): Complex {
    const sizeComplex = 2 ** this.level;
    return {
      real: (this.point.x + 0.5) * sizeComplex,
      imaginary: (this.point.y + 0.5) * sizeComplex,
    };
  }

  /**
   * Gets a tile, which is one level above this one.
   * Since tiles one level up are 4x larger, parent
   * tile contains in itself the whole child.
   */
  tileParent() {
    const level = this.level + 1;
    const x = floor(this.point.x / 2);
    const y = floor(this.point.y / 2);
    return Tile.get(x, y, level);
  }

  destroy(): void {
    this.status = "empty";
    this.texture.destroy();
    Tile.cache.delete(this.hash);
  }

  canBeDrawn() {
    return this.status === "ready" || this.status === "updating";
  }

  updatePositionOn(screen: ScreenPosition) {
    const { left: real, bottom: imaginary } = this.bounds();
    const positionComplex = { real, imaginary };
    const positionViewport = screen.complexToViewport(positionComplex);
    const scale = 2 ** (this.level - screen.current.level);
    this.scale = { x: scale, y: scale };
    this.x = positionViewport.x;
    this.y = positionViewport.y;
  }
}
