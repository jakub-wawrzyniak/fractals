import { dialog, invoke } from "@tauri-apps/api";
import { viewportToComplex } from "../Fractal/utils";
import { store } from "../store";
import { ExportFractalRequest } from "./types";
import { getFractalConfig } from "./utils";
import { Bounds } from "../Fractal/state";

const state = store.exportConfig;

const getDefaultSaveDir = async () => {
  let path = await invoke<null | string>("get_default_save_dir");
  return path ?? undefined;
};

const getViewportSelection = (): Bounds => {
  if (state.get.source === "screen")
    return {
      left: 0,
      top: 0,
      right: 1,
      bottom: 1,
    };

  const { start, end } = state.get.selection;
  const { max, min } = Math;
  return {
    left: min(start.x, end.x),
    top: min(start.y, end.y),
    right: max(start.x, end.x),
    bottom: max(start.y, end.y),
  };
};

export const onExportRequest = async () => {
  state.set("status", "pickingFilePath");
  const screen = store.viewer.get;
  const viewportSelection = getViewportSelection();
  const topLeft = viewportToComplex(
    {
      x: screen.width * viewportSelection.left,
      y: screen.height * viewportSelection.top,
    },
    screen
  );
  const bottomRight = viewportToComplex(
    {
      x: screen.width * viewportSelection.right,
      y: screen.height * viewportSelection.bottom,
    },
    screen
  );

  const filepath = await dialog.save({
    defaultPath: state.get.filepath || (await getDefaultSaveDir()),
    title: "Save your fractal",
    filters: [
      {
        name: store.fractal.get.variant,
        extensions: ["png", "jpeg"],
      },
    ],
  });

  if (filepath == null) {
    state.set("status", "idle");
    return;
  }

  const request: ExportFractalRequest = {
    ...getFractalConfig(),
    fragment: {
      height_px: state.getHeight(),
      width_px: state.get.width,
      top_left: topLeft,
      bottom_right: bottomRight,
    },
    filepath,
  };

  state.set("status", "exporting");
  type Result = "ErrorUnknown" | "ErrorBadFileType" | "Done";
  const result = await invoke<Result>("export_image", { request });
  const resultToStatus: Record<Result, typeof state.get.status> = {
    Done: "done",
    ErrorBadFileType: "errorBadFileType",
    ErrorUnknown: "errorUnknown",
  };
  const status = resultToStatus[result];
  state.set("status", status);
};
