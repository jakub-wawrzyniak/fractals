import {
  DEFAULT_ASPECT_RATIO,
  FRACTAL_CONFIG,
  FRACTALS,
  Fractal,
} from "./constants";
import { createStore } from "solid-js/store";
import { clip } from "./utils";
import { batch } from "solid-js";
import { Complex, Point } from "./types";

type AppStore = {
  exportWidth: number;
  userColor: string;
  renderWithIterations: number;
  fractalAspectRatio: number;
  fractalVariant: Fractal;
  fractalConstant: Complex | null;
  exportFragment: boolean;
  fractalFragmentSelection: {
    isSelecting: boolean;
    start: Point;
    end: Point;
  };
};

const initConstant = (variant: Fractal) => {
  const constant = FRACTAL_CONFIG[variant].initConstant;
  if (constant === null) return null;
  return { ...constant }; // deep copy, so that the default value will not be overwritten
};

const initFractal = FRACTALS[0];
const initStore: AppStore = {
  userColor: "#ff0000",
  exportWidth: 3000,
  renderWithIterations: 1024,
  fractalVariant: initFractal,
  fractalConstant: initConstant(initFractal),
  fractalAspectRatio: DEFAULT_ASPECT_RATIO,
  exportFragment: false,
  fractalFragmentSelection: {
    isSelecting: false,
    start: {
      x: 0.25,
      y: 0.25,
    },
    end: {
      x: 0.75,
      y: 0.75,
    },
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

export const setFractalFragmentSelectionPoint = (
  name: "start" | "end",
  point: Point
) => {
  setStore("fractalFragmentSelection", name, point);
};

export const toggleIsSelectingFractalFragment = () => {
  setStore(
    "fractalFragmentSelection",
    "isSelecting",
    (selecting) => !selecting
  );
};

export const setExportFragment = (value: boolean) => {
  setStore("exportFragment", value);
};

export const setUserColor = (color: string) => {
  setStore("userColor", color);
};

export const setIterations = (value: number) => {
  setStore("renderWithIterations", value);
};

export const pickedAspectRatio = () => {
  if (!store.exportFragment) return store.fractalAspectRatio;
  const { abs } = Math;
  const { end, start } = store.fractalFragmentSelection;
  const width = abs(end.x - start.x);
  const height = abs(end.y - start.y);
  return width / height;
};

export const exportHeight = () => {
  return Math.floor(store.exportWidth / pickedAspectRatio());
};

export const setExportHeight = (height: number) => {
  setStore("exportWidth", Math.floor(height * pickedAspectRatio()));
};

export const setExportWidth = (width: number) => {
  setStore("exportWidth", width);
};
