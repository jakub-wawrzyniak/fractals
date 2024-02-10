import { batch } from "solid-js";
import { Complex, FRACTAL_CONFIG, Fractal } from "../shared";
import { AppStore, __setStore, __store, initConstant } from "./store";

const getConfig = () => FRACTAL_CONFIG[__store.fractal.variant];
const getConstantOrThrow = (where: string) => {
  const { constant, variant } = __store.fractal;
  if (constant === null)
    throw `${where}: attempt to access a null-value constant (${variant})`;
  return constant;
};

const getHash = () => {
  const { color, variant, maxIterations, constant } = __store.fractal;
  let hash = `${variant}@${maxIterations}iters?color=${color}`;
  if (constant != null) {
    const { re: real, im: imaginary } = constant;
    hash += `&const=(${real}+${imaginary}i)`;
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

type DirectSetters = "color" | "maxIterations";
const setFractal = <Key extends DirectSetters>(
  key: Key,
  value: AppStore["fractal"][Key]
) => {
  __setStore("fractal", key, value);
};

export const fractal = {
  get: __store.fractal,
  getHash,
  getConfig,
  getConstantOrThrow,
  changeFractalVariant,
  set: setFractal,
  setConstant,
};
