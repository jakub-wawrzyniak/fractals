import { Show, createSignal } from "solid-js";
import { Size, Point, store } from "../shared";

export const SelectFractalPart = () => {
  const [rect, setRect] = createSignal({
    right: 0.25,
    bottom: 0.25,
    left: 0.25,
    top: 0.25,
  });

  const percent = (betweenZeroAndOne: number) => {
    return `${betweenZeroAndOne * 100}%`;
  };

  const clipPath = () => {
    const { left, top, right, bottom } = rect();
    const setup = [top, right, bottom, left].map(percent).join(" ");
    return `inset(${setup})`;
  };

  console.log(clipPath());
  return (
    <Show when={store.fractalFragmentSelection.isSelecting}>
      <div class="w-full h-full absolute top-0 left-0 z-20">
        <div
          class="w-full h-full bg-white opacity-20 pointer-events-none bg-blend-screen"
          style={{
            "clip-path": clipPath(),
          }}
        ></div>
      </div>
    </Show>
  );
};
