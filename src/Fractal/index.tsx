import { Show, createEffect } from "solid-js";
import { mountFractal } from "./viewer.js";
import { useAspectRatio } from "./hooks.js";
import { VIEWER_OPTIONS } from "./config.js";
import { setFractalAspectRatio, store } from "../shared";
import { SelectFractalPart } from "./SelectViewerPart.jsx";
import OpenSeadragon from "openseadragon";

export const Fractal = () => {
  const ratio = useAspectRatio(VIEWER_OPTIONS.id);

  let viewer: OpenSeadragon.Viewer;
  createEffect(() => {
    store.fractalConstant?.real;
    store.fractalConstant?.imaginary;
    store.fractalVariant;
    // track those^ values

    viewer?.destroy();
    if (ratio.isChanging()) return;
    viewer = mountFractal();
  });

  createEffect(() => {
    setFractalAspectRatio(ratio.debounced());
  });

  return (
    <main class="grow relative bg-base-300">
      <div class="min-h-screen relative h-0" id={VIEWER_OPTIONS.id}>
        {/* idk why the h-0 is needed, but without it the viewer just
      won't show up (despite having space for it) :c */}
      </div>
      <SelectFractalPart />
      <Show when={ratio.isChanging()}>
        <div class="w-full h-full grid place-content-center absolute top-0 left-0 z-30">
          <span class="loading loading-spinner loading-lg" />
        </div>
      </Show>
    </main>
  );
};
