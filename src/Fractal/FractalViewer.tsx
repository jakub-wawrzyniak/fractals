import * as PIXI from "pixi.js";
import { onMount } from "solid-js";
import { Tile, tilesOnScreen } from "./tiles";
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
    app.stage.removeChildren();
    for (const tile of tilesOnScreen(app.view)) {
      tile.draw(app);
    }
    app.stage.children.sort((first, second) => {
      const tile1 = Tile.byHash(first.name ?? "");
      const tile2 = Tile.byHash(second.name ?? "");
      if (tile1 === undefined) return 0;
      if (tile2 === undefined) return 0;
      return tile2.level - tile1.level;
    });
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
