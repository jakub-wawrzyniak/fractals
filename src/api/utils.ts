import { store } from "../shared";
import { FractalConfig } from "./types";

export const pixelsToImage = (pixels: number[], width: number): ImageData => {
  const height = pixels.length / width;
  const image = new ImageData(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const lumaIndex = y * width + x;
      const rgbIndex = (y * width + x) * 4;
      const luma = pixels[lumaIndex];
      image.data[rgbIndex + 0] = luma;
      image.data[rgbIndex + 1] = luma;
      image.data[rgbIndex + 2] = luma;
      image.data[rgbIndex + 3] = 255;
    }
  }
  return image;
};

export const getFractalConfig = (): FractalConfig => {
  const { maxIterations, ...config } = store.fractal;
  return {
    ...config,
    max_iterations: maxIterations,
  };
};
