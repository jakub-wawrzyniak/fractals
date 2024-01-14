import { Show, createEffect } from "solid-js";
import { fractalViewer, mountFractalViewer } from "./viewer.js";
import { useAspectRatio } from "./hooks.js";
import { VIEWER_OPTIONS } from "./config.js";
import { setViewerAspectRatio, store } from "../shared";
import { SelectFractalPart } from "./SelectFractalPart.jsx";

export const Fractal = () => {
  const ratio = useAspectRatio(VIEWER_OPTIONS.id);

  /**
   * Tracks values, for which the whole
   * FractalViewer must refresh.
   */
  const refreshViewerSignal = () => {
    store.fractal.constant?.real;
    store.fractal.constant?.imaginary;
    store.fractal.variant;
    store.fractal.maxIterations;
    store.fractal.color;
  };

  createEffect(() => {
    refreshViewerSignal();
    fractalViewer?.destroy();
    if (ratio.isChanging()) return;
    mountFractalViewer();
  });

  createEffect(() => {
    setViewerAspectRatio(ratio.debounced());
  });

  return (
    <main class="grow relative bg-base-300">
      <div class="min-h-screen relative h-0" id={VIEWER_OPTIONS.id}>
        {/* idk why the h-0 is needed, but without it the viewer just
      won't show up (despite having space for it) :c */}
      </div>
      {/* <ColorOverlay /> */}
      <SelectFractalPart />
      <Show when={ratio.isChanging()}>
        <div class="w-full h-full grid place-content-center absolute top-0 left-0 z-30">
          <span class="loading loading-spinner loading-lg" />
        </div>
      </Show>
    </main>
  );
};
