import { store } from "../store";

export const ColorPicker = () => {
  return (
    <label class="form-control w-full cursor-pointer flex-1">
      <div class="btn btn-outline grow-[3]">
        Pick a color
        <div
          class="h-4 w-4 rounded-full"
          style={{ "background-color": store.coloring.get.color }}
        />
      </div>
      <input
        type="color"
        class="absolute right-96 invisible -z-10"
        value={store.coloring.get.color}
        onInput={(e) => store.coloring.set("color", e.target.value)}
      />
    </label>
  );
};
