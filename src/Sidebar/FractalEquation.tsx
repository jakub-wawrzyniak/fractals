import { Show } from "solid-js";
import { HasChild } from "../shared";
import { store } from "../store";

const Equasion = (props: HasChild) => {
  return <p class="font-mono text-center text-lg">{props.children}</p>;
};

export const FractalEquation = () => {
  const constant = () => store.fractal.getConstantOrThrow("FractalEquation");
  const config = () => store.fractal.getConfig();

  const constantSign = () => {
    return constant().im < 0 ? " - " : " + ";
  };

  const constantReal = () => {
    return constant().re.toFixed(3);
  };

  const constantImaginary = () => {
    return Math.abs(constant().im).toFixed(3) + "i";
  };

  return (
    <div class="py-2 w-full">
      <Equasion>{config().equation}</Equasion>
      <Show when={config().initConstant !== null}>
        <Equasion>
          C = <span class="text-primary font-bold">{constantReal()}</span>
          {constantSign()}
          <span class="text-primary font-bold">{constantImaginary()}</span>
        </Equasion>
      </Show>
    </div>
  );
};
