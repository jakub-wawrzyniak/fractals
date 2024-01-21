import { Application, Sprite } from "pixi.js";
import { FractalFragment, calcTile } from "../api";
import { Complex, Point, Size } from "../shared";
import {
  TILE_SIZE_PX,
  state,
  Bounds,
  complexToViewport,
  screenBounds,
} from "./state";
const { max, log2, ceil, floor } = Math;

export class Tile {
  private static cache = new Map<string, Tile>();
  private sprite: Sprite | "idle" | "loading" = "idle";
  hash: string;
  level: number;
  x: number;
  y: number;

  private constructor(x: number, y: number, level: number) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.hash = `l=${this.level}  x=${this.x}  y=${this.y}`;
  }

  static byHash(hash: string): Tile | undefined {
    return this.cache.get(hash);
  }

  static get(x: number, y: number, level: number): Tile {
    const newTile = new Tile(x, y, level);
    const cachedTile = this.cache.get(newTile.hash);
    if (cachedTile !== undefined) return cachedTile;
    this.cache.set(newTile.hash, newTile);
    return newTile;
  }

  bounds(): Bounds {
    const sizeComplex = 2 ** this.level;
    const left = this.x * sizeComplex;
    const bottom = this.y * sizeComplex;
    return {
      left,
      bottom,
      right: left + sizeComplex,
      top: bottom + sizeComplex,
    };
  }

  isOnScreen(app: Size): boolean {
    const screen = screenBounds(app);
    const tile = this.bounds();
    if (tile.right < screen.left) return false;
    if (tile.left > screen.right) return false;
    if (tile.top < screen.bottom) return false;
    if (tile.bottom > screen.top) return false;
    return true;
  }

  isLoading(): boolean {
    return this.sprite === "loading";
  }

  async load() {
    if (this.sprite === "loading") return;
    const bounds = this.bounds();
    const request: FractalFragment = {
      width_px: TILE_SIZE_PX,
      height_px: TILE_SIZE_PX,
      top_left: {
        real: bounds.left,
        imaginary: bounds.top,
      },
      bottom_right: {
        real: bounds.right,
        imaginary: bounds.bottom,
      },
    };

    this.sprite = "loading";
    const dataUrl = await calcTile(request);
    this.sprite = Sprite.from(dataUrl);
    this.sprite.anchor.set(0, 1);
    this.sprite.name = this.hash;
  }

  draw(app: Application) {
    if (this.sprite === "idle") this.load();
    if (typeof this.sprite === "string") return;
    const { left: real, bottom: imaginary } = this.bounds();
    const positionComplex = { real, imaginary };
    const positionViewport = complexToViewport(positionComplex, app.view);
    const notInStage = app.stage.getChildByName(this.hash) === null;
    if (notInStage) app.stage.addChild(this.sprite);
    const scale = 2 ** (this.level - state.current.level);
    this.sprite.scale = { x: scale, y: scale };
    this.sprite.x = positionViewport.x;
    this.sprite.y = positionViewport.y;
  }
}

const LOG2_TILE_SIZE = log2(TILE_SIZE_PX);
function levelsOnScreen(screen: Size) {
  const { width, height } = screen;
  const size = max(height, width);
  const maxLevel = ceil(log2(size)) - LOG2_TILE_SIZE;
  return max(maxLevel, 1);
}

export function tileWithPoint(level: number, point: Complex): Tile {
  const size = 2 ** level;
  const x = floor(point.real / size);
  const y = floor(point.imaginary / size);
  return Tile.get(x, y, level);
}

export function tileNeighbours(tile: Tile, distance: number) {
  if (distance === 0) return [];

  const positions: Point[] = [];
  for (let d = -distance; d <= distance; d++) {
    positions.push({ x: d, y: distance });
    positions.push({ x: d, y: -distance });
  }
  for (let d = 1 - distance; d < distance; d++) {
    positions.push({ x: distance, y: d });
    positions.push({ x: -distance, y: d });
  }
  return positions.map((pos) => {
    const x = tile.x + pos.x;
    const y = tile.y + pos.y;
    return Tile.get(x, y, tile.level);
  });
}

export function tilesOnScreen(screen: Size) {
  const minLevel = floor(state.current.level);
  const maxLevel = minLevel + levelsOnScreen(screen);
  const tiles: Tile[] = [];
  for (let level = maxLevel; level >= minLevel; level--) {
    // TODO: Using <<math>> we can get the same effect,
    // but in a more efficient way.
    const tile = tileWithPoint(level, state.current.center);
    tiles.push(tile);
    let distance = 1;
    while (true) {
      const neighbours = tileNeighbours(tile, distance);
      const onScreen = neighbours.filter((t) => t.isOnScreen(screen));
      if (onScreen.length === 0) break;
      tiles.push(...onScreen);
      distance++;
    }
  }
  return tiles;
}
