import { Show } from "solid-js";
import {
  fractalConfig,
  imaginaryBounds,
  realBounds,
  setConstantImaginary,
  setConstantReal,
  store,
} from "../shared";
import { FractalEquation } from "./FractalEquation";
import { InputNumber } from "./InputNumber";
import { SelectFractal } from "./SelectFractal";

export const Sidebar = () => {
  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <SelectFractal />
      <FractalEquation />
      <Show when={fractalConfig().usesConstant}>
        <InputNumber
          getNumber={() => store.fractalConstant.real}
          setNumber={setConstantReal}
          max={realBounds().max}
          min={realBounds().min}
          label="C: real component"
          class="range-primary"
        />
        <InputNumber
          getNumber={() => store.fractalConstant.imaginary}
          setNumber={setConstantImaginary}
          max={imaginaryBounds().max}
          min={imaginaryBounds().min}
          label="C: imaginary component"
          class="range-secondary"
          unit="i"
        />
      </Show>
    </aside>
  );
};
