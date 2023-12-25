import { JSXElement } from "solid-js";

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Complex = {
  imaginary: number;
  real: number;
};
export type HasChild = {
  children: JSXElement;
};
export type FractalVariant = "Mandelbrot" | "Newton" | "BurningShip";
