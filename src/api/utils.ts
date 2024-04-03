import { store } from "../store";
import { CalcTileRequest, ColorMethod, FractalVariant } from "./types";

export const getColorConfig = (): CalcTileRequest["color"] => {
  const { method: variant, antialiasing, ...config } = store.coloring.get;
  let method: ColorMethod;
  if (variant === "Exponential") {
    method = {
      type: "Exponential",
      power: config.exponent,
    };
  } else method = { type: variant };

  return {
    method,
    anti_alias: antialiasing,
    ...config,
  };
};

export const getFractalConfig = (): CalcTileRequest["fractal"] => {
  const { maxIterations, ...config } = store.fractal.get;

  let variant: FractalVariant;
  if (config.variant === "JuliaSet") {
    if (config.constant === null) throw "Constant is null in JuliaSet";
    variant = { type: "JuliaSet", constant: config.constant };
  } else {
    variant = { type: config.variant };
  }

  return {
    variant,
    max_iterations: maxIterations,
  };
};
