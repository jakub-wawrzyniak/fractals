import * as PIXI from "pixi.js";
import { onMount } from "solid-js";
import { Tile, tilesOnScreen } from "./tiles";

export const FractalViewer = () => {
  const root = (
    <div class="min-h-screen relative h-0 bg-red-600" />
  ) as HTMLDivElement;

  const app = new PIXI.Application({
    background: "#111",
    autoStart: false,
  });
  onMount(() => {
    root.appendChild(app.view as HTMLCanvasElement);
    app.resizeTo = root;
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
    app.start();
  });
  return root;
};
