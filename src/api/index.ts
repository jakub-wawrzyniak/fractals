import { invoke } from "@tauri-apps/api";

export type Complex = {
  imaginary: number;
  real: number;
};

export type JuliaImageRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

export const calcImage = async (
  request: JuliaImageRequest
): Promise<ImageData> => {
  const pixels = await invoke<number[]>("calc_image", { request });
  const width = request.width_px;
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
