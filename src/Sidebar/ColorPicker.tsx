import { store } from "../store";

type ButtonProps = {
  label: string;
  color: string;
  setColor: (value: string) => void;
  disabled?: boolean;
};
const ColorPickerButton = (props: ButtonProps) => {
  return (
    <label class="form-control cursor-pointer flex-1">
      <div class="btn btn-outline grow-[3]">
        {props.label}
        <div
          class="h-4 w-4 rounded-full"
          style={{ "background-color": props.color }}
        />
      </div>
      <input
        type="color"
        class="absolute right-96 invisible -z-10"
        value={props.color}
        onInput={(e) => props.setColor(e.target.value)}
        disabled={props.disabled}
      />
    </label>
  );
};

export const ColorPicker = () => {
  return (
    <div>
      <div class="w-full flex gap-2 justify-between items-center">
        <ColorPickerButton
          label="Start"
          color={store.coloring.get.color.hex_start}
          setColor={(color) => store.coloring.setColor("hex_start", color)}
        />
        <ColorPickerButton
          label="End"
          color={store.coloring.get.color.hex_end}
          setColor={(color) => store.coloring.setColor("hex_end", color)}
        />
      </div>
    </div>
  );
};
