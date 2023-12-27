import { setUserColor, store } from "../shared";

export const ColorPicker = () => {
  return (
    <label class="form-control w-full cursor-pointer flex-1">
      <div class="btn btn-outline grow-[3]">
        Pick a color
        <div
          class="h-4 w-4 rounded-full"
          style={{ "background-color": store.userColor }}
        />
      </div>
      <input
        type="color"
        class="absolute right-96 invisible -z-10"
        value={store.userColor}
        onInput={(e) => setUserColor(e.target.value)}
      />
    </label>
  );
};
