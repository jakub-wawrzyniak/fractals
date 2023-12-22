const cache = {
  aspectRatio: -1,
  xToReal: 0,
  yToImaginary: 0,
};

const initCache = (aspectRatio: number) => {
  const MAX_SCALE = 5;
  cache.aspectRatio = aspectRatio;
  if (aspectRatio >= 1) {
    cache.yToImaginary = MAX_SCALE;
    cache.xToReal = MAX_SCALE / aspectRatio;
  } else {
    cache.xToReal = MAX_SCALE;
    cache.yToImaginary = aspectRatio / MAX_SCALE;
  }
};

export const getViewerDimentions = (aspectRatio: number): Size => {
  // w * h = pixels and w / h = ratio
  // (w * h)(w / h) = pixels * ratio
  // w = sqrt(pixels * ratio)
  initCache(aspectRatio);
  const { sqrt, floor } = Math;
  const PIXELS_IN_IMAGE = 2 ** 60;
  let width = floor(sqrt(PIXELS_IN_IMAGE * aspectRatio));
  let height = floor(PIXELS_IN_IMAGE / width);
  return { width, height };
};

type Point = { x: number; y: number };
type Complex = { re: number; im: number };
type Size = { width: number; height: number };

/**
 * Expects points (x, y) where x, y are expressed as a ratio of
 * full image length (default unit of OpenSeadragon)
 */
export const pointToComplex = (point: Point): Complex => {
  const scale = { ...point };
  scale.x += 0.5;
  scale.y += 0.5 * cache.aspectRatio;
  return {
    re: scale.x * cache.xToReal,
    im: scale.y * cache.yToImaginary,
  };
};
