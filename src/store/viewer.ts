import { batch } from "solid-js";
import { Size } from "../shared";
import { __setStore, __store } from "./store";

const getAspectRatio = () => {
  return __store.viewer.width / __store.viewer.height;
};

const setSize = (size: Size) => {
  batch(() => {
    __setStore("viewer", "width", size.width);
    __setStore("viewer", "height", size.height);
  });
};

export const viewer = {
  get: __store.viewer,
  getAspectRatio,
  setSize,
};
