import { describe, expect, it } from "vitest";
import { Tile, tileNeighbours, tileWithPoint, tilesOnScreen } from "./tiles";
import { Size } from "../shared";
import { Position, state } from "./state";

describe("tileNeighbours", () => {
  it("excludes self", () => {
    const tile = Tile.get(2, 3, 4);
    const neighbours = tileNeighbours(tile, 0);
    expect(neighbours.length).toBe(0);
  });
  it("returns correct count", () => {
    const tile = Tile.get(2, 3, 4);
    const n1 = tileNeighbours(tile, 1);
    const n2 = tileNeighbours(tile, 2);
    expect(n1.length).toBe(8);
    expect(n2.length).toBe(16);
  });
});

describe("tileWithPoint", () => {
  it("given center, always returns a tile on screen", () => {
    state.jumpTo(new Position(0.3, 5, -2));
    const screen: Size = {
      width: 1200,
      height: 800,
    };
    for (let level = -2; level < 3; level++) {
      const tile = tileWithPoint(level, state.current.center);
      const onScreen = tile.isOnScreen(screen);
      expect(onScreen, `level=${level}`).toBeTruthy();
    }
  });
});

describe("tilesOnScreen", () => {
  it("has no duplicates", () => {
    const screen: Size = {
      width: 1200,
      height: 800,
    };

    const hashes = tilesOnScreen(screen).map((tile) => tile.hash);
    expect(hashes.length).toBe(new Set(hashes).size);
  });
});
