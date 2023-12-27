import { Setter, Show, createEffect, createSignal } from "solid-js";
import { Point, store } from "../shared";

type Event = MouseEvent & {
  currentTarget: HTMLDivElement;
  target: Element;
};
const initStart: Point = {
  x: 0.25,
  y: 0.25,
};
const initEnd: Point = {
  x: 0.75,
  y: 0.75,
};

export const SelectFractalPart = () => {
  const [isSelecting, setIsSelecting] = createSignal(false);
  const [selectionStart, setSelectionStart] = createSignal(initStart);
  const [selectionEnd, setSelectionEnd] = createSignal(initEnd);

  const setMousePosition = (update: Setter<Point>, e: Event) => {
    const { width, height } = e.target.getBoundingClientRect();
    console.log(e);

    update({
      x: e.x / width,
      y: e.y / height,
    });
  };

  const percent = (betweenZeroAndOne: number) => {
    return `${betweenZeroAndOne * 100}%`;
  };

  const selectionArea = () => {
    const start = selectionStart();
    const end = selectionEnd();
    const { abs, min } = Math;
    return {
      x: percent(min(start.x, end.x)),
      y: percent(min(start.y, end.y)),
      width: percent(abs(end.x - start.x)),
      height: percent(abs(end.y - start.y)),
    };
  };

  createEffect(() => {
    if (isSelecting()) console.log("start");
    else console.log("end");
  });

  return (
    <Show when={store.fractalFragmentSelection.canSelect}>
      <div class="w-full h-full absolute top-0 left-0 z-20">
        <svg
          class="w-full h-full"
          viewBox="0 0 100 100"
          id="innerbox"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="hole">
              <rect width="100%" height="100%" fill="white" />
              <rect {...selectionArea()} fill="black" />
            </mask>
          </defs>
          <rect
            fill="white"
            opacity="20%"
            width="100%"
            height="100%"
            mask="url(#hole)"
          />
        </svg>
        <div
          class="w-full h-full absolute top-0 left-0 cursor-crosshair"
          onClick={(e) => {
            if (isSelecting()) {
              setIsSelecting(false);
            } else {
              setMousePosition(setSelectionStart, e);
              setIsSelecting(true);
            }
          }}
          onMouseMove={
            isSelecting()
              ? (e) => setMousePosition(setSelectionEnd, e)
              : undefined
          }
        />
      </div>
    </Show>
  );
};
