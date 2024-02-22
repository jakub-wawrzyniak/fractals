import { SelectFractalPart } from "./SelectFractalPart";
import { Show, createEffect, onMount } from "solid-js";
import { store } from "../store";
import { useSize } from "./hooks";
import { fractalApp } from "./fractalApp";
import { INIT_VIEWER_SIZE } from "../shared/constants";

export const Fractal = () => {
  const root = (
    <div class="min-h-screen relative h-0 overflow-hidden" />
  ) as HTMLDivElement;
  const size = useSize(root, INIT_VIEWER_SIZE);

  createEffect(() => {
    const newSize = size.debounced();
    store.viewer.setSize(newSize);
    fractalApp.resize(newSize);
  });

  onMount(() => {
    fractalApp.mountAt(root);
  });

  createEffect(() => {
    const hash = store.getHash();
    const variant = store.fractal.get.variant;
    fractalApp.updateConfig(hash, variant);
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
