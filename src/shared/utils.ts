export const clip = (
  lowBound: number,
  highBound: number,
  value: number
): number => {
  let validated = Math.min(value, highBound);
  validated = Math.max(validated, lowBound);
  return validated;
};
