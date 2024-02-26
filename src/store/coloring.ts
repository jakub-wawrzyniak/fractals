import { AppStore, __setStore, __store } from "./store";

type DirectSetters = "antialiasing" | "method" | "brightness" | "exponent";
const setColoring = <Key extends DirectSetters>(
  key: Key,
  value: AppStore["coloring"][Key]
) => {
  __setStore("coloring", key, value);
};

const getColorHash = () => {
  const { color, method, antialiasing, brightness, exponent } =
    __store.coloring;
  let hash = `from=${color.hex_start}to=${color.hex_end}@${method}&aa=${antialiasing}&lum=${brightness}`;
  if (method === "Exponential") {
    hash += "&expo=";
    hash += exponent.toString();
  }
  return hash;
};

const setColor = (which: "hex_start" | "hex_end", value: string) => {
  __setStore("coloring", "color", which, value);
};

export const coloring = {
  getColorHash,
  get: __store.coloring,
  setColor,
  set: setColoring,
};
