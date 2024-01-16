import { dialog, invoke } from "@tauri-apps/api";
import { pointToComplex } from "../Fractal/utils";
import { fractalViewer } from "../Fractal/viewer";
import { exportHeight, setExportStatus, store } from "../shared";
import { ExportFractalRequest } from "./types";
import { getFractalConfig } from "./utils";

const getDefaultSaveDir = async () => {
  let path = await invoke<null | string>("get_default_save_dir");
  return path ?? undefined;
};

const getViewportSelection = () => {
  if (store.export.source === "screen")
    return {
      left: 0,
      top: 0,
      right: 1,
      bottom: 1,
    };

  const { start, end } = store.export.selection;
  const { max, min } = Math;
  return {
    left: min(start.x, end.x),
    top: min(start.y, end.y),
    right: max(start.x, end.x),
    bottom: max(start.y, end.y),
  };
};

export const onExportRequest = async () => {
  if (fractalViewer === null) {
    setExportStatus("errorUnknown")
    return;
  }
  setExportStatus("pickingFilePath");
  const bounds = fractalViewer.viewport.getBounds();
  const viewportSelection = getViewportSelection();
  const topLeft = pointToComplex({
    x: bounds.x + bounds.width * viewportSelection.left,
    y: bounds.y + bounds.height * viewportSelection.top,
  });
  const bottomRight = pointToComplex({
    x: bounds.x + bounds.width * viewportSelection.right,
    y: bounds.y + bounds.height * viewportSelection.bottom,
  });

  const filepath = await dialog.save({
    defaultPath: store.export.filepath || (await getDefaultSaveDir()),
    title: "Save your fractal",
    filters: [
      {
        name: store.fractal.variant,
        extensions: ["png", "jpeg"],
      },
    ],
  });

  if (filepath == null) {
    setExportStatus("idle");
    return;
  }

  const request: ExportFractalRequest = {
    fractal: getFractalConfig(),
    fragment: {
      height_px: exportHeight(),
      width_px: store.export.width,
      top_left: topLeft,
      bottom_right: bottomRight,
    },
    color: store.fractal.color,
    filepath,
  };

  setExportStatus("exporting");
  type Result = "ErrorUnknown" | "ErrorBadFileType" | "Done";
  const result = await invoke<Result>("export_image", { request });
  const resultToStatus: Record<Result, typeof store.export.status> = {
    Done: "done",
    ErrorBadFileType: "errorBadFileType",
    ErrorUnknown: "errorUnknown",
  };
  const status = resultToStatus[result];
  setExportStatus(status);
};
