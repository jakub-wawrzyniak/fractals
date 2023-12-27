import { Show } from "solid-js";
import {
  fractalConfig,
  imaginaryBounds,
  realBounds,
  setConstantImaginary,
  setConstantReal,
  setIterations,
  store,
} from "../shared";
import { FractalEquation } from "./FractalEquation";
import { InputRange } from "./InputRange";
import { SelectFractal } from "./SelectFractal";
import { ColorPicker } from "./ColorPicker";
import { InputNumber } from "./InputNumber";

export const SidebarFractalConfig = () => {
  const getOrThrow = (key: "real" | "imaginary") => () => {
    if (store.fractalConstant === null)
      throw "InputNumber: Attempt to access a constant, but it was null";
    return store.fractalConstant[key];
  };

  return (
    <>
      <SelectFractal />
      <FractalEquation />
      <Show when={fractalConfig().initConstant !== null}>
        <InputRange
          getNumber={getOrThrow("real")}
          setNumber={setConstantReal}
          max={realBounds().max}
          min={realBounds().min}
          label="C: real component"
          class="range-primary"
        />
        <InputRange
          getNumber={getOrThrow("imaginary")}
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
          getNumber={() => store.renderWithIterations}
          setNumber={(count) => setIterations(count)}
          label="How large is Infinity?"
          class="range-primary"
        />
        <ColorPicker />
      </div>
    </>
  );
};
