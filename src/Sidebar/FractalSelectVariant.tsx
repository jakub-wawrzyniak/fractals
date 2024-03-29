import { FRACTAL_CONFIG, FRACTALS } from "../shared";
import { Arrow } from "../shared/icons";
import { store } from "../store";

export const FractalSelectVariant = () => {
  return (
    <div class="dropdown dropdown-bottom w-full">
      <button class="btn btn-ghost w-full flex gap-2 justify-center items-center p-2 group relative font-normal">
        <h3 class="font-poppins font-regular text-center text-2xl">
          {store.fractal.getConfig().name}
        </h3>
        <Arrow class="absolute right-2 top-1/2 -translate-y-1/2 transition-transform group-focus:rotate-180" />
      </button>
      <ul
        tabindex="0"
        class="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-full flex flex-col gap-2"
      >
        {FRACTALS.map((variant) => (
          <li class="w-full">
            <button
              class="w-full p-2"
              onClick={() => {
                store.fractal.changeFractalVariant(variant);
                (document.activeElement as HTMLButtonElement | null)?.blur();
              }}
            >
              <p class="font-poppins text-center w-full">
                {FRACTAL_CONFIG[variant].name}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
