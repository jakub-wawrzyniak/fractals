import { SelectFractalPart } from "./SelectFractalPart.jsx";
import { FractalViewer } from "./FractalViewer.jsx";

export const Fractal = () => {
  return (
    <main class="grow relative bg-base-300">
      <FractalViewer />
      <SelectFractalPart />
    </main>
  );
};
