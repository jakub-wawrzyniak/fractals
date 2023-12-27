import {
  Cross,
  exportHeight,
  setExportHeight,
  setExportWidth,
  store,
} from "../shared";
import { InputNumber } from "./InputNumber";

export const ExportSizePicker = () => {
  return (
    <div class="flex w-full gap-1 items-end">
      <InputNumber
        label="image width"
        getNumber={() => store.export.width}
        setNumber={setExportWidth}
        class="flex-1"
      />
      <Cross class="my-3.5 stroke-base-content" />
      <InputNumber
        label="image height"
        getNumber={exportHeight}
        setNumber={setExportHeight}
        class="flex-1"
      />
    </div>
  );
};
