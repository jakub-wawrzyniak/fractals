import * as PIXI from "pixi.js";
import { onMount } from "solid-js";
import { Tile, tilesOnScreen } from "./tiles";
import { changeCenterBy, changeLevelBy, pixelToComplex } from "./state";
import { Complex, Point } from "../shared";

export const FractalViewer = () => {
  const root = (
    <div class="min-h-screen relative h-0 bg-red-600" />
  ) as HTMLDivElement;

  const app = new PIXI.Application({
    background: "#111",
    autoStart: false,
  });

  app.ticker.add(() => {
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

  const getMousePosition = (e: PIXI.FederatedPointerEvent): Point => {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  };

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
    const dragChange: Complex = {
      real: -(dragIsAt.x - dragStartedAt.x) * pixelRatio,
      imaginary: (dragIsAt.y - dragStartedAt.y) * pixelRatio,
    };
    changeCenterBy(dragChange);
    dragStartedAt = dragIsAt;
  });
  app.stage.on("wheel", (e) => {
    const change = e.deltaY / 200;
    changeLevelBy(change);
  });

  return root;
};
