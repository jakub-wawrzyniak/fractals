import { HasChild } from "./types";

export const Header = (props: HasChild) => {
  return (
    <h3 class="font-poppins font-regular text-center text-2xl">
      {props.children}
    </h3>
  );
};

export const Equasion = (props: HasChild) => {
  return <p class="font-mono text-center text-lg">{props.children}</p>;
};

export const Number = (props: HasChild) => {
  return <span class="font-mono">{props.children}</span>;
};

// export const TextButton = {};
