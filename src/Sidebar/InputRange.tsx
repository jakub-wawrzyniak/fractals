import { HasChild } from "../shared";
import { InputNumber } from "./InputNumber";

const Number = (props: HasChild) => {
  return <span class="font-mono">{props.children}</span>;
};

type InputNumberProps = {
  getNumber: () => number;
  setNumber: (value: number) => void;
  label: string;
  min: number;
  max: number;
  unit?: string;
  class?: string;
};

export const InputRange = (props: InputNumberProps) => {
  const step = 0.0005;

  return (
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">{props.label}</span>
      </div>
      <InputNumber {...props} step={step} label="" class="mb-2 text-left" />
      <input
        type="range"
        class={`range range-xs ${props.class ?? ""}`}
        max={props.max}
        min={props.min}
        step={step}
        value={props.getNumber()}
        onInput={(e) => props.setNumber(parseFloat(e.target.value))}
      />
      <div class="w-full flex justify-between text-s mt-1">
        <Number>
          {props.min.toFixed(2)}
          {props.unit ?? ""}
        </Number>
        <Number>
          {props.max.toFixed(2)}
          {props.unit ?? ""}
        </Number>
      </div>
    </label>
  );
};
