import { COLORING_METHODS, SelectOption } from "../shared";
import { store } from "../store";
import { SectionHeader } from "./SectionHeader";

export const ColorSectionHeader = () => {
  return (
    <SectionHeader title="Coloring">
      <SelectOption
        setOption={(method) => store.coloring.set("method", method)}
        variants={COLORING_METHODS.map((method) => ({
          name: method,
          option: method,
        }))}
      />
    </SectionHeader>
  );
};
