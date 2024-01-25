import { Size } from "../shared";
import { Ticker } from "./ticker";
import { RenderScheduler } from "./scheduler";
import { ScreenPosition } from "./screenPosition";
import { Frame } from "./frame";
import { Tile } from "./tile";
import { ScreenRenderer } from "./renderer";
import { Stage } from "./stage";

export class FractalApp {
  private configInLastRender = "";
  private configCurrent = "";

  private ticker = new Ticker(() => this.render());
  private screen = new ScreenPosition(this.ticker);
  private renderer = new ScreenRenderer(this.screen);
  private scheduler = new RenderScheduler(this.ticker, this.screen);
  private stage = new Stage(this.screen, this.renderer);

  private render() {
    requestAnimationFrame(() => {
      this.ticker.tick();
      this.screen.applyScheduledChange();
      const timestamp = this.ticker.drawingAt;
      const frame = new Frame(
        timestamp,
        this.configCurrent,
        this.stage,
        this.scheduler,
        this.renderer
      );
      frame.drawTiles();
      this.stage.removeUnusedTiles(timestamp);
      this.stage.sortTiles();

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
