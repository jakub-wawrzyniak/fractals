import { Show } from "solid-js";
import { onExportRequest } from "../api";
import { store, setExportSource, HasChild } from "../shared";
import { ExportSizePicker } from "./ExportSizePicker";

const userFeedback: Record<typeof store.export.status, string> = {
  done: "Export finished",
  errorBadFileType: "Error: bad file type",
  errorUnknown: "Unknown error :(",
  exporting: "Exporting",
  idle: "Export",
  pickingFilePath: "Waiting for filepath",
};

type ExportSource = HasChild & { exportFrom: "screen" | "selection" };
const ButtonExportSource = (props: ExportSource) => {
  return (
    <button
      class="btn btn-primary flex-1"
      onClick={() => setExportSource(props.exportFrom)}
      classList={{
        "btn-outline": props.exportFrom !== store.export.source,
      }}
    >
      {props.children}
    </button>
  );
};

export const ExportConfig = () => {
  const status = () => store.export.status;
  const waiting = () => {
    return status() === "exporting" || status() === "pickingFilePath";
  };
  return (
    <form
      class="grow flex flex-col gap-3 justify-end pb-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <h4 class="font-poppins font-regular text-xl text-center">
        Export your fractal
      </h4>
      <ExportSizePicker />
      <div class="flex gap-1 items-center">
        <ButtonExportSource exportFrom="screen">
          the whole screen
        </ButtonExportSource>
        <span class="w-5 text-center text-sm opacity-80">or</span>
        <ButtonExportSource exportFrom="selection">
          custom fragment
        </ButtonExportSource>
      </div>
      <button
        class="btn btn-primary w-full uppercase font-variant-caps-[small-caps] flex gap-1 justify-center items-center"
        onClick={onExportRequest}
        disabled={waiting()}
      >
        {userFeedback[status()]}
        <Show when={waiting()}>
          <span class="loading loading-dots loading-sm"></span>
        </Show>
      </button>
    </form>
  );
};
