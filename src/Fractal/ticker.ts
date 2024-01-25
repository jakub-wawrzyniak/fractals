export class Ticker {
  private lastDrawnAt = 0;
  elapsedFrames = 0;
  drawingAt = 0;

  tick() {
    this.drawingAt = performance.now();
    let deltaTime = this.drawingAt - this.lastDrawnAt;

    if (deltaTime < 0) deltaTime = 0;
    if (deltaTime > 1000) deltaTime = 1000;
    this.elapsedFrames = (deltaTime * 60) / 1000;
    this.lastDrawnAt = this.drawingAt;
  }
}
