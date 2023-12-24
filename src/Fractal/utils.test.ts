import { expect, it } from "vitest";
import { pointToComplex } from "./utils";
import { Complex, Point } from "../shared";

it("translates (0,0)", () => {
  const arg: Point = { x: 0, y: 0 };
  const should: Complex = {
    real: -2.5,
    imaginary: 2.5,
  };
  const got = pointToComplex(arg);
  expect(got).toEqual(should);
});

it("translates (0.25,0.25)", () => {
  const precition = 4;
  const arg: Point = { x: 0.25, y: 0.25 };
  const should: Complex = {
    real: -1.25,
    imaginary: 1.25,
  };
  const got = pointToComplex(arg);
  expect(got.real).toBeCloseTo(should.real, precition);
  expect(got.imaginary).toBeCloseTo(should.imaginary, precition);
});

it("translates (0.5,0.5)", () => {
  const precition = 4;
  const arg: Point = { x: 0.5, y: 0.5 };
  const should: Complex = {
    real: 0,
    imaginary: 0,
  };
  const got = pointToComplex(arg);
  expect(got.real).toBeCloseTo(should.real, precition);
  expect(got.imaginary).toBeCloseTo(should.imaginary, precition);
});