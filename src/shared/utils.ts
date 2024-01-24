import { Complex, Size } from "./types";

export const clip = (
  lowBound: number,
  highBound: number,
  value: number
): number => {
  let validated = Math.min(value, highBound);
  validated = Math.max(validated, lowBound);
  return validated;
};

export const assert = (condition: boolean, where: string, what: string) => {
  if (condition === true) return;
  throw `${where}: ${what}`;
};

export const isSizeSame = (size1: Size, size2: Size) => {
  return size1.height === size2.height && size1.width === size2.height;
};

const { abs } = Math;
export function distanceManhatan(point1: Complex, point2: Complex) {
  const realDistance = abs(point1.real - point2.real);
  const imaginaryDistance = abs(point1.imaginary - point2.imaginary);
  return realDistance + imaginaryDistance;
}
