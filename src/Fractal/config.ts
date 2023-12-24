import OpenSeadragon from "openseadragon";
import { JuliaImageRequest } from "../api";
import { Size } from "../shared";

export const VIEWER_OPTIONS = {
  id: "fractal",
  prefixUrl: "",
  wrapHorizontal: false,
  debugMode: false,
  visibilityRatio: 1,
  minZoomLevel: 1,
  timeout: 10_000,
  imageLoaderLimit: 10,
  showFullPageControl: false,
  showZoomControl: false,
  showHomeControl: false,
  showNavigator: false,
} as const satisfies OpenSeadragon.Options;

export type TileRequest = {
  level: number;
  x: number;
  y: number;
};

export type DownloadContext = {
  postData: TileRequest;
  finish(ctx: CanvasRenderingContext2D): void;
};

type TileCache = {
  _data: CanvasRenderingContext2D | null;
};

export type OpenSeadragonTileSourcePrototype =
  OpenSeadragon.TileSourceOptions & {
    getTilePostData(level: number, x: number, y: number): TileRequest;
    getRequestedTileSize(context: DownloadContext): Size;
    getTileBoundsInComplex(
      context: DownloadContext
    ): Omit<JuliaImageRequest, "width_px">;
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
