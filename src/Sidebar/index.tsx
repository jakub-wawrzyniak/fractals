import { ColorSection } from "./ColorSection";
import { ExportSection } from "./ExportSection";
import { FractalSection } from "./FractalSection";

export const Sidebar = () => {
  return (
    <aside class="w-[400px] p-6 flex flex-col gap-2">
      <FractalSection />
      <ColorSection />
      <ExportSection />
    </aside>
  );
};
