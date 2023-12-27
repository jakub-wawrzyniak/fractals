import { store, setExportFragment, HasChild } from "../shared";
import { SizePicker } from "./SizePicker";

type ExportFragment = HasChild & { exportFragment: boolean };
const ButtonExportSource = (props: ExportFragment) => {
  return (
    <button
      class="btn btn-primary flex-1"
      onClick={() => setExportFragment(props.exportFragment)}
      classList={{
        "btn-outline": props.exportFragment !== store.exportFragment,
      }}
    >
      {props.children}
    </button>
  );
};

export const SidebarExportConfig = () => {
  return (
    <form
      class="grow flex flex-col gap-3 justify-end pb-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <h4 class="font-poppins font-regular text-xl text-center">
        Export your fractal
      </h4>
      <SizePicker />
      <div class="flex gap-1 items-center">
        <ButtonExportSource exportFragment={false}>
          the whole screen
        </ButtonExportSource>
        <span class="w-5 text-center text-sm opacity-80">or</span>
        <ButtonExportSource exportFragment={true}>
          custom fragment
        </ButtonExportSource>
      </div>
      <input
        type="submit"
        class="btn btn-primary w-full uppercase font-variant-caps-[small-caps]"
        value="Export"
      />
    </form>
  );
};
