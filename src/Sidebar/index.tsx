import { ExportConfig } from "./ExportConfig";
import { Show } from "solid-js";
import {
  fractalConfig,
  getConstantOrThrow as constant,
  imaginaryBounds,
  realBounds,
  setConstantImaginary,
  setConstantReal,
  setMaxIterations,
  store,
} from "../shared";
import { FractalEquation } from "./FractalEquation";
import { InputRange } from "./InputRange";
import { FractalSelectVariant } from "./FractalSelectVariant";
import { FractalColorPicker } from "./FractalColorPicker";
import { InputNumber } from "./InputNumber";

export const Sidebar = () => {
  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <FractalSelectVariant />
      <FractalEquation />
      <Show when={fractalConfig().initConstant !== null}>
        <InputRange
          getNumber={() => constant("InputNumber").real}
          setNumber={setConstantReal}
          max={realBounds().max}
          min={realBounds().min}
          label="C: real component"
          class="range-primary"
        />
        <InputRange
          getNumber={() => constant("InputNumber").imaginary}
          setNumber={setConstantImaginary}
          max={imaginaryBounds().max}
          min={imaginaryBounds().min}
          label="C: imaginary component"
          class="range-primary"
          unit="i"
        />
      </Show>
      <div class="flex gap-1 items-end">
        <InputNumber
          getNumber={() => store.fractal.maxIterations}
          setNumber={(count) => setMaxIterations(count)}
          label="How large is Infinity?"
          class="flex-1"
        />
        <FractalColorPicker />
      </div>
      <ExportConfig />
    </aside>
  );
};
