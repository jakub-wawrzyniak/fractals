import { Complex } from "../shared";

export class Position {
  center: Complex;
  level: number;

  constructor(real: number, imaginary: number, level: number) {
    this.center = { real, imaginary };
    this.level = level;
  }

  changeTo(source: Position) {
    this.level = source.level;
    this.center.real = source.center.real;
    this.center.imaginary = source.center.imaginary;
  }

  changeBy(vector: Position) {
    this.level += vector.level;
    this.center.real += vector.center.real;
    this.center.imaginary += vector.center.imaginary;
  }

  equals(pos: Position): boolean {
    return (
      this.level === pos.level &&
      this.center.real === pos.center.real &&
      this.center.imaginary === pos.center.imaginary
    );
  }

  distanceTo(pos: Position): Position {
    return new Position(
      pos.center.real - this.center.real,
      pos.center.imaginary - this.center.imaginary,
      pos.level - this.level
    );
  }

  multiply(factor: number): Position {
    return new Position(
      this.center.real * factor,
      this.center.imaginary * factor,
      this.level * factor
    );
  }
}
