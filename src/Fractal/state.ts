import { Complex, Point, Size } from "../shared";

export const TILE_SIZE_PX = 256;
export let center = { real: 0.0, imaginary: 0.0 };
export let level = -1.7;

export function changeLevelBy(change: number) {
  level += change;
}

export function setCenter(update: Complex) {
  center = update;
}

export function changeCenterBy(change: Complex) {
  center.real += change.real;
  center.imaginary += change.imaginary;
}

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function pixelToComplex(): number {
  const tileSizeComplex = 2 ** level;
  return tileSizeComplex / TILE_SIZE_PX;
}

export function screenBounds(size: Size): Bounds {
  const pixelRatio = pixelToComplex();
  const widthComplex = size.width * pixelRatio;
  const heightComplex = size.height * pixelRatio;
  return {
    top: center.imaginary + heightComplex * 0.5,
    bottom: center.imaginary - heightComplex * 0.5,
    left: center.real - widthComplex * 0.5,
    right: center.real + widthComplex * 0.5,
  };
}

export function complexToViewport(position: Complex, screen: Size): Point {
  const pixelRatio = 1 / pixelToComplex();
  const distance: Complex = {
    real: position.real - center.real,
    imaginary: position.imaginary - center.imaginary,
  };

  return {
    x: screen.width * 0.5 + distance.real * pixelRatio,
    y: screen.height * 0.5 - distance.imaginary * pixelRatio,
  };
}

export function viewportToComplex(position: Point, screen: Size): Complex {
  const pixelRatio = pixelToComplex();
  const change: Point = {
    x: position.x - screen.width * 0.5,
    y: position.y - screen.height * 0.5,
  };

  return {
    real: center.real + change.x * pixelRatio,
    imaginary: center.imaginary - change.y * pixelRatio,
  };
}
