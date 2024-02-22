import { store } from "../store";

export const AntiAliasing = () => {
  return (
    <div class="form-control">
      <label class="label cursor-pointer px-0">
        <span class="label-text">Anti aliasing</span>
        <input
          type="checkbox"
          class="toggle"
          checked={store.coloring.get.antialiasing}
          onChange={(value) =>
            store.coloring.set("antialiasing", value.target.checked)
          }
        />
      </label>
    </div>
  );
};

export const ColoringMethod = () => {
  return (
    <div class="flex justify-between align-center py-2">
      <span class="label-text">Method:</span>
      <span class="label-text">{store.coloring.get.method}</span>
    </div>
  );
};
