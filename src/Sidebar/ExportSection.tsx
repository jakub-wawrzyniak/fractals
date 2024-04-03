import { Show } from "solid-js";
import { onExportRequest } from "../api";
import { HasChild } from "../shared";
import { AppStore, store } from "../store";
import { SectionHeader } from "./SectionHeader";

type Status = AppStore["export"]["status"];
const userFeedback: Record<Status, string> = {
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
      onClick={() => store.exportConfig.set("source", props.exportFrom)}
      classList={{
        "btn-outline": props.exportFrom !== store.exportConfig.get.source,
      }}
    >
      {props.children}
    </button>
  );
};

export const ExportSection = () => {
  const status = () => store.exportConfig.get.status;
  const waiting = () => {
    return status() === "exporting" || status() === "pickingFilePath";
  };
  return (
    <form
      class="grow flex flex-col gap-3 justify-end"
      onSubmit={(e) => e.preventDefault()}
    >
      <SectionHeader title="Export your fractal" />
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
