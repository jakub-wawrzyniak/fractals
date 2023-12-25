import {
  Header,
  imaginaryBounds,
  realBounds,
  setJuliaConstantImaginary,
  setJuliaConstantReal,
  store,
} from "../shared";
import { FractalEquation } from "./FractalEquation";
import { InputNumber } from "./InputNumber";

export const Sidebar = () => {
  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <Header>Mandelbrot fractal</Header>
      <FractalEquation />
      <InputNumber
        getNumber={() => store.juliaConstant.real}
        setNumber={setJuliaConstantReal}
        max={realBounds.max}
        min={realBounds.min}
        label="C: real component"
        class="range-primary"
      />
      <InputNumber
        getNumber={() => store.juliaConstant.imaginary}
        setNumber={setJuliaConstantImaginary}
        max={imaginaryBounds().max}
        min={imaginaryBounds().min}
        label="C: imaginary component"
        unit="i"
        class="range-secondary"
      />
    </aside>
  );
};
