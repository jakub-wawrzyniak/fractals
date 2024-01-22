import * as PIXI from "pixi.js";
import { onMount } from "solid-js";
import { removeUnusedTiles, sortTiles, tilesOnScreen } from "./tiles";
import { Position, pixelToComplex, state } from "./state";
import { Point } from "../shared";

const getMousePosition = (e: PIXI.FederatedPointerEvent): Point => {
  return {
    x: e.clientX,
    y: e.clientY,
  };
};

export const FractalViewer = () => {
  const root = (
    <div class="min-h-screen relative h-0 bg-red-600" />
  ) as HTMLDivElement;

  const app = new PIXI.Application({
    background: "#111",
    autoStart: false,
  });

  app.ticker.add((elapsedFrames) => {
    state.applyScheduledChange(elapsedFrames);
    const time = performance.now();
    const tiles = tilesOnScreen(app.view);
    for (const tile of tiles) tile.draw(app, time);
    removeUnusedTiles(app, time);
    sortTiles(app);
  });

  onMount(() => {
    root.appendChild(app.view as HTMLCanvasElement);
    app.resizeTo = root;
    app.start();
  });

  let dragStartedAt: Point | null = null;
  app.stage.eventMode = "static";
  app.stage.on("mouseup", () => (dragStartedAt = null));
  app.stage.on("mousedown", (e) => {
    dragStartedAt = getMousePosition(e);
  });
  app.stage.on("globalmousemove", (e) => {
    const isPrimaryButtonPressed = e.buttons === 1;
    if (!isPrimaryButtonPressed) return;
    if (dragStartedAt === null) return;
    const pixelRatio = pixelToComplex();
    const dragIsAt = getMousePosition(e);
    const dx = -(dragIsAt.x - dragStartedAt.x) * pixelRatio;
    const dy = (dragIsAt.y - dragStartedAt.y) * pixelRatio;
    state.changeBy(new Position(dx, dy, 0));
    dragStartedAt = dragIsAt;
  });
  app.stage.on("wheel", (e) => {
    const levelChange = e.deltaY / 200;
    state.changeBy(new Position(0, 0, levelChange));
  });

  return root;
};
