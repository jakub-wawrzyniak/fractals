export const pixelsToImage = (pixels: number[], width: number): ImageData => {
  const height = pixels.length / width;
  const image = new ImageData(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const lumaIndex = y * width + x;
      const rgbIndex = (y * width + x) * 4;
      image.data[rgbIndex] = pixels[lumaIndex];
      image.data[rgbIndex + 3] = 255;
    }
  }
  return image;
};
