import * as PIXI from "pixi.js";
import { onMount } from "solid-js";
import { tilesOnScreen } from "./tiles";

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
      for (const tile of tilesOnScreen(app.view)) {
        tile.draw(app);
      }
      app.stage.children.sort((first, second) => {
        const name1 = first.name ?? "";
        const name2 = second.name ?? "";
        return name1.localeCompare(name2);
      });
    });
    app.start();
  });
  return root;
};
