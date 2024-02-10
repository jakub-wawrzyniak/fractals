import { Fractal, Size } from "../shared";
import { Ticker } from "./ticker";
import { RequestQueue } from "./scheduler";
import { ScreenPosition } from "./screenPosition";
import { TileManager } from "./tileManager";
import { ScreenRenderer } from "./screenRenderer";
import { Stage } from "./stage";

class FractalApp {
  private readonly ticker = new Ticker(() => this.render());
  private readonly screen = new ScreenPosition(this.ticker);
  readonly renderer = new ScreenRenderer(this.screen);
  private readonly queue = new RequestQueue(this.ticker, this.screen);
  private readonly stage = new Stage(this.screen, this.renderer);
  private readonly tiles = new TileManager(
    this.ticker,
    this.stage,
    this.queue,
    this.renderer
  );

  private render() {
    requestAnimationFrame(() => {
      this.ticker.tick();
      this.screen.applyScheduledChange();

      this.tiles.drawTiles();
      this.stage.removeUnusedTiles(this.ticker.drawingAt);
      this.stage.sortTiles();
      this.tiles.invalidateCache();
      this.queue.cancelStaleJobs();
      this.queue.runNextJob();
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

  updateConfig(newConfig: string, newVariant: Fractal) {
    this.tiles.updateConfig(newConfig);
    this.screen.onConfigChanged(newVariant);
  }

  mountAt(root: HTMLDivElement) {
    const canvas = this.renderer.view as HTMLCanvasElement;
    canvas.classList.add("absolute");
    root.appendChild(canvas);
  }
}

export const fractalApp = new FractalApp();
