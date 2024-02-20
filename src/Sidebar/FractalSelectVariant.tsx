import { FRACTAL_CONFIG, FRACTALS, HasChild } from "../shared";
import { Arrow, Help, Settings } from "../shared/icons";
import { store } from "../store";

const IconButton = (props: HasChild) => (
  <button class="btn btn-sm btn-square btn-neutral grid place-items-center">
    {props.children}
  </button>
);

export const FractalSelectVariant = () => {
  return (
    <header class="flex justify-between items-center gap-1">
      <h3 class="font-poppins font-regular text-left text-xl">
        {store.fractal.getConfig().name}
      </h3>
      <div class="flex gap-2">
        <div class="dropdown dropdown-end">
          <IconButton>
            <Arrow class="group-focus:rotate-180" />
          </IconButton>
          <ul
            tabindex="0"
            class="dropdown-content z-[1] menu p-1 shadow bg-base-300 rounded-box flex flex-col gap-1 min-w-52"
          >
            {FRACTALS.map((variant) => (
              <li class="w-full">
                <button
                  class="w-full p-2"
                  onClick={() => {
                    store.fractal.changeFractalVariant(variant);
                    (
                      document.activeElement as HTMLButtonElement | null
                    )?.blur();
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
        <IconButton>
          <Help />
        </IconButton>
        <IconButton>
          <Settings />
        </IconButton>
      </div>
    </header>
  );
};
