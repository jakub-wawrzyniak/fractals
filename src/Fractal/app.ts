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
import { Tile } from "./tiles";
import { Counter } from "../api/timer";

const update = new Counter("update", 1000);
const scheduling = new Counter("scheduling", 1000);
const scheduled = new Counter("scheduled", 1000);

export class FractalApp {
  private rendering = false;
  private newTilesReady = false;
  private screenSizeChanged = false;
  private screenPositionChanged = false;
  private configInLastRender = "";
  private configCurrent = "";
  private ticker = new Ticker();
  private stage = new Container();
  private renderer = new Renderer({
    background: "#111",
    ...INIT_VIEWER_SIZE,
  });
  private screen = new ScreenPosition(this.renderer, () => {
    this.screenPositionChanged = false;
    this.scheduleRender();
  });
  private scheduler = new RenderScheduler(this.screen, () => {
    this.newTilesReady = true;
    this.scheduleRender();
  });

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
      this.screen.changeBy(new Position(dx, dy, 0));
      dragStartedAt = dragIsAt;
    });
    this.stage.on("wheel", (e) => {
      const levelChange = e.deltaY / 200;
      this.screen.changeBy(new Position(0, 0, levelChange));
    });
  }

  private onRenderStarted() {
    this.rendering = true;
    this.ticker.tick();

    this.newTilesReady = false;
    this.screenSizeChanged = false;
    this.screenPositionChanged = false;
  }

  private onRenderFinished() {
    this.rendering = false;
    const { elapsedFrames } = this.ticker;
    this.screen.applyScheduledChange(elapsedFrames);
  }

  private render() {
    this.onRenderStarted();
    const { drawingAt } = this.ticker;

    const frame = new Frame(
      drawingAt,
      this.configCurrent,
      this.screen,
      this.stage,
      this.scheduler
    );
    frame.drawTiles();
    frame.removeUnusedTiles();
    frame.sortTiles();

    if (this.configInLastRender !== this.configCurrent) {
      Tile.deleteStaleCache(drawingAt, this.configCurrent);
      this.scheduler.cancelRunningJob();
      this.configInLastRender = this.configCurrent;
    }

    this.scheduler.cancelStaleJobs(drawingAt);
    this.scheduler.runNextJob();
    this.renderer.render(this.stage);
    this.onRenderFinished();
  }

  resize({ width, height }: Size) {
    const old = this.renderer.view;
    let noChange = old.width === width && old.height === height;
    if (noChange) return;

    this.screenSizeChanged = true;
    this.renderer.resize(width, height);
    this.scheduleRender();
  }

  onConfigChanged(newConfig: string) {
    this.configCurrent = newConfig;
    this.scheduleRender();
  }

  scheduleRender() {
    update.addOne();
    if (this.rendering) return;
    scheduling.addOne();
    let shouldRender = this.configCurrent !== this.configInLastRender;
    shouldRender ||= this.newTilesReady;
    shouldRender ||= this.screenSizeChanged;
    shouldRender ||= this.screenPositionChanged;
    shouldRender ||= this.screen.inTransition;
    if (shouldRender) {
      requestAnimationFrame(() => this.render());
      scheduled.addOne();
    }
  }

  mountAt(root: HTMLDivElement) {
    const canvas = this.renderer.view as HTMLCanvasElement;
    canvas.classList.add("absolute");
    root.appendChild(canvas);
  }
}
