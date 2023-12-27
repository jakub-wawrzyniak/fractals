import {
  DEFAULT_ASPECT_RATIO,
  FRACTAL_CONFIG,
  FRACTALS,
  Fractal,
} from "./constants";
import { createStore } from "solid-js/store";
import { clip } from "./utils";
import { batch } from "solid-js";
import { Complex, Size, Point } from "./types";

type AppStore = {
  fractalAspectRatio: number;
  fractalVariant: Fractal;
  fractalConstant: Complex | null;
  fractalFragmentSelection: Size &
    Point & {
      isSelecting: boolean;
    };
};

const initConstant = (variant: Fractal) => {
  const constant = FRACTAL_CONFIG[variant].initConstant;
  if (constant === null) return null;
  return { ...constant }; // deep copy, so that the default value will not be overwritten
};

const initFractal = FRACTALS[0];
const initStore: AppStore = {
  fractalVariant: initFractal,
  fractalConstant: initConstant(initFractal),
  fractalAspectRatio: DEFAULT_ASPECT_RATIO,
  fractalFragmentSelection: {
    isSelecting: true,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
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
    if (store.fractalConstant !== null) {
      setConstantImaginary(store.fractalConstant.imaginary);
      // ^imaginary constant might go out of bounds on aspectRatio
      // change, must revalidate
    }
  });
};

export const changeFractalVariant = (variant: Fractal) => {
  batch(() => {
    setStore("fractalVariant", variant);
    setStore("fractalConstant", initConstant(variant));
  });
};

export const getConstantOrThrow = (where: string) => {
  const { fractalConstant: constant, fractalVariant: variant } = store;
  if (constant === null)
    throw `${where}: attempt to access a null-value constant (${variant})`;
  return constant;
};
