import { Texture } from "pixi.js";
import { FractalFragment, calcTile } from "../api";
import { TILE_SIZE_PX, state } from "./state";
import type { Tile } from "./tiles";
import { distanceManhatan } from "../shared";

export const OUT_OF_SCREEN = "outOfScreen";
class RenderJob {
  tile: Tile;
  promise: Promise<Texture>;
  status: "waiting" | "rendering" | "done" | "canceled" = "waiting";
  private onResolve?: (rendered: Texture) => void;
  private onReject?: (error: typeof OUT_OF_SCREEN) => void;

  constructor(tile: Tile, onFinished: () => void) {
    this.tile = tile;
    this.promise = new Promise<Texture>((res, rej) => {
      this.onReject = rej;
      this.onResolve = (tile) => {
        onFinished();
        res(tile);
      };
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
    const dataUrl = await calcTile(this.request());
    if ((this.status as string) === "canceled") return;
    // ^Requests can be canceled while being rendered

    const texture = Texture.from(dataUrl);
    if (this.onResolve === undefined)
      throw "Can't resolve a promise that was not awaited";
    this.onResolve(texture);
    this.status = "done";
  }

  cancel() {
    if (this.onReject === undefined)
      throw "Can't reject a promise that was not awaited";
    this.onReject(OUT_OF_SCREEN);
    this.status = "canceled";
  }
}

class RenderScheduler {
  private running: RenderJob | null = null;
  private queue = new Map<number, RenderJob[]>();

  private popJobClosestToCenter(queue: RenderJob[]): RenderJob {
    let closestId = 0;
    let closestDistance = Infinity;
    let center = state.current.center;
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

  runNextJob() {
    if (this.running?.status === "rendering") return;
    this.running = this.popMostImportantJob();
    this.running?.run();
  }

  schedule(tile: Tile): Promise<Texture> {
    const job = new RenderJob(tile, () => this.runNextJob());
    const queueForLevel = this.queue.get(tile.level) ?? [];
    queueForLevel.push(job);
    this.queue.set(tile.level, queueForLevel);
    return job.promise;
  }

  cancelStaleJobs(frameTimestamp: number) {
    for (const [level, levelQueue] of this.queue.entries()) {
      for (let id = 0; id < levelQueue.length; ) {
        const job = levelQueue[id];
        const isNeeded = job.tile.lastUsedAt === frameTimestamp;
        if (isNeeded) id++;
        else {
          job.cancel();
          levelQueue.splice(id, 1);
        }
      }

      if (levelQueue.length === 0) this.queue.delete(level);
    }
  }

  cancelRunningJob() {
    this.running?.cancel();
    this.running = null;
  }
}

export const renderScheduler = new RenderScheduler();
