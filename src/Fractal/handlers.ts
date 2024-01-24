import { FederatedPointerEvent } from "pixi.js";
import { Point } from "../shared";
import { Position, state } from "./state";
import { pixelToComplex } from "./utils";
import { FractalApp } from "./types";

function getMousePosition(e: FederatedPointerEvent): Point {
  return {
    x: e.clientX,
    y: e.clientY,
  };
}

export function attachInputHandlers(app: FractalApp) {
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
}
