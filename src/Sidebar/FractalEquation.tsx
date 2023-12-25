import { Equasion, store } from "../shared";

export const FractalEquation = () => {
  const constantSign = () => {
    return store.juliaConstant.imaginary < 0 ? " - " : " + ";
  };

  const constantReal = () => {
    return store.juliaConstant.real.toFixed(3);
  };

  const constantImaginary = () => {
    return Math.abs(store.juliaConstant.imaginary).toFixed(3) + "i";
  };

  return (
    <div class="py-2 w-full">
      <Equasion>F(n) = F(n - 1) + C</Equasion>
      <Equasion>
        C = <span class="text-primary font-bold">{constantReal()}</span>
        {constantSign()}
        <span class="text-secondary font-bold">{constantImaginary()}</span>
      </Equasion>
    </div>
  );
};
