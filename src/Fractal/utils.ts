import { ALLOWED_COMPLEX_RANGE, Complex, Point, Size, store } from "../shared";

const viewportToComplex = () => {
  const factor = Math.min(1, store.fractalAspectRatio);
  return ALLOWED_COMPLEX_RANGE * factor;
};

export const viewerDimensions = (): Size => {
  const PIXELS_IN_IMAGE = 2 ** 60;

  // w * h = pixels and w / h = ratio
  // (w * h)(w / h) = pixels * ratio
  // w = sqrt(pixels * ratio)
  const { sqrt, floor } = Math;
  const width = floor(sqrt(PIXELS_IN_IMAGE * store.fractalAspectRatio));
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
  scale.y -= 0.5 / store.fractalAspectRatio; // 50% down, with respect to width
  scale.y *= -1; // flip
  return {
    real: scale.x * viewportToComplex(),
    imaginary: scale.y * viewportToComplex(),
  };
};
