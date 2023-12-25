import { Show } from "solid-js";
import { Equasion, fractalConfig, store } from "../shared";

export const FractalEquation = () => {
  const constantSign = () => {
    return store.fractalConstant.imaginary < 0 ? " - " : " + ";
  };

  const constantReal = () => {
    return store.fractalConstant.real.toFixed(3);
  };

  const constantImaginary = () => {
    return Math.abs(store.fractalConstant.imaginary).toFixed(3) + "i";
  };

  return (
    <div class="py-2 w-full">
      <Equasion>{fractalConfig().equation}</Equasion>
      <Show when={fractalConfig().usesConstant}>
        <Equasion>
          C = <span class="text-primary font-bold">{constantReal()}</span>
          {constantSign()}
          <span class="text-secondary font-bold">{constantImaginary()}</span>
        </Equasion>
      </Show>
    </div>
  );
};
