import { Complex } from "../shared";

export class Position {
  center: Complex;
  level: number;

  constructor(real: number, imaginary: number, level: number) {
    this.center = { re: real, im: imaginary };
    this.level = level;
  }

  changeTo(source: Position) {
    this.level = source.level;
    this.center.re = source.center.re;
    this.center.im = source.center.im;
  }

  changeBy(vector: Position) {
    this.level += vector.level;
    this.center.re += vector.center.re;
    this.center.im += vector.center.im;
  }

  equals(pos: Position): boolean {
    return (
      this.level === pos.level &&
      this.center.re === pos.center.re &&
      this.center.im === pos.center.im
    );
  }

  distanceTo(pos: Position): Position {
    return new Position(
      pos.center.re - this.center.re,
      pos.center.im - this.center.im,
      pos.level - this.level
    );
  }

  multiply(factor: number): Position {
    return new Position(
      this.center.re * factor,
      this.center.im * factor,
      this.level * factor
    );
  }
}
