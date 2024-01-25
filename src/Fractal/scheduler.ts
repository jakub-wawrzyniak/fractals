import { Texture } from "pixi.js";
import { FractalFragment, calcTile } from "../api";
import { TILE_SIZE_PX, distanceManhatan } from "../shared";
import type { Tile } from "./tiles";
import type { ScreenPosition } from "./screenPosition";
import { store } from "../store";
import { Ticker } from "./ticker";

export type RenderError = "configOutdated" | "outOfScreen";
export type RednerResult = {
  texture: Texture;
  renderedForConfig: string;
};

class RenderJob {
  tile: Tile;
  promise: Promise<RednerResult>;
  status: "waiting" | "rendering" | "done" | "canceled" = "waiting";
  private onResolve?: (rendered: RednerResult) => void;
  private onReject?: (error: RenderError) => void;

  constructor(tile: Tile) {
    this.tile = tile;
    this.promise = new Promise<RednerResult>((res, rej) => {
      this.onReject = rej;
      this.onResolve = res;
    });
  }

  private request(): FractalFragment {
    const bounds = this.tile.bounds();
    return {
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
  }

  async run() {
    this.status = "rendering";
    const hash = store.fractal.getHash();
    const dataUrl = await calcTile(this.request());
    if ((this.status as string) === "canceled") return;
    // ^Requests can be canceled while being rendered

    if (this.onResolve === undefined)
      throw "Can't resolve a promise that was not awaited";
    this.onResolve({
      texture: Texture.from(dataUrl),
      renderedForConfig: hash,
    });
    this.status = "done";
  }

  cancel(reason: RenderError) {
    if (this.onReject === undefined)
      throw "Can't reject a promise that was not awaited";
    this.onReject(reason);
    this.status = "canceled";
  }
}

export class RenderScheduler {
  private readonly ticker: Ticker;
  private readonly screen: ScreenPosition;
  private readonly queue = new Map<number, RenderJob[]>();
  private running: RenderJob | null = null;
  constructor(screen: ScreenPosition, ticker: Ticker) {
    this.screen = screen;
    this.ticker = ticker;
  }

  private popJobClosestToCenter(queue: RenderJob[]): RenderJob {
    let closestId = 0;
    let closestDistance = Infinity;
    let center = this.screen.current.center;
    for (let id = 0; id < queue.length; id++) {
      const position = queue[id].tile.center();
      const distance = distanceManhatan(position, center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = 0;
      }
    }

    const job = queue[closestId];
    queue.splice(closestId, 1);
    return job;
  }

  private popMostImportantJob(): RenderJob | null {
    let highestLevel = -Infinity;
    for (const level of this.queue.keys()) {
      highestLevel = Math.max(highestLevel, level);
    }

    const queue = this.queue.get(highestLevel);
    if (queue === undefined) return null;
    const job = this.popJobClosestToCenter(queue);
    if (queue.length === 0) this.queue.delete(highestLevel);
    return job ?? null;
  }

  async runNextJob() {
    if (this.running?.status === "rendering") return;
    while (true) {
      this.running = this.popMostImportantJob();
      if (this.running === null) return;
      await this.running.run();
      this.ticker.start();
    }
  }

  schedule(tile: Tile): Promise<RednerResult> {
    const job = new RenderJob(tile);
    const queueForLevel = this.queue.get(tile.level) ?? [];
    queueForLevel.push(job);
    this.queue.set(tile.level, queueForLevel);
    return job.promise;
  }

  cancelStaleJobs() {
    const thisFrame = this.ticker.frameTimestamp;
    for (const [level, levelQueue] of this.queue.entries()) {
      for (let id = 0; id < levelQueue.length; ) {
        const job = levelQueue[id];
        const isNeeded = job.tile.lastUsedAt === thisFrame;
        if (isNeeded) id++;
        else {
          job.cancel("outOfScreen");
          levelQueue.splice(id, 1);
        }
      }

      if (levelQueue.length === 0) this.queue.delete(level);
    }
  }

  cancelRunningJob() {
    this.running?.cancel("configOutdated");
    this.running = null;
  }
}
