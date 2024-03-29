import { store } from "../store";
import { InputNumber } from "./InputNumber";

export const ColorBrightness = () => {
  return (
    <InputNumber
      label="Brightness"
      format="float"
      min={0}
      max={5}
      step={0.1}
      getNumber={() => store.coloring.get.brightness}
      setNumber={(update) => store.coloring.set("brightness", update)}
    />
  );
};
