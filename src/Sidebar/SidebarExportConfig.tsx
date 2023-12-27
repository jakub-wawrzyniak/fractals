import { createSignal } from "solid-js";
import { Cross, store, setExportFragment } from "../shared";

type InputNumberProps = {
  label: string;
  value: () => number;
  setValue: (value: number) => void;
};

const InputNumber = (props: InputNumberProps) => {
  return (
    <label class="form-control flex-1">
      <div class="label py-1">
        <span class="label-text-alt text-center w-full">{props.label}</span>
      </div>
      <input
        type="number"
        value={props.value()}
        onInput={(e) => props.setValue(parseInt(e.target.value))}
        class="input input-bordered border-base-content w-full max-w-xs no-spinner text-center"
      />
    </label>
  );
};

export const SidebarExportConfig = () => {
  const [width, setWidth] = createSignal(3000);
  const pickedAspectRatio = () => {
    if (!store.exportFragment) return store.fractalAspectRatio;
    const { abs } = Math;
    const { end, start } = store.fractalFragmentSelection;
    const width = abs(end.x - start.x);
    const height = abs(end.y - start.y);
    return width / height;
  };

  const height = () => {
    return Math.floor(width() / pickedAspectRatio());
  };
  const setHeight = (value: number) => {
    setWidth(value * pickedAspectRatio());
  };

  return (
    <form
      class="grow flex flex-col gap-3 justify-end pb-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <h4 class="font-poppins font-regular text-xl text-center">
        Export your fractal
      </h4>
      <div class="flex w-full gap-1 items-end">
        <InputNumber label="image width" value={width} setValue={setWidth} />
        <Cross class="my-3.5 stroke-base-content" />
        <InputNumber label="image height" value={height} setValue={setHeight} />
      </div>
      <div class="flex gap-1 items-center">
        <button
          class="btn btn-outline btn-neutral flex-1"
          onClick={() => setExportFragment(false)}
          classList={{ "btn-active": !store.exportFragment }}
        >
          the whole screen
        </button>
        <span class="w-5 text-center text-sm opacity-80">or</span>
        <button
          class="btn btn-outline btn-neutral flex-1"
          onClick={() => setExportFragment(true)}
          classList={{ "btn-active": store.exportFragment }}
        >
          custom fragment
        </button>
      </div>
      <input
        type="submit"
        class="btn btn-secondary w-full uppercase font-variant-caps-[small-caps]"
        value="Export"
      />
    </form>
  );
};
