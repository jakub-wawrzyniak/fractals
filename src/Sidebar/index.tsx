import { ExportConfig } from "./ExportConfig";
import { Show } from "solid-js";
import { FractalEquation } from "./FractalEquation";
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
    <aside class="w-[400px] p-6 flex flex-col gap-2">
      <FractalSelectVariant />
      <FractalEquation />
      <Show when={store.fractal.getConfig().initConstant !== null}>
        <InputNumber
          step={0.005}
          format="float"
          withRangeSlider={true}
          getNumber={() => constant().re}
          setNumber={(num) => store.fractal.setConstant("re", num)}
          max={BOUNDS.max}
          min={BOUNDS.min}
          label="C: real component"
        />
        <InputNumber
          step={0.005}
          format="float"
          withRangeSlider={true}
          getNumber={() => constant().im}
          setNumber={(num) => store.fractal.setConstant("im", num)}
          max={BOUNDS.max}
          min={BOUNDS.min}
          label="C: imaginary component"
          unit="i"
        />
      </Show>
      <div class="grid grid-rows-[auto_auto] gap-2">
        <InputNumber
          min={0}
          step={100}
          format="int"
          getNumber={() => store.fractal.get.maxIterations}
          setNumber={(count) => store.fractal.set("maxIterations", count)}
          label="How large is infinity"
          help={{
            header: "sorry... what?",
            description: "yeah, I barely get it myself ;-;",
          }}
        />
        <FractalColorPicker />
      </div>
      <ExportConfig />
    </aside>
  );
};
