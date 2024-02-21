import { HasChild } from "../shared";

const Number = (props: HasChild) => {
  return <span class="font-mono">{props.children}</span>;
};

export type InputRangeConfig = {
  min: number;
  max: number;
  step: number;
  unit?: string;
};

type InputNumberProps = InputRangeConfig & {
  number: () => number;
  onInput: (value: string) => void;
};

export const InputRange = (props: InputNumberProps) => {
  return (
    <>
      <input
        type="range"
        class="range range-primary range-xs"
        max={props.max}
        min={props.min}
        step={props.step}
        value={props.number()}
        onInput={(e) => props.onInput(e.target.value)}
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
    </>
  );
};
