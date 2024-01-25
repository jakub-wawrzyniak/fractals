import { SelectFractalPart } from "./SelectFractalPart.jsx";
import { Show, createEffect, onMount } from "solid-js";
import { store } from "../store";
import { useSize } from "./hooks";
import { FractalApp } from "./app.js";

export const Fractal = () => {
  const root = (
    <div class="min-h-screen relative h-0 overflow-hidden" />
  ) as HTMLDivElement;
  const size = useSize(root);
  const app = new FractalApp();

  createEffect(() => {
    console.log("size");
    const newSize = size.debounced();
    store.viewer.setSize(newSize);
    app.resize(newSize);
  });

  onMount(() => {
    app.mountAt(root);
  });

  createEffect(() => {
    console.log("hash");
    const hash = store.fractal.getHash();
    app.onConfigChanged(hash);
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
