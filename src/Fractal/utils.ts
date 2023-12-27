import { Complex, Point, Size, fractalConfig, store } from "../shared";

const viewportToComplex = () => {
  const factor = Math.min(1, store.viewerAspectRatio);
  return fractalConfig().allowedRangeInComplex * factor;
};

export const viewerDimensions = (): Size => {
  const PIXELS_IN_IMAGE = 2 ** 60;

  // w * h = pixels and w / h = ratio
  // (w * h)(w / h) = pixels * ratio
  // w = sqrt(pixels * ratio)
  const { sqrt, floor } = Math;
  const width = floor(sqrt(PIXELS_IN_IMAGE * store.viewerAspectRatio));
  const height = floor(PIXELS_IN_IMAGE / width);
  return { width, height };
};

const graphOffset = () => fractalConfig().offsetGraphInComplex;

/**
 * Expects points { x, y } where x, y are expressed as a ratio of
 * full image WIDTH!! (default unit of OpenSeadragon)
 */
export const pointToComplex = (point: Point): Complex => {
  const scale = { ...point };
  scale.x -= 0.5; // 50% right
  scale.y -= 0.5 / store.viewerAspectRatio; // 50% down, with respect to width
  scale.y *= -1; // flip
  return {
    real: scale.x * viewportToComplex() + graphOffset().real,
    imaginary: scale.y * viewportToComplex() + graphOffset().imaginary,
  };
};
