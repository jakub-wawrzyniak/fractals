import { Complex } from "../api";
import { Point, Size } from "./config";

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

/**
 * Expects points (x, y) where x, y are expressed as a ratio of
 * full image length (default unit of OpenSeadragon)
 */
export const pointToComplex = (point: Point): Complex => {
  const scale = { ...point };
  scale.x -= 0.5;
  scale.y -= 0.5 * cache.aspectRatio;
  scale.y *= -1;
  return {
    real: scale.x * cache.xToReal,
    imaginary: scale.y * cache.yToImaginary,
  };
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("translates (0,0)", () => {
    initCache(1);
    const arg: Point = { x: 0, y: 0 };
    const should: Complex = {
      real: -2.5,
      imaginary: 2.5,
    };
    const got = pointToComplex(arg);
    expect(got).toEqual(should);
  });

  it("translates (0.25,0.25)", () => {
    initCache(1);
    const precition = 4;
    const arg: Point = { x: 0.25, y: 0.25 };
    const should: Complex = {
      real: -1.25,
      imaginary: 1.25,
    };
    const got = pointToComplex(arg);
    expect(got.real).toBeCloseTo(should.real, precition);
    expect(got.imaginary).toBeCloseTo(should.imaginary, precition);
  });

  it("translates (0.5,0.5)", () => {
    initCache(1);
    const precition = 4;
    const arg: Point = { x: 0.5, y: 0.5 };
    const should: Complex = {
      real: 0,
      imaginary: 0,
    };
    const got = pointToComplex(arg);
    expect(got.real).toBeCloseTo(should.real, precition);
    expect(got.imaginary).toBeCloseTo(should.imaginary, precition);
  });
}
