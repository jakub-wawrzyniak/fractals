import { Show } from "solid-js";
import { HasChild, HasClass, Minus, OnClick, Plus } from "../shared";

type InputNumberProps = HasClass & {
  label: string;
  getNumber: () => number;
  setNumber: (value: number) => void;
  step?: number;
};

const IconButton = (props: HasChild & OnClick & HasClass) => (
  <button
    class="btn btn-sm btn-neutral btn-square grid place-items-center mx-0"
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

export const InputNumber = (props: InputNumberProps) => {
  const changeBy = (step: number) => {
    const oldValue = props.getNumber();
    const newValue = step + oldValue;
    props.setNumber(newValue);
  };

  return (
    <label class={`form-control ${props.class ?? ""}`}>
      <div class="label py-1">
        <span class="label-text-alt text-center w-full">{props.label}</span>
      </div>
      <div class="box-border flex items-center input input-bordered border-base-content pr-1.5 gap-1">
        <Show when={props.step !== undefined}>
          <input
            type="number"
            value={props.getNumber()}
            onInput={(e) => props.setNumber(parseInt(e.target.value))}
            class="flex-1 no-spinner min-w-0"
          />
          {/* <div class="grid grid-cols-2 gap-1"> */}
          <IconButton onClick={() => changeBy(-props.step!)}>
            <Minus />
          </IconButton>
          <IconButton onClick={() => changeBy(props.step!)}>
            <Plus />
          </IconButton>
          {/* </div> */}
        </Show>
      </div>
    </label>
  );
};
