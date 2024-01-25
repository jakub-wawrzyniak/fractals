export class Ticker {
  private lastDrawnAt = 0;
  updateRequested = false;
  private startRendering: () => void;
  running = false;
  elapsedFrames = 0;
  frameTimestamp = 0;

  constructor(onStart: () => void) {
    this.startRendering = onStart;
  }

  tick() {
    this.running = true;
    this.updateRequested = false;

    this.frameTimestamp = performance.now();
    let deltaTime = this.frameTimestamp - this.lastDrawnAt;

    if (deltaTime < 0) deltaTime = 0;
    if (deltaTime > 1000) deltaTime = 1000;
    this.elapsedFrames = (deltaTime * 60) / 1000;
    this.lastDrawnAt = this.frameTimestamp;
  }

  canStop() {
    return !this.updateRequested;
  }

  stop() {
    console.assert(
      !this.updateRequested,
      "Render stopped, despite having updates to do"
    );
    this.running = false;
  }

  start() {
    this.updateRequested = true;
    if (this.running) return;
    this.running = true;
    this.startRendering();
  }
}
