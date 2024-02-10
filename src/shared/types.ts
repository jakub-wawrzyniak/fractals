import { JSXElement } from "solid-js";

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Complex = {
  im: number;
  re: number;
};

export type HasClass = { class?: string };
export type HasChild = {
  children: JSXElement;
};
