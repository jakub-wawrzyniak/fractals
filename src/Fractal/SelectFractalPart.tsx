import { Show } from "solid-js";
import { Point } from "../shared";
import { store } from "../store";

type Event = MouseEvent & {
  currentTarget: HTMLDivElement;
  target: Element;
};

export const SelectFractalPart = () => {
  const config = store.exportConfig;
  const selection = () => store.exportConfig.get.selection;
  const getMousePosition = (e: Event): Point => {
    const { width, height } = e.target.getBoundingClientRect();
    return {
      x: e.x / width,
      y: e.y / height,
    };
  };

  const percent = (betweenZeroAndOne: number) => {
    return `${betweenZeroAndOne * 100}%`;
  };

  const selectionArea = () => {
    const { start, end } = selection();
    const { abs, min } = Math;
    return {
      x: percent(min(start.x, end.x)),
      y: percent(min(start.y, end.y)),
      width: percent(abs(end.x - start.x)),
      height: percent(abs(end.y - start.y)),
    };
  };

  return (
    <Show when={config.get.source === "selection"}>
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
            fill="black"
            opacity="20%"
            width="100%"
            height="100%"
            mask="url(#hole)"
          />
        </svg>
        <div
          class="w-full h-full absolute top-0 left-0 cursor-crosshair"
          onMouseUp={() => config.setSelection("isSelecting", false)}
          onMouseOut={() => config.setSelection("isSelecting", false)}
          onMouseMove={
            selection().isSelecting
              ? (e) => config.setSelection("end", getMousePosition(e))
              : undefined
          }
          onMouseDown={(e) => {
            config.setSelection("start", getMousePosition(e));
            config.setSelection("isSelecting", true);
          }}
        />
      </div>
    </Show>
  );
};
