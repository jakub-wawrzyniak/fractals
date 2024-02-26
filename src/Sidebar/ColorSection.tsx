import { ColorSectionHeader } from "./ColorSectionHeader";
import { AntiAliasing, ColoringMethod } from "./ColorInline";
import { ColorPicker } from "./ColorPicker";

export const ColorSection = () => {
  return (
    <div class="mt-6">
      <ColorSectionHeader />
      <ColoringMethod />
      <AntiAliasing />
      <ColorPicker />
    </div>
  );
};
