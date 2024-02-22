import { FRACTAL_CONFIG, FRACTALS, IconButton, SelectOption } from "../shared";
import { Help, Settings } from "../shared/icons";
import { store } from "../store";
import { SectionHeader } from "./SectionHeader";

export const FractalSectionHeader = () => {
  return (
    <SectionHeader title={store.fractal.getConfig().name}>
      <SelectOption
        setOption={(option) => store.fractal.changeFractalVariant(option)}
        variants={FRACTALS.map((option) => ({
          option,
          name: FRACTAL_CONFIG[option].name,
        }))}
      />
      <IconButton>
        <Help />
      </IconButton>
      <IconButton>
        <Settings />
      </IconButton>
    </SectionHeader>
  );
};
