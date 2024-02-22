import { AppStore, __setStore, __store } from "./store";

type DirectSetters = keyof AppStore["coloring"];
const setColoring = <Key extends DirectSetters>(
  key: Key,
  value: AppStore["coloring"][Key]
) => {
  __setStore("coloring", key, value);
};

const getColorHash = () => {
  const { color, method, antialiasing, brightness, exponent } =
    __store.coloring;
  let hash = `${color}@${method}&aa=${antialiasing}&lum=${brightness}`;
  if (method === "Exponential") {
    hash += "&expo=";
    hash += exponent.toString();
  }
  return hash;
};

export const coloring = {
  getColorHash,
  get: __store.coloring,
  set: setColoring,
};
