import { Show } from "solid-js";
import { HasChild, fractalConfig, getConstantOrThrow } from "../shared";

const Equasion = (props: HasChild) => {
  return <p class="font-mono text-center text-lg">{props.children}</p>;
};

export const FractalEquation = () => {
  const constant = () => getConstantOrThrow("FractalEquation");

  const constantSign = () => {
    return constant().imaginary < 0 ? " - " : " + ";
  };

  const constantReal = () => {
    return constant().real.toFixed(3);
  };

  const constantImaginary = () => {
    return Math.abs(constant().imaginary).toFixed(3) + "i";
  };

  return (
    <div class="py-2 w-full">
      <Equasion>{fractalConfig().equation}</Equasion>
      <Show when={fractalConfig().initConstant !== null}>
        <Equasion>
          C = <span class="text-primary font-bold">{constantReal()}</span>
          {constantSign()}
          <span class="text-primary font-bold">{constantImaginary()}</span>
        </Equasion>
      </Show>
    </div>
  );
};
