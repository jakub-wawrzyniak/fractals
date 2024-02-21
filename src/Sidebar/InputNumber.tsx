import { Show } from "solid-js";
import { HasClass, Minus, Plus } from "../shared";

type InputNumberProps = HasClass & {
  label: string;
  getNumber: () => number;
  setNumber: (value: number) => void;
  format: "int" | "float";
  step?: number;
  min?: number;
  max?: number;
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

  type HasTarget = { target: HTMLInputElement };
  const onInput = (event: HasTarget) => {
    const parsed = parseNum(event.target.value);
    if (typeof parsed !== "number" || isNaN(parsed)) throw "not a num";
    const checked = clipToBounds(parsed);
    props.setNumber(checked);
  };

  const stepButtonClass =
    "btn btn-sm btn-neutral btn-square grid place-items-center mx-0";
  return (
    <label class={`form-control min-w-0 w-full ${props.class ?? ""}`}>
      <div class="label py-1">
        <span class="label-text">{props.label}</span>
        <Show when={props.help !== undefined}>
          <span class="tooltip tooltip-left" data-tip={props.help?.description}>
            <span class="label-text-alt">{props.help?.header}</span>
          </span>
        </Show>
      </div>
      <div class="box-border flex items-center input input-bordered border-base-content pr-1.5 gap-1">
        <input
          type="number"
          value={props.getNumber()}
          onInput={onInput}
          min={props.min}
          max={props.max}
          class="flex-1 no-spinner min-w-0"
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
    </label>
  );
};
