import { Show } from "solid-js";
import { store } from "../store";
import { FractalEquation } from "./FractalEquation";
import { FractalSectionHeader } from "./FractalSectionHeader";
import { InputNumber } from "./InputNumber";

export const FractalSection = () => {
  const BOUNDS = {
    max: 5,
    min: -5,
  };
  const constant = () => store.fractal.getConstantOrThrow("Sidebar");
  return (
    <div class="flex flex-col gap-2">
      <FractalSectionHeader />
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
      <InputNumber
        min={0}
        step={100}
        format="int"
        getNumber={() => store.fractal.get.maxIterations}
        setNumber={(count) => store.fractal.setMaxIterations(count)}
        label="How large is infinity"
        help={{
          header: "sorry... what?",
          description: "yeah, I barely get it myself ;-;",
        }}
      />
    </div>
  );
};
