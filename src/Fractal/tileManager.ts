import type { RequestQueue } from "./scheduler";
import { Tile } from "./tile";
import { TILE_SIZE_PX } from "../shared";
import { ScreenRenderer } from "./screenRenderer";
import { Stage } from "./stage";
import { Ticker } from "./ticker";

const { max, log2, ceil, floor, abs } = Math;
const LOG2_TILE_SIZE = log2(TILE_SIZE_PX);

export class TileManager {
  private readonly ticker: Ticker;
  private readonly stage: Stage;
  private readonly renderer: ScreenRenderer;
  private readonly queue: RequestQueue;
  private lastConfig = "";
  private currentConfig = "";

  constructor(
    ticker: Ticker,
    stage: Stage,
    queue: RequestQueue,
    renderer: ScreenRenderer
  ) {
    this.ticker = ticker;
    this.renderer = renderer;
    this.stage = stage;
    this.queue = queue;
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

  private async loadTile(tile: Tile) {
    tile.lastUsedAt = this.ticker.drawingAt;
    switch (tile.status) {
      case "loading":
      case "updating":
        return;
      case "empty":
        tile.status = "loading";
        break;
      case "ready":
        if (this.currentConfig === tile.renderedForConfig) return;
        else tile.status = "updating";
    }

    try {
      const result = await this.queue.schedule(tile);
      tile.status = "ready";
      tile.texture = result.texture;
      tile.renderedForConfig = result.renderedForConfig;
    } catch (err) {
      if (err === "configOutdated") tile.destroy();
      else if (err === "outOfScreen") tile.status = "empty";
      else throw err;
    }
  }

  private drawTile(tile: Tile) {
    tile.lastUsedAt = this.ticker.drawingAt;
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

  invalidateCache() {
    if (this.lastConfig === this.currentConfig) return;
    const timestamp = this.ticker.drawingAt;
    Tile.deleteStaleCache(timestamp, this.currentConfig);
    this.queue.cancelRunningJob();
    this.lastConfig = this.currentConfig;
  }

  updateConfig(newConfig: string) {
    if (this.currentConfig === newConfig) return;
    this.currentConfig = newConfig;
    this.ticker.start();
  }
}
