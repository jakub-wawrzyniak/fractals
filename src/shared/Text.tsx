import { HasChild } from "./types";

export const Header = (props: HasChild) => {
  return (
    <h2 class="font-poppins font-regular text-center text-[26px] pb-3">
      {props.children}
    </h2>
  );
};

export const Equasion = (props: HasChild) => {
  return <p class="font-mono text-center text-lg">{props.children}</p>;
};

export const Number = (props: HasChild) => {
  return <span class="font-mono">{props.children}</span>;
};
