import { Renderer } from "pixi.js";
import { INIT_VIEWER_SIZE, Size } from "../shared";
import { Ticker } from "./ticker";
import { RenderScheduler } from "./scheduler";
import { ScreenPosition } from "./screenPosition";
import { Frame } from "./frame";
import { Tile } from "./tile";
import { Stage } from "./stage";

export class FractalApp {
  private configInLastRender = "";
  private configCurrent = "";
  private renderer = new Renderer({
    background: "#111",
    ...INIT_VIEWER_SIZE,
  });

  private ticker = new Ticker(() => this.render());
  private screen = new ScreenPosition(this.renderer, this.ticker);
  private scheduler = new RenderScheduler(this.screen, this.ticker);
  private stage = new Stage(this.screen);

  private render() {
    requestAnimationFrame(() => {
      this.ticker.tick();
      this.screen.applyScheduledChange();
      const timestamp = this.ticker.drawingAt;
      const frame = new Frame(
        timestamp,
        this.configCurrent,
        this.screen,
        this.stage,
        this.scheduler
      );
      frame.drawTiles();
      frame.removeUnusedTiles();
      frame.sortTiles();

      if (this.configInLastRender !== this.configCurrent) {
        Tile.deleteStaleCache(timestamp, this.configCurrent);
        this.scheduler.cancelRunningJob();
        this.configInLastRender = this.configCurrent;
      }

      this.scheduler.cancelStaleJobs();
      this.scheduler.runNextJob();
      this.renderer.render(this.stage);

      if (this.ticker.canStop()) this.ticker.stop();
      else this.render();
    });
  }

  resize({ width, height }: Size) {
    const old = this.renderer.view;
    let noChange = old.width === width && old.height === height;
    if (noChange) return;

    this.renderer.resize(width, height);
    this.ticker.start();
  }

  onConfigChanged(newConfig: string) {
    this.configCurrent = newConfig;
    this.ticker.start();
  }

  mountAt(root: HTMLDivElement) {
    const canvas = this.renderer.view as HTMLCanvasElement;
    canvas.classList.add("absolute");
    root.appendChild(canvas);
  }
}
