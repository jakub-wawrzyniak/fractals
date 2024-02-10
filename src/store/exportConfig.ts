import { AppStore, __setStore, __store } from "./store";
import { viewer } from "./viewer";

const getExportAspectRatio = () => {
  const exportScreen = __store.export.source === "screen";
  if (exportScreen) return viewer.getAspectRatio();
  const { abs } = Math;
  const { end, start } = __store.export.selection;
  const width = abs(end.x - start.x);
  const height = abs(end.y - start.y) / viewer.getAspectRatio();
  return width / height;
};

const getHeight = () => {
  return Math.floor(__store.export.width / getExportAspectRatio());
};

type DirectSetters = "status" | "progress" | "filepath" | "width" | "source";
const setExport = <Key extends DirectSetters>(
  key: Key,
  value: AppStore["export"][Key]
) => {
  __setStore("export", key, value);
};

type SelectionKeys = "start" | "end" | "isSelecting";
const setSelection = <Key extends SelectionKeys>(
  key: Key,
  value: AppStore["export"]["selection"][Key]
) => {
  __setStore("export", "selection", key, value);
};

const setHeight = (height: number) => {
  __setStore("export", "width", Math.floor(height * getExportAspectRatio()));
};

export const exportConfig = {
  get: __store.export,
  getHeight,
  set: setExport,
  setHeight,
  setSelection,
};
