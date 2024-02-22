import { batch } from "solid-js";
import { Complex, FRACTAL_CONFIG, Fractal, complexToString } from "../shared";
import { __setStore, __store, initConstant } from "./store";

const getConfig = () => FRACTAL_CONFIG[__store.fractal.variant];
const getConstantOrThrow = (where: string) => {
  const { constant, variant } = __store.fractal;
  if (constant === null)
    throw `${where}: attempt to access a null-value constant (${variant})`;
  return constant;
};

const getFractalHash = () => {
  const { variant, maxIterations, constant } = __store.fractal;
  let hash = `${variant}@${maxIterations}iters`;
  if (constant != null) {
    hash += "&const=";
    hash += complexToString(constant);
  }
  return hash;
};

const setConstant = (key: keyof Complex, value: number) => {
  __setStore("fractal", "constant", key, value);
};

const changeFractalVariant = (variant: Fractal) => {
  batch(() => {
    __setStore("fractal", "variant", variant);
    __setStore("fractal", "constant", initConstant(variant));
  });
};

const setMaxIterations = (iters: number) => {
  __setStore("fractal", "maxIterations", iters);
};

export const fractal = {
  get: __store.fractal,
  getFractalHash,
  getConfig,
  getConstantOrThrow,
  changeFractalVariant,
  setMaxIterations,
  setConstant,
};
