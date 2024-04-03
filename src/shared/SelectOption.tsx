import { Arrow } from "./icons";
import { IconButton } from "./IconButton";

type SelectOptionProps<Option extends string> = {
  variants: { option: Option; name: string }[];
  setOption: (option: Option) => void;
};

export const SelectOption = <Option extends string>(
  props: SelectOptionProps<Option>
) => {
  return (
    <div class="dropdown dropdown-end">
      <IconButton>
        <Arrow class="group-focus:rotate-180" />
      </IconButton>
      <ul
        tabindex="0"
        class="dropdown-content z-[1] menu mt-1 shadow bg-base-300 rounded-box flex flex-col w-52"
      >
        {props.variants.map((variant) => (
          <li class="w-full">
            <button
              class="w-full p-2"
              onClick={() => {
                props.setOption(variant.option);
                (document.activeElement as HTMLButtonElement | null)?.blur();
              }}
            >
              <p class="font-poppins">{variant.name}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
