import { Container, FederatedPointerEvent, FederatedWheelEvent } from "pixi.js";
import { ScreenPosition } from "./screenPosition";
import { Point } from "../shared";
import { Position } from "./position";
import { ScreenRenderer } from "./screenRenderer";
import type { Tile } from "./tile";

const getMousePosition = (e: FederatedPointerEvent) => ({
  x: e.clientX,
  y: e.clientY,
});

export class Stage extends Container {
  private readonly screen: ScreenPosition;
  private readonly renderer: ScreenRenderer;
  private dragFrom: Point | null = null;
  constructor(screen: ScreenPosition, renderer: ScreenRenderer) {
    super();
    this.screen = screen;
    this.renderer = renderer;
    this.eventMode = "static";
    this.on("wheel", (e) => this.onWheelSpin(e));
    this.on("mousedown", (e) => this.onMouseDown(e));
    this.on("mouseup", () => this.onMouseUp());
  }

  private onMouseMove(e: FederatedPointerEvent) {
    const isPrimaryButtonPressed = e.buttons === 1;
    if (!isPrimaryButtonPressed) return;
    if (this.dragFrom === null) return;

    const pixelRatio = this.renderer.pixelToComplex();
    const dragTo = getMousePosition(e);
    const dx = -(dragTo.x - this.dragFrom.x) * pixelRatio;
    const dy = (dragTo.y - this.dragFrom.y) * pixelRatio;
    const change = new Position(dx, dy, 0);
    this.screen.changeGoingToBy(change);
    this.dragFrom = dragTo;
  }

  private onMouseUp() {
    this.dragFrom = null;
    this.off("mousemove");
  }

  private onMouseDown(e: FederatedPointerEvent) {
    this.dragFrom = getMousePosition(e);
    this.on("mousemove", (e) => this.onMouseMove(e));
  }

  private onWheelSpin(e: FederatedWheelEvent) {
    const levelChange = e.deltaY / 200;
    this.screen.changeGoingToBy(new Position(0, 0, levelChange));
  }

  removeUnusedTiles(timestamp: number) {
    let index = 0;
    while (index < this.children.length) {
      const tile = this.children[index] as Tile;
      const isUsed = tile.lastUsedAt === timestamp;
      if (!isUsed) this.removeChildAt(index);
      else index++;
    }
  }

  sortTiles() {
    this.children.sort((first, second) => {
      return (second as Tile).level - (first as Tile).level;
    });
  }
}
