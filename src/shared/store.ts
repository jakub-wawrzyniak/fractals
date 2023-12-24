import { ALLOWED_COMPLEX_RANGE, DEFAULT_ASPECT_RATIO } from "./constants";
import { createStore } from "solid-js/store";
import { clip } from "./utils";
import { Complex } from "./types";
import { batch } from "solid-js";

type AppStore = {
  juliaConstant: Complex;
  fractalAspectRatio: number;
};

const initStore: AppStore = {
  fractalAspectRatio: DEFAULT_ASPECT_RATIO,
  juliaConstant: {
    real: 0.34,
    imaginary: 0.08,
  },
};

const [store, setStore] = createStore(initStore);
export { store };

type Bounds = {
  range: number;
  min: number;
  max: number;
};

export const imaginaryBounds = (): Bounds => {
  const range = ALLOWED_COMPLEX_RANGE / store.fractalAspectRatio;
  return {
    range,
    min: -range / 2,
    max: range / 2,
  };
};

export const realBounds: Bounds = {
  range: ALLOWED_COMPLEX_RANGE,
  min: -ALLOWED_COMPLEX_RANGE / 2,
  max: ALLOWED_COMPLEX_RANGE / 2,
};

export const setJuliaConstantImaginary = (value: number) => {
  const { min, max } = imaginaryBounds();
  setStore("juliaConstant", "imaginary", clip(min, max, value));
};

export const setJuliaConstantReal = (value: number) => {
  const { min, max } = realBounds;
  setStore("juliaConstant", "real", clip(min, max, value));
};

export const setFractalAspectRatio = (value: number) => {
  batch(() => {
    setStore("fractalAspectRatio", value);
    setJuliaConstantImaginary(store.juliaConstant.imaginary);
    // ^imaginary constant might go out of bounds on aspectRatio
    // change, must revalidate
  });
};
