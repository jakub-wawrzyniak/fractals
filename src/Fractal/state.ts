import { Complex } from "../shared";

export const TILE_SIZE_PX = 256;
export let center = { real: 0.0, imaginary: 0.0 };
export let level = -1.7;

export function setCenter(update: Complex) {
  center = update;
}

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function screenBounds(size: Size): Bounds {
  const tileSizeComplex = 2 ** level;
  const widthComplex = (size.width / TILE_SIZE_PX) * tileSizeComplex;
  const heightComplex = (size.height / TILE_SIZE_PX) * tileSizeComplex;
  return {
    top: center.imaginary + heightComplex * 0.5,
    bottom: center.imaginary - heightComplex * 0.5,
    left: center.real - widthComplex * 0.5,
    right: center.real + widthComplex * 0.5,
  };
}

export function complexToViewport(position: Complex, screen: Size): Point {
  const distance: Complex = {
    real: position.real - center.real,
    imaginary: position.imaginary - center.imaginary,
  };
  const tileSizeComplex = 2 ** level;
  const pixelSizeRatio = TILE_SIZE_PX / tileSizeComplex;

  return {
    x: screen.width * 0.5 + distance.real * pixelSizeRatio,
    y: screen.height * 0.5 - distance.imaginary * pixelSizeRatio,
  };
}
