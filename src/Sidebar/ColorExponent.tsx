import { Show } from "solid-js";
import { store } from "../store";
import { InputNumber } from "./InputNumber";

export const ColorExponent = () => {
  return (
    <Show when={store.coloring.get.method === "Exponential"}>
      <InputNumber
        format="float"
        step={0.1}
        label="Exponent"
        min={0.1}
        max={5}
        getNumber={() => store.coloring.get.exponent}
        setNumber={(update) => store.coloring.set("exponent", update)}
      />
    </Show>
  );
};
