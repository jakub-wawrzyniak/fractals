export const pixelsToImage = (pixels: number[], width: number): ImageData => {
  const buffer = new Uint8ClampedArray(pixels);
  const image = new ImageData(buffer, width);
  return image;
};
