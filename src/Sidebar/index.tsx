import { ExportConfig } from "./ExportConfig";
import { Show } from "solid-js";
import { FractalEquation } from "./FractalEquation";
import { InputRange } from "./InputRange";
import { FractalSelectVariant } from "./FractalSelectVariant";
import { FractalColorPicker } from "./FractalColorPicker";
import { InputNumber } from "./InputNumber";
import { store } from "../store";

export const Sidebar = () => {
  const BOUNDS = {
    max: 5,
    min: -5,
  };
  const constant = () => store.fractal.getConstantOrThrow("Sidebar");
  return (
    <aside class="w-[20vw] min-w-[370px] p-6 flex flex-col gap-2">
      <FractalSelectVariant />
      <FractalEquation />
      <Show when={store.fractal.getConfig().initConstant !== null}>
        <InputRange
          getNumber={() => constant().re}
          setNumber={(num) => store.fractal.setConstant("re", num)}
          max={BOUNDS.max}
          min={BOUNDS.min}
          label="C: real component"
          class="range-primary"
        />
        <InputRange
          getNumber={() => constant().im}
          setNumber={(num) => store.fractal.setConstant("im", num)}
          max={BOUNDS.max}
          min={BOUNDS.min}
          label="C: imaginary component"
          class="range-primary"
          unit="i"
        />
      </Show>
      <div class="flex gap-1 items-end">
        <InputNumber
          getNumber={() => store.fractal.get.maxIterations}
          setNumber={(count) => store.fractal.set("maxIterations", count)}
          label="How large is Infinity?"
          class="flex-1"
        />
        <FractalColorPicker />
      </div>
      <ExportConfig />
    </aside>
  );
};
