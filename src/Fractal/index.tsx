import { SelectFractalPart } from "./SelectFractalPart.jsx";
import { ColorOverlay } from "./ColorOverlay.jsx";
import { FractalViewer } from "./FractalViewer.jsx";

export const Fractal = () => {
  return (
    <main class="grow relative bg-base-300">
      <FractalViewer />
      {/* <ColorOverlay /> */}
      {/* <SelectFractalPart /> */}
    </main>
  );
};
