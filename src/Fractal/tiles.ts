import { Application, Sprite } from "pixi.js";
import { Complex, Point, Size } from "../shared";
import { TILE_SIZE_PX, state, Bounds } from "./state";
import { complexToViewport, screenBoundsComplex } from "./utils";
import { OUT_OF_SCREEN, renderScheduler } from "./scheduler";
const { max, log2, ceil, floor, abs } = Math;

export class Tile extends Sprite {
  private static cache = new Map<string, Tile>();
  private status: "ready" | "empty" | "loading" | "updating" = "empty";
  lastUsedAt = -1;
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
    renderScheduler.cancelRunningJob();
    for (const tile of Tile.cache.values()) {
      if (tile.lastUsedAt !== frameTimestamp) {
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

  isOnScreen(app: Size): boolean {
    const screen = screenBoundsComplex(app);
    const tile = this.bounds();
    if (tile.right < screen.left) return false;
    if (tile.left > screen.right) return false;
    if (tile.top < screen.bottom) return false;
    if (tile.bottom > screen.top) return false;
    return true;
  }

  private loadAction() {
    if (this.status === "empty") return "loading";
    if (state.isCacheStale) return "updating";
    return "skip";
  }

  load(frameTimestamp: number) {
    this.lastUsedAt = frameTimestamp;
    const newAction = this.loadAction();
    if (newAction === "skip") return;

    this.status = newAction;
    const update = async () => {
      this.texture = await renderScheduler.schedule(this);
      this.status = "ready";
      state.onTileLoaded();
    };

    update().catch((err) => {
      if (err !== OUT_OF_SCREEN) throw err;
      update().catch((err) => {
        if (err !== OUT_OF_SCREEN) throw err;
        Tile.cache.delete(this.hash);
        // after the second attempt, destroy this instance
      });
    });
  }

  canBeDrawn() {
    return this.status === "ready" || this.status === "updating";
  }

  draw(app: Application, frameTimestamp: number) {
    this.load(frameTimestamp); // can be drawn without awaiting
    const { left: real, bottom: imaginary } = this.bounds();
    const positionComplex = { real, imaginary };
    const positionViewport = complexToViewport(positionComplex, app.view);
    const notInStage = app.stage.getChildByName(this.hash) === null;
    if (notInStage) app.stage.addChild(this);
    const scale = 2 ** (this.level - state.current.level);
    this.scale = { x: scale, y: scale };
    this.x = positionViewport.x;
    this.y = positionViewport.y;
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

/**
 * {@link drawScreen} is more stable, but this one is faster.
 * Might be usefull later */
function drawScreenLegacy(app: Application, frameTimestamp: number) {
  const tiles = tilesOnScreen(app.view);
  for (const tile of tiles) {
    if (tile.canBeDrawn()) tile.draw(app, frameTimestamp);
    else tile.load(frameTimestamp);
  }
}

function tilesOnScreenAt(level: number, screen: Size) {
  const screenBounds = screenBoundsComplex(screen);
  const topLeft = tileWithPoint(level, {
    real: screenBounds.left,
    imaginary: screenBounds.top,
  });
  const bottomRight = tileWithPoint(level, {
    real: screenBounds.right,
    imaginary: screenBounds.bottom,
  });

  const tilesHorizontally = abs(bottomRight.point.x - topLeft.point.x) + 1;
  const tilesVertically = abs(bottomRight.point.y - topLeft.point.y) + 1;
  const tilesOnScreen: Tile[] = [];
  for (let dx = 0; dx < tilesHorizontally; dx++) {
    for (let dy = 0; dy < tilesVertically; dy++) {
      const x = topLeft.point.x + dx;
      const y = topLeft.point.y - dy;
      const tile = Tile.get(x, y, level);
      tilesOnScreen.push(tile);
      console.assert(tile.isOnScreen(screen));
    }
  }

  return tilesOnScreen;
}

export function drawScreen(app: Application, frameTimestamp: number) {
  const minLevel = floor(state.current.level);
  // ^first level, that has higher resolution than the screen
  const maxFetchLevel = minLevel + levelsOnScreen(screen);
  // ^first level, that could have one tile covering the whole screen
  const maxFallbackLevel = maxFetchLevel + 5;
  const tilesWithBestResolution = tilesOnScreenAt(minLevel, app.view);
  const gapsCanBeFilledWith = new Set(tilesWithBestResolution);

  for (
    let level = minLevel;
    level <= maxFallbackLevel && gapsCanBeFilledWith.size > 0;
    level++
  ) {
    const tilesToDraw = [...gapsCanBeFilledWith.values()];
    const fetchMissingTiles = level < maxFetchLevel;
    gapsCanBeFilledWith.clear();
    for (const tile of tilesToDraw) {
      if (tile.canBeDrawn()) {
        tile.draw(app, frameTimestamp);
        continue;
      }
      if (fetchMissingTiles) tile.load(frameTimestamp);
      gapsCanBeFilledWith.add(tile.tileParent());
    }
  }
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
    const isUsed = tile.lastUsedAt === now;
    if (!isUsed) app.stage.removeChildAt(index);
    else index++;
  }
}
