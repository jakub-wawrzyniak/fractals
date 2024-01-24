import { SelectFractalPart } from "./SelectFractalPart.jsx";
import { Container, Renderer } from "pixi.js";
import { Show, createEffect, onMount } from "solid-js";
import { Tile, drawScreen, removeUnusedTiles, sortTiles } from "./tiles";
import { state } from "./state";
import { attachInputHandlers } from "./handlers";
import { store } from "../store";
import { renderScheduler } from "./scheduler";
import { FractalApp } from "./types";
import { useSize } from "./hooks";
import { ticker } from "./ticker.js";

const trackFractalConfig = () => {
  store.fractal.get.color;
  store.fractal.get.variant;
  store.fractal.get.constant?.imaginary;
  store.fractal.get.constant?.real;
  store.fractal.get.maxIterations;
};

export const Fractal = () => {
  const root = (
    <div class="min-h-screen relative h-0 overflow-hidden" />
  ) as HTMLDivElement;
  const size = useSize(root);

  const app: FractalApp = {
    stage: new Container(),
    renderer: new Renderer({
      background: "#111",
      width: 800,
      height: 600,
    }),
  };

  requestAnimationFrame(loop);
  function loop() {
    ticker.tick();
    state.applyScheduledChange();
    drawScreen(app);
    Tile.deleteStaleCache();
    removeUnusedTiles(app);
    sortTiles(app);
    renderScheduler.cancelStaleJobs();
    renderScheduler.runNextJob();

    app.renderer.render(app.stage);
    requestAnimationFrame(loop);
  }

  createEffect(() => {
    const newSize = size.debounced();
    const { height, width } = newSize;
    store.viewer.setSize(newSize);
    app.renderer.resize(width, height);
  });

  onMount(() => {
    const canvas = app.renderer.view as HTMLCanvasElement;
    canvas.classList.add("absolute");
    root.appendChild(canvas);
    attachInputHandlers(app);
  });

  let initialLoad = true;
  let lastVariant = store.fractal.get.variant;
  createEffect(() => {
    trackFractalConfig();
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    const variant = store.fractal.get.variant;
    if (variant === lastVariant) state.onCacheInvalid();
    else {
      state.onFractalChange();
      lastVariant = variant;
    }
  });

  return (
    <main class="grow relative bg-base-300 min-h-screen">
      {root}
      <SelectFractalPart />
      <Show when={size.isChanging()}>
        {/* TODO: Set background color to bg of fractal */}
        <div class="w-full h-full grid place-content-center absolute top-0 left-0 z-30 bg-base-300">
          <span class="loading loading-spinner loading-lg" />
        </div>
      </Show>
    </main>
  );
};
