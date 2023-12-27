import { SidebarFractalConfig } from "./SidebarFractalConfig";
import { SidebarExportConfig } from "./SidebarExportConfig";

export const Sidebar = () => {
  return (
    <aside class="w-[20vw] min-w-[350px] px-6 py-8 flex flex-col gap-2">
      <SidebarFractalConfig />
      <SidebarExportConfig />
    </aside>
  );
};
