import { Cross } from "../shared";
import { store } from "../store";
import { InputNumber } from "./InputNumber";

export const ExportSizePicker = () => {
  return (
    <div class="flex w-full gap-1 items-end">
      <InputNumber
        label="image width"
        getNumber={() => store.exportConfig.get.width}
        setNumber={(num) => store.exportConfig.set("width", num)}
        class="flex-1"
      />
      <Cross class="my-3.5 stroke-base-content" />
      <InputNumber
        label="image height"
        getNumber={() => store.exportConfig.getHeight()}
        setNumber={(num) => store.exportConfig.setHeight(num)}
        class="flex-1"
      />
    </div>
  );
};
