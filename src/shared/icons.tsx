import { HasChild, HasClass } from "./types";

type FeatherProps = HasClass &
  HasChild & {
    strokeWidth?: number;
  };
const FeatherIcon = (props: FeatherProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="20"
      width="20"
      fill="none"
      stroke="currentColor"
      class={props.class ?? ""}
      stroke-width={`${props.strokeWidth ?? 1.5}`}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {props.children}
    </svg>
  );
};

export const Arrow = (props: HasClass) => (
  <FeatherIcon {...props} strokeWidth={1.5}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </FeatherIcon>
);

export const Cross = (props: HasClass) => (
  <FeatherIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </FeatherIcon>
);
export const Alert = (props: HasClass) => (
  <FeatherIcon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </FeatherIcon>
);

export const Warning = (props: HasClass) => (
  <FeatherIcon {...props}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </FeatherIcon>
);

export const Help = (props: HasClass) => (
  <FeatherIcon {...props}>
    <path
      d="M 7.1269207,6.9806658 A 5.0203205,5.0203205 0 0 1 16.883077,8.654106 c 0,3.34688 -5.020321,5.02032 -5.020321,5.02032"
      id="path1"
    />
    <line
      x1="11.996632"
      y1="20.368187"
      x2="12.013367"
      y2="20.368187"
      id="line1"
    />
  </FeatherIcon>
);

export const Settings = (props: HasClass) => (
  <FeatherIcon {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </FeatherIcon>
);

export const Minus = (props: HasClass) => (
  <FeatherIcon {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </FeatherIcon>
);

export const Plus = (props: HasClass) => (
  <FeatherIcon {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </FeatherIcon>
);
