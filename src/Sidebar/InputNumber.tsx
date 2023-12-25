import { Number } from "../shared";

type InputNumberProps = {
  getNumber: () => number;
  setNumber: (value: number) => void;
  label: string;
  min: number;
  max: number;
  unit?: string;
};

const UNIT = 0.5;
export const InputNumber = (props: InputNumberProps) => {
  const max = () => Math.min(UNIT, props.max);
  const min = () => Math.max(-UNIT, props.min);
  return (
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">{props.label}</span>
      </div>
      <input
        type="range"
        class="range range-xs"
        max={max()}
        min={min()}
        step={0.00001}
        value={props.getNumber()}
        onInput={(e) => props.setNumber(parseFloat(e.target.value))}
      />
      <div class="w-full flex justify-between text-s mt-1">
        <Number>
          {min().toFixed(2)}
          {props.unit ?? ""}
        </Number>
        <Number>0</Number>
        <Number>
          {max().toFixed(2)}
          {props.unit ?? ""}
        </Number>
      </div>
    </label>
  );
};
