export class Task {
  private action: () => void;
  private runAfterMs: number;
  private timer: null | number = null;

  constructor(action: () => void, doAfterMs: number) {
    this.action = action;
    this.runAfterMs = doAfterMs;
  }

  schedule() {
    if (this.timer !== null) return;
    this.timer = setTimeout(this.action, this.runAfterMs);
  }

  cancel() {
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
  }
}
