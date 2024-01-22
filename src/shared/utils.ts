import { Size } from ".";

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
