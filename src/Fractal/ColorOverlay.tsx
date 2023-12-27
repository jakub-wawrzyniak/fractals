import { store } from "../shared";

export const ColorOverlay = () => {
  return (
    <div class="test w-full h-full pointer-events-none absolute top-0 left-0 mix-blend-overlay">
      <div class="h-full" style={{ "background-color": store.fractal.color }} />
    </div>
  );
};
