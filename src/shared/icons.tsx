import { HasChild, HasClass } from "./types";

const FeatherIcon = (props: HasClass & HasChild) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="20"
      width="20"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class ?? ""}
    >
      {props.children}
    </svg>
  );
};

export const Arrow = (props: HasClass) => (
  <FeatherIcon {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </FeatherIcon>
);

export const Cross = (props: HasClass) => (
  <FeatherIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </FeatherIcon>
);
