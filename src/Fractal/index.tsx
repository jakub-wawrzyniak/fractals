import { SelectFractalPart } from "./SelectFractalPart.jsx";
import { Container, Renderer } from "pixi.js";
import { Show, createEffect, onMount } from "solid-js";
import { Tile, drawScreen, removeUnusedTiles, sortTiles } from "./tiles";
import { state } from "./state";
import { attachInputHandlers } from "./handlers";
import { saveViewerScreenSize, store } from "../shared";
import { renderScheduler } from "./scheduler";
import { FractalApp } from "./types";
import { useSize } from "./hooks";

const trackFractalConfig = () => {
  store.fractal.color;
  store.fractal.variant;
  store.fractal.constant?.imaginary;
  store.fractal.constant?.real;
  store.fractal.maxIterations;
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

  let lastDrawnAt = performance.now();
  requestAnimationFrame(loop);
  function loop() {
    const drawingAt = performance.now();
    var deltaTime = drawingAt - lastDrawnAt;
    lastDrawnAt = drawingAt;
    if (deltaTime < 0) deltaTime = 0;
    if (deltaTime > 1000) deltaTime = 1000;
    const deltaFrame = (deltaTime * 60) / 1000;

    saveViewerScreenSize(app.renderer.view);
    state.applyScheduledChange(deltaFrame);
    drawScreen(app, drawingAt);
    Tile.deleteStaleCache(drawingAt);
    removeUnusedTiles(app, drawingAt);
    sortTiles(app);
    renderScheduler.cancelStaleJobs(drawingAt);
    renderScheduler.runNextJob();

    app.renderer.render(app.stage);
    requestAnimationFrame(loop);
  }

  createEffect(() => {
    const { height, width } = size.debounced();
    app.renderer.resize(width, height);
  });

  onMount(() => {
    const canvas = app.renderer.view as HTMLCanvasElement;
    canvas.classList.add("absolute");
    root.appendChild(canvas);
    attachInputHandlers(app);
  });

  let initialLoad = true;
  let lastVariant = store.fractal.variant;
  createEffect(() => {
    trackFractalConfig();
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    const variant = store.fractal.variant;
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
