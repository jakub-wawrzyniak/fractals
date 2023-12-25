import { Number } from "../shared";

type InputNumberProps = {
  getNumber: () => number;
  setNumber: (value: number) => void;
  label: string;
  min: number;
  max: number;
  unit?: string;
  class?: string;
};

export const InputNumber = (props: InputNumberProps) => {
  return (
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">{props.label}</span>
      </div>
      <input
        type="range"
        class={`range range-xs ${props.class ?? ""}`}
        max={props.max}
        min={props.min}
        step={0.001}
        value={props.getNumber()}
        onInput={(e) => props.setNumber(parseFloat(e.target.value))}
      />
      <div class="w-full flex justify-between text-s mt-1">
        <Number>
          {props.min.toFixed(2)}
          {props.unit ?? ""}
        </Number>
        <Number>0</Number>
        <Number>
          {props.max.toFixed(2)}
          {props.unit ?? ""}
        </Number>
      </div>
    </label>
  );
};
