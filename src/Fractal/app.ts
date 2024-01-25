import {
  Container,
  FederatedPointerEvent as PointerEvent,
  Renderer,
} from "pixi.js";
import { Ticker } from "./ticker";
import { RenderScheduler } from "./scheduler";
import { ScreenPosition } from "./screenPosition";
import { Frame } from "./frame";
import { INIT_VIEWER_SIZE, Point, Size } from "../shared";
import { Position } from "./position";
import { Tile } from "./tile";

export class FractalApp {
  private configInLastRender = "";
  private configCurrent = "";
  private stage = new Container();
  private renderer = new Renderer({
    background: "#111",
    ...INIT_VIEWER_SIZE,
  });

  private ticker = new Ticker(() => this.render());
  private screen = new ScreenPosition(this.renderer, this.ticker);
  private scheduler = new RenderScheduler(this.screen, this.ticker);

  constructor() {
    this.attachInputHandlers();
  }

  private attachInputHandlers() {
    let dragStartedAt: Point | null = null;
    const getMousePosition = (e: PointerEvent) => ({
      x: e.clientX,
      y: e.clientY,
    });
    this.stage.eventMode = "static";
    this.stage.on("mouseup", () => (dragStartedAt = null));
    this.stage.on("mousedown", (e) => {
      dragStartedAt = getMousePosition(e);
    });
    this.stage.on("globalmousemove", (e) => {
      const isPrimaryButtonPressed = e.buttons === 1;
      if (!isPrimaryButtonPressed) return;
      if (dragStartedAt === null) return;
      const pixelRatio = this.screen.pixelToComplex();
      const dragIsAt = getMousePosition(e);
      const dx = -(dragIsAt.x - dragStartedAt.x) * pixelRatio;
      const dy = (dragIsAt.y - dragStartedAt.y) * pixelRatio;
      this.screen.setGoingTo(new Position(dx, dy, 0));
      dragStartedAt = dragIsAt;
    });
    this.stage.on("wheel", (e) => {
      const levelChange = e.deltaY / 200;
      this.screen.setGoingTo(new Position(0, 0, levelChange));
    });
  }

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
