import OpenSeadragon from "openseadragon";
import { Size } from "../shared";
import { FractalFragment } from "../api";

export const VIEWER_OPTIONS = {
  id: "fractal",
  prefixUrl: "",
  wrapHorizontal: false,
  visibilityRatio: 1,
  minZoomLevel: 1,
  timeout: 10_000,
  imageLoaderLimit: 24,
  showFullPageControl: false,
  showZoomControl: false,
  showHomeControl: false,
  showNavigator: false,
} as const satisfies OpenSeadragon.Options;

export type OsdTileRequest = {
  level: number;
  x: number;
  y: number;
};

export type DownloadContext = {
  postData: OsdTileRequest;
  finish(ctx: CanvasRenderingContext2D): void;
};

export type OpenSeadragonTileSourcePrototype =
  OpenSeadragon.TileSourceOptions & {
    getTilePostData(level: number, x: number, y: number): OsdTileRequest;
    getRequestedTileSize(context: DownloadContext): Size;
    getTileBoundsInComplex(
      context: DownloadContext
    ): Omit<FractalFragment, "width_px" | "height_px">;
    downloadTileStart(context: DownloadContext): void;
    internalGetTileBounds(
      context: DownloadContext,
      isSource: boolean
    ): OpenSeadragon.Rect;
  };
