import { store } from "../store";
import { CalcTileRequest, FractalVariant } from "./types";

export const getFractalConfig = (): Omit<CalcTileRequest, "fragment"> => {
  const { maxIterations, color, ...config } = store.fractal.get;

  let variant: FractalVariant;
  if (config.variant === "JuliaSet") {
    if (config.constant === null) throw "Constant is null in JuliaSet";
    variant = { type: "JuliaSet", constant: config.constant };
  } else {
    variant = { type: config.variant };
  }

  return {
    color: {
      color,
      brightness: 4.0,
      anti_alias: true,
      method: { type: "Linear" },
    },
    fractal: {
      variant,
      max_iterations: maxIterations,
    },
  };
};
