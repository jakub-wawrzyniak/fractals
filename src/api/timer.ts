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
