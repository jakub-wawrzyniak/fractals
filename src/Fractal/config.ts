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

type TileCache = {
  _data: CanvasRenderingContext2D | null;
};

export type OpenSeadragonTileSourcePrototype =
  OpenSeadragon.TileSourceOptions & {
    getTilePostData(level: number, x: number, y: number): OsdTileRequest;
    getRequestedTileSize(context: DownloadContext): Size;
    getTileBoundsInComplex(
      context: DownloadContext
    ): Omit<FractalFragment, "width_px" | "height_px">;
    downloadTileStart(context: DownloadContext): void;
    // TODO: downloadTileAbort(context: DownloadContext): void;
    createTileCache(cache: TileCache, data: CanvasRenderingContext2D): void;
    destroyTileCache(cache: TileCache): void;
    getTileCacheData(cache: TileCache): TileCache;
    // TODO: getTileCacheDataAsImage(cache: TileCache): HTMLImageElement;
    getTileCacheDataAsContext2D(cache: TileCache): CanvasRenderingContext2D;
    internalGetTileBounds(
      context: DownloadContext,
      isSource: boolean
    ): OpenSeadragon.Rect;
  };
