import { Show } from "solid-js";
import { Minus, Plus } from "../shared";
import { InputRange, InputRangeConfig } from "./InputRange";

type RangeConfig =
  | ({
      withRangeSlider?: false;
    } & Partial<InputRangeConfig>)
  | ({
      withRangeSlider: true;
    } & InputRangeConfig);

type InputNumberProps = RangeConfig & {
  label: string;
  getNumber: () => number;
  setNumber: (value: number) => void;
  format: "int" | "float";
  unit?: string;
  help?: {
    header: string;
    description: string;
  };
};

export const InputNumber = (props: InputNumberProps) => {
  const parseNum = (value: string) => {
    const parser = props.format === "int" ? parseInt : parseFloat;
    const parsed = parser(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const clipToBounds = (got: number) => {
    const { min, max } = props;
    if (max !== undefined && max < got) return max;
    if (min !== undefined && min > got) return min;
    return got;
  };

  const changeBy = (step: number) => {
    const oldValue = props.getNumber();
    const newValue = step + oldValue;
    const checked = clipToBounds(newValue);
    props.setNumber(checked);
  };

  const onInput = (value: string) => {
    const parsed = parseNum(value);
    if (typeof parsed !== "number" || isNaN(parsed)) throw "not a num";
    const checked = clipToBounds(parsed);
    props.setNumber(checked);
  };

  const stepButtonClass =
    "btn btn-sm btn-neutral btn-square grid place-items-center mx-0";
  return (
    <label class={`form-control min-w-0 w-full`}>
      <div class="label py-1">
        <span class="label-text">{props.label}</span>
        <Show when={props.help !== undefined}>
          <span class="tooltip tooltip-left" data-tip={props.help?.description}>
            <span class="label-text-alt">{props.help?.header}</span>
          </span>
        </Show>
      </div>
      <div class="box-border flex items-center input input-bordered border-base-content pr-1.5 gap-1 mb-2">
        <input
          type="number"
          class="flex-1 no-spinner min-w-0"
          min={props.min}
          max={props.max}
          value={props.getNumber()}
          onInput={(e) => onInput(e.target.value)}
        />
        <Show when={props.step !== undefined}>
          <button
            class={stepButtonClass}
            disabled={props.getNumber() === props.min}
            onClick={() => changeBy(-props.step!)}
          >
            <Minus />
          </button>
          <button
            class={stepButtonClass}
            disabled={props.getNumber() === props.max}
            onClick={() => changeBy(props.step!)}
          >
            <Plus />
          </button>
        </Show>
      </div>

      <Show when={props.withRangeSlider}>
        <InputRange
          {...(props as InputRangeConfig)}
          number={props.getNumber}
          onInput={onInput}
        />
      </Show>
    </label>
  );
};
