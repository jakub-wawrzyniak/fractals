type InputNumberProps = {
  getNumber: () => number;
  setNumber: (value: number) => void;
  label: string;
  min: number;
  max: number;
  unit?: string;
};

export const InputNumber = (props: InputNumberProps) => {
  return (
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">{props.label}</span>
      </div>
      <input
        type="range"
        class="range range-xs"
        max={props.max}
        min={props.min}
        step={0.01}
        value={props.getNumber()}
        onInput={(e) => props.setNumber(parseFloat(e.target.value))}
      />
      <div class="w-full flex justify-between text-xs mt-1">
        <span>
          {props.min.toFixed(2)} {props.unit ?? ""}
        </span>
        <span>0</span>
        <span>
          {props.max.toFixed(2)} {props.unit ?? ""}
        </span>
      </div>
    </label>
  );
};
