import { HasChild } from "../shared";

// TODO: Unify component prop type names
type SectionProps = Partial<HasChild> & {
  title: string;
};
export const SectionHeader = (props: SectionProps) => {
  return (
    <header class="flex justify-between items-center gap-1">
      <h3 class="font-poppins font-regular text-left text-xl">{props.title}</h3>
      <div class="flex gap-1">{props.children}</div>
    </header>
  );
};
