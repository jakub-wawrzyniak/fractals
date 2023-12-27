import { HasClass } from "../shared";

type InputNumberProps = HasClass & {
  label: string;
  getNumber: () => number;
  setNumber: (value: number) => void;
};

export const InputNumber = (props: InputNumberProps) => {
  return (
    <label class={`form-control ${props.class ?? ""}`}>
      <div class="label py-1">
        <span class="label-text-alt text-center w-full">{props.label}</span>
      </div>
      <input
        type="number"
        value={props.getNumber()}
        onInput={(e) => props.setNumber(parseInt(e.target.value))}
        class="input input-bordered border-base-content w-full max-w-xs no-spinner text-center"
      />
    </label>
  );
};
