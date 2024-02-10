class RunningAverage {
  nums: number[] = [];
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  add(value: number) {
    this.nums.push(value);
    const reportAt = 30;
    if (this.nums.length === reportAt) {
      const sum = this.nums.reduce((acc, val) => acc + val, 0);
      const avg = (sum / reportAt).toFixed(2);
      const message = `${this.name}: ${avg}ms`;
      console.log(message);
      this.nums = [];
    }
  }
}

export class Timer {
  started: number;
  tracker: RunningAverage;
  static trackers = new Map<string, RunningAverage>();
  constructor(name: string) {
    let tracker = Timer.trackers.get(name);
    if (tracker === undefined) {
      const newTracker = new RunningAverage(name);
      Timer.trackers.set(name, newTracker);
      tracker = newTracker;
    }
    this.tracker = tracker;
    this.started = Date.now();
  }

  done() {
    const ended = Date.now();
    const elapsed = ended - this.started;
    this.tracker.add(elapsed);
  }
}

export class Counter {
  private static map = new Map<string, Counter>();
  private counter: number = 0;
  private resetAt = performance.now();

  constructor(name: string, reportEveryMs: number) {
    if (Counter.map.has(name)) return;
    Counter.map.set(name, this);
    setInterval(() => {
      const now = performance.now();
      const count = this.counter;
      const elapsed = now - this.resetAt;
      const countPerSec = (count * 1000) / elapsed;
      if (countPerSec >= 1) {
        console.log(`${name}: ${countPerSec.toFixed(0)} / sec`);
      }
      this.counter = 0;
      this.resetAt = now;
    }, reportEveryMs);
  }

  addOne() {
    this.counter += 1;
  }
}
