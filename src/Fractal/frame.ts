import type { RenderScheduler } from "./scheduler";
import { Tile } from "./tile";
import { TILE_SIZE_PX } from "../shared";
import { ScreenRenderer } from "./renderer";
import { Stage } from "./stage";

const { max, log2, ceil, floor, abs } = Math;
const LOG2_TILE_SIZE = log2(TILE_SIZE_PX);

export class Frame {
  readonly timestamp: number;
  readonly configHash: string;
  readonly stage: Stage;
  readonly renderer: ScreenRenderer;
  readonly scheduler: RenderScheduler;

  constructor(
    timestamp: number,
    configHash: string,
    stage: Stage,
    scheduler: RenderScheduler,
    renderer: ScreenRenderer
  ) {
    this.renderer = renderer;
    this.configHash = configHash;
    this.timestamp = timestamp;
    this.stage = stage;
    this.scheduler = scheduler;
  }

  private levelsOnScreen() {
    const size = max(this.renderer.height, this.renderer.width);
    const maxLevel = ceil(log2(size)) - LOG2_TILE_SIZE;
    return max(maxLevel, 1);
  }

  private tilesOnScreenAt(level: number) {
    const screenBounds = this.renderer.screenBoundsComplex();
    const topLeft = Tile.withPoint(level, {
      real: screenBounds.left,
      imaginary: screenBounds.top,
    });
    const bottomRight = Tile.withPoint(level, {
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
      }
    }

    return tilesOnScreen;
  }

  async loadTile(tile: Tile) {
    tile.lastUsedAt = this.timestamp;
    switch (tile.status) {
      case "loading":
      case "updating":
        return;
      case "empty":
        tile.status = "loading";
        break;
      case "ready":
        if (this.configHash === tile.renderedForConfig) return;
        else tile.status = "updating";
    }

    try {
      const result = await this.scheduler.schedule(tile);
      tile.status = "ready";
      tile.texture = result.texture;
      tile.renderedForConfig = result.renderedForConfig;
    } catch (err) {
      if (err === "configOutdated") tile.destroy();
      else if (err === "outOfScreen") tile.status = "empty";
      else throw err;
    }
  }

  drawTile(tile: Tile) {
    tile.lastUsedAt = this.timestamp;
    tile.updatePosition(this.renderer);
    const notInStage = this.stage.getChildByName(tile.hash) === null;
    if (notInStage) this.stage.addChild(tile);
  }

  drawTiles() {
    const minLevel = floor(this.renderer.current.level);
    // ^first level, that has higher resolution than the screen
    const maxFetchLevel = minLevel + this.levelsOnScreen();
    // ^first level, that could have one tile covering the whole screen
    const maxFallbackLevel = maxFetchLevel + 5;
    const tilesWithBestResolution = this.tilesOnScreenAt(minLevel);
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
        if (fetchMissingTiles) this.loadTile(tile);
        if (tile.canBeDrawn()) this.drawTile(tile);
        else gapsCanBeFilledWith.add(tile.tileParent());
      }
    }
  }

  sortTiles() {
    this.stage.children.sort((first, second) => {
      return (second as Tile).level - (first as Tile).level;
    });
  }

  removeUnusedTiles() {
    let index = 0;
    while (index < this.stage.children.length) {
      const tile = this.stage.children[index] as Tile;
      const isUsed = tile.lastUsedAt === this.timestamp;
      if (!isUsed) this.stage.removeChildAt(index);
      else index++;
    }
  }
}
