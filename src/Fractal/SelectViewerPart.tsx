import OpenSeadragon from "openseadragon";
import { createEffect } from "solid-js";
import { store } from "../shared";
import { fractalViewer } from "./viewer";

type Props = {
  viewerMounted: () => boolean;
};

/** This component doesn't render directly, but via OpenSeadragon.
 * But it still renders UI, to it is a component (i think)
 */
export const SelectFractalPart = (props: Props) => {
  const overlayClasses =
    "w-full h-full bg-white opacity-5 pointer-events-none bg-blend-screen";
  const onDrag = (event: OpenSeadragon.CanvasDragEvent) => {
    console.log(event.position);
  };

  let selection = new OpenSeadragon.Rect(0, 0, 0, 0);
  createEffect((cleanup) => {
    const isSelecting = store.fractalFragmentSelection.isSelecting;
    if (!props.viewerMounted() || !isSelecting) {
      if (fractalViewer === null) return;
      if (typeof cleanup === "function") cleanup();
      return;
    }

    if (fractalViewer === null) throw "Fractal should be mounted, but isn't";

    fractalViewer.setMouseNavEnabled(false);
    fractalViewer.addOverlay(
      overlayClasses,
      selection,
      OpenSeadragon.Placement.TOP_LEFT
    );
    fractalViewer.addHandler("canvas-drag", onDrag);
    return () => {
      if (fractalViewer === null) return;
      fractalViewer.setMouseNavEnabled(true);
      fractalViewer.removeOverlay(overlayClasses);
      fractalViewer.removeHandler("canvas-drag", onDrag);
    };
  });

  return <></>;
};
