import * as PIXI from "pixi.js";
import { createEffect, onMount } from "solid-js";
import { Tile, removeUnusedTiles, sortTiles, tilesOnScreen } from "./tiles";
import { state } from "./state";
import { attachInputHandlers } from "./handlers";
import { saveViewerScreenSize, store } from "../shared";
import { Task } from "./utils";
import { renderScheduler } from "./scheduler";

const trackFractalConfig = () => {
  store.fractal.color;
  store.fractal.variant;
  store.fractal.constant?.imaginary;
  store.fractal.constant?.real;
  store.fractal.maxIterations;
};

export const FractalViewer = () => {
  const root = (
    <div class="min-h-screen relative h-0 bg-red-600" />
  ) as HTMLDivElement;

  const app = new PIXI.Application({
    background: "#111",
    autoStart: false,
    sharedTicker: true,
  });

  attachInputHandlers(app);
  addEventListener("resize", app.ticker.start);

  const stopTicker = new Task(() => {
    const ticker = PIXI.Ticker.shared;
    if (ticker.started) ticker.stop();
  }, 500);

  app.ticker.add((elapsedFrames) => {
    if (state.shouldDraw()) stopTicker.cancel();
    else stopTicker.schedule();

    saveViewerScreenSize(app.view);
    state.applyScheduledChange(elapsedFrames);
    const time = performance.now();
    const tiles = tilesOnScreen(app.view);
    for (const tile of tiles) tile.draw(app, time);
    Tile.deleteStaleCache(time);
    removeUnusedTiles(app, time);
    sortTiles(app);
    renderScheduler.cancelStaleJobs(time);
    renderScheduler.runNextJob();
  });

  onMount(() => {
    root.appendChild(app.view as HTMLCanvasElement);
    app.resizeTo = root;
    app.start();
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

  return root;
};
