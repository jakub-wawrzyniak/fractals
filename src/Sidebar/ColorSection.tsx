import { ColorSectionHeader } from "./ColorSectionHeader";
import { AntiAliasing, ColoringMethod } from "./ColorInline";
import { ColorPicker } from "./ColorPicker";
import { ColorBrightness } from "./ColorBrightness";
import { ColorExponent } from "./ColorExponent";

export const ColorSection = () => {
  return (
    <div class="mt-6">
      <ColorSectionHeader />
      <ColoringMethod />
      <ColorExponent />
      <ColorBrightness />
      <AntiAliasing />
      <ColorPicker />
    </div>
  );
};
