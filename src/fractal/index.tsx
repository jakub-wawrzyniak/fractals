import { Show, createEffect } from "solid-js";
import { mountFractal } from "./viewer.js";
import { useAspectRatio } from "./hooks.js";
import { VIEWER_ROOT_ID } from "./config.js";

type AnyFn = () => void;
export const Fractal = () => {
  const ratio = useAspectRatio(VIEWER_ROOT_ID);
  const nothingToClean = () => undefined;

  createEffect((clean: AnyFn) => {
    clean();
    if (ratio.isChanging()) return nothingToClean;
    const viewer = mountFractal(ratio.debounced());
    return () => viewer.destroy();
  }, nothingToClean);

  return (
    <div>
      <div class="min-h-screen relative h-0" id={VIEWER_ROOT_ID}>
        {/* idk why the h-0 is needed, but without it the viewer just
      won't show up (despite having space for it) :c */}
      </div>
      <Show when={ratio.isChanging()}>
        <div class="w-full h-full grid place-content-center absolute top-0 left-0 z-20 bg-base-100">
          <span class="loading loading-spinner loading-lg" />
        </div>
      </Show>
      <div
        id="debug"
        class="w-full h-full hidden absolute top-0 left-0 z-30 bg-blue-600"
      ></div>
    </div>
  );
};
