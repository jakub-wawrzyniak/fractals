import { Application, Sprite, Texture } from "pixi.js";
import { FractalFragment, calcTile } from "../api";
import { Complex, Point, Size } from "../shared";
import { TILE_SIZE_PX, state, Bounds } from "./state";
import { complexToViewport, screenBoundsComplex } from "./utils";
const { max, log2, ceil, floor } = Math;

export class Tile extends Sprite {
  private static cache = new Map<string, Tile>();
  private status: "ready" | "empty" | "loading" | "updating" = "empty";
  lastDrawnAt = 0;
  hash: string;
  level: number;
  point: Point;

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

  static deleteStaleCache(frameTimestamp: number) {
    if (!state.isCacheStale) return;
    for (const tile of Tile.cache.values()) {
      if (tile.lastDrawnAt !== frameTimestamp) {
        Tile.cache.delete(tile.hash);
      }
    }
    state.isCacheStale = false;
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

  isOnScreen(app: Size): boolean {
    const screen = screenBoundsComplex(app);
    const tile = this.bounds();
    if (tile.right < screen.left) return false;
    if (tile.left > screen.right) return false;
    if (tile.top < screen.bottom) return false;
    if (tile.bottom > screen.top) return false;
    return true;
  }

  loadAction() {
    if (this.status === "empty") return "loading";
    if (state.isCacheStale) return "updating";
    return "skip";
  }

  async load() {
    const action = this.loadAction();
    if (action === "skip") return;
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

    this.status = action;
    const dataUrl = await calcTile(request);
    this.texture = Texture.from(dataUrl);
    this.status = "ready";
    state.onTileLoaded();
  }

  canBeDrawn() {
    return this.status === "ready" || this.status === "updating";
  }

  draw(app: Application, timestamp: number) {
    this.load();
    if (!this.canBeDrawn()) return;
    const { left: real, bottom: imaginary } = this.bounds();
    const positionComplex = { real, imaginary };
    const positionViewport = complexToViewport(positionComplex, app.view);
    const notInStage = app.stage.getChildByName(this.hash) === null;
    if (notInStage) app.stage.addChild(this);
    const scale = 2 ** (this.level - state.current.level);
    this.scale = { x: scale, y: scale };
    this.x = positionViewport.x;
    this.y = positionViewport.y;
    this.lastDrawnAt = timestamp;
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
    const x = tile.point.x + pos.x;
    const y = tile.point.y + pos.y;
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

export function sortTiles(app: Application) {
  app.stage.children.sort((first, second) => {
    // Duck typing. I don't want unnessesary ifs in the rendering loop.
    try {
      return (second as Tile).level - (first as Tile).level;
    } catch {
      return 0;
    }
  });
}

export function removeUnusedTiles(app: Application, now: number) {
  let index = 0;
  while (index < app.stage.children.length) {
    const tile = app.stage.children[index] as Tile;
    const isUsed = tile.lastDrawnAt === now;
    if (!isUsed) app.stage.removeChildAt(index);
    else index++;
  }
}
