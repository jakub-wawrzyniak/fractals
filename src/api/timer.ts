let newId = 0;
const createId = () => {
  newId++;
  return newId;
};

class RunningAverage {
  nums: number[] = [];
  add(value: number) {
    this.nums.push(value);
    const reportAt = 30;
    if (this.nums.length === reportAt) {
      const sum = this.nums.reduce((acc, val) => acc + val, 0);
      console.log(sum / reportAt);
      this.nums = [];
    }
  }
}

const aggregator = new RunningAverage();

export class Timer {
  id: number;
  started: number;
  constructor() {
    this.id = createId();
    this.started = Date.now();
  }

  done() {
    const ended = Date.now();
    const elapsed = ended - this.started;
    aggregator.add(elapsed);
  }
}
