export class Ticker {
  private readonly startRendering: () => void;
  private updateRequested = false;
  private running = false;
  private lastDrawnAt = 0;
  drawingAt = 0;
  sincePreviousFrame = 0;

  constructor(onStart: () => void) {
    this.startRendering = onStart;
  }

  tick() {
    this.updateRequested = false;
    this.drawingAt = performance.now();
    this.sincePreviousFrame = this.drawingAt - this.lastDrawnAt;
    this.lastDrawnAt = this.drawingAt;
  }

  canStop() {
    return !this.updateRequested;
  }

  stop() {
    this.running = false;
  }

  start() {
    this.updateRequested = true;
    if (this.running) return;
    this.running = true;
    this.lastDrawnAt = performance.now() - 16;
    // ^Pretend the last frame finished 16ms ago.
    //  Prevents sudden animation jumps.
    this.startRendering();
  }
}
