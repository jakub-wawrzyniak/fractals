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
  const getOrThrow = (key: "real" | "imaginary") => () => {
    if (store.fractalConstant === null)
      throw "InputNumber: Attempt to access a constant, but it was null";
    return store.fractalConstant[key];
  };

  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <SelectFractal />
      <FractalEquation />
      <Show when={fractalConfig().initConstant !== null}>
        <InputNumber
          getNumber={getOrThrow("real")}
          setNumber={setConstantReal}
          max={realBounds().max}
          min={realBounds().min}
          label="C: real component"
          class="range-primary"
        />
        <InputNumber
          getNumber={getOrThrow("imaginary")}
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
