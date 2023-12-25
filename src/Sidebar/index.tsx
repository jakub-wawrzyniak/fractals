import {
  Header,
  Equasion,
  imaginaryBounds,
  realBounds,
  setJuliaConstantImaginary,
  setJuliaConstantReal,
  store,
} from "../shared";
import { InputNumber } from "./InputNumber";

export const Sidebar = () => {
  const constantToString = () => {
    const sign = store.juliaConstant.imaginary < 0 ? "-" : "+";
    const real = store.juliaConstant.real.toFixed(2);
    const imaginary = Math.abs(store.juliaConstant.imaginary).toFixed(2);
    return `${real} ${sign} ${imaginary}i`;
  };

  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <Header>Mandelbrot fractal</Header>
      <div class="py-2 w-full">
        <Equasion>F(n) = F(n - 1) + C</Equasion>
        <Equasion>C = {constantToString()}</Equasion>
      </div>
      <InputNumber
        getNumber={() => store.juliaConstant.real}
        setNumber={setJuliaConstantReal}
        max={realBounds.max}
        min={realBounds.min}
        label="C: real component"
      />
      <InputNumber
        getNumber={() => store.juliaConstant.imaginary}
        setNumber={setJuliaConstantImaginary}
        max={imaginaryBounds().max}
        min={imaginaryBounds().min}
        label="C: imaginary component"
      />
    </aside>
  );
};
