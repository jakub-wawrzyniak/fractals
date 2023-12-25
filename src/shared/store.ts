import {
  DEFAULT_ASPECT_RATIO,
  FRACTAL_CONFIG,
  FRACTAL_VARIANT,
  FractalVariant,
} from "./constants";
import { createStore } from "solid-js/store";
import { clip } from "./utils";
import { Complex } from "./types";
import { batch } from "solid-js";

type AppStore = {
  fractalConstant: Complex;
  fractalAspectRatio: number;
  fractalVariant: FractalVariant;
};

const initVariant = FRACTAL_VARIANT[0];
const initStore: AppStore = {
  fractalVariant: initVariant,
  fractalAspectRatio: DEFAULT_ASPECT_RATIO,
  fractalConstant: { ...FRACTAL_CONFIG[initVariant].defaultConstant },
};

const [store, setStore] = createStore(initStore);
export { store };

type Bounds = {
  range: number;
  min: number;
  max: number;
};

export const fractalConfig = () => FRACTAL_CONFIG[store.fractalVariant];
export const imaginaryBounds = (): Bounds => {
  const range =
    fractalConfig().allowedRangeInComplex / store.fractalAspectRatio;
  return {
    range,
    min: -range / 2,
    max: range / 2,
  };
};

export const realBounds = (): Bounds => {
  const range = fractalConfig().allowedRangeInComplex;
  return {
    range,
    min: -range / 2,
    max: range / 2,
  };
};

export const setConstantImaginary = (value: number) => {
  const { min, max } = imaginaryBounds();
  setStore("fractalConstant", "imaginary", clip(min, max, value));
};

export const setConstantReal = (value: number) => {
  const { min, max } = realBounds();
  setStore("fractalConstant", "real", clip(min, max, value));
};

export const setFractalAspectRatio = (value: number) => {
  batch(() => {
    setStore("fractalAspectRatio", value);
    setConstantImaginary(store.fractalConstant.imaginary);
    // ^imaginary constant might go out of bounds on aspectRatio
    // change, must revalidate
  });
};

export const changeFractalVariant = (variant: FractalVariant) => {
  batch(() => {
    setStore("fractalVariant", variant);
    const config = FRACTAL_CONFIG[variant];
    if (config.usesConstant) {
      console.log("updating");
      console.log(config.defaultConstant);
      setStore("fractalConstant", "real", config.defaultConstant.real);
      setStore(
        "fractalConstant",
        "imaginary",
        config.defaultConstant.imaginary
      );
    }
  });
};
