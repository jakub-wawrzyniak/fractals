import { JSX } from "solid-js";

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export const IconButton = (props: Props) => (
  <button
    {...props}
    class={`btn btn-sm btn-square btn-neutral grid place-items-center mx-0 ${
      props.class ?? ""
    }`}
  >
    {props.children}
  </button>
);
