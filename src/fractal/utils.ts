import { Complex } from "../api";
import { Point, Size } from "./config";

const cache = {
  aspectRatio: 0,
  viewportToComplex: 0,
};

export const __initCache = (aspectRatio: number) => {
  const MAX_SCALE = 5; // sets an upper bound for height/width in complex
  const factor = Math.min(1, aspectRatio);
  cache.viewportToComplex = MAX_SCALE * factor;
  cache.aspectRatio = aspectRatio;
};

export const getViewerDimentions = (aspectRatio: number): Size => {
  __initCache(aspectRatio);
  const PIXELS_IN_IMAGE = 2 ** 60;

  // w * h = pixels and w / h = ratio
  // (w * h)(w / h) = pixels * ratio
  // w = sqrt(pixels * ratio)
  const { sqrt, floor } = Math;
  const width = floor(sqrt(PIXELS_IN_IMAGE * aspectRatio));
  const height = floor(PIXELS_IN_IMAGE / width);
  return { width, height };
};

/**
 * Expects points { x, y } where x, y are expressed as a ratio of
 * full image WIDTH!! (default unit of OpenSeadragon)
 */
export const pointToComplex = (point: Point): Complex => {
  const scale = { ...point };
  scale.x -= 0.5; // 50% right
  scale.y -= 0.5 / cache.aspectRatio; // 50% down, with respect to width
  scale.y *= -1; // flip
  return {
    real: scale.x * cache.viewportToComplex,
    imaginary: scale.y * cache.viewportToComplex,
  };
};
