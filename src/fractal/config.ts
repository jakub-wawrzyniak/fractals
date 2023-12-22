import OpenSeadragon from "openseadragon";
import { JuliaImageRequest } from "../api";

export const VIEWER_ROOT_ID = "fractal";
export const VIEWER_OPTIONS: OpenSeadragon.Options = {
  id: VIEWER_ROOT_ID,
  prefixUrl: "",
  wrapHorizontal: false,
  debugMode: true,
  // visibilityRatio: 1,
  // minZoomImageRatio
  // minZoomLevel: 1,
  timeout: 10_000,

  showFullPageControl: false,
  showZoomControl: false,
  showHomeControl: false,
  showNavigator: false,
};

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
type TileRequest = {
  level: number;
  dx: number;
  dy: number;
};

type DownloadContext = {
  postData: TileRequest;
  finish(ctx: CanvasRenderingContext2D): void;
};

type TileCache = {
  _data: { canvas: CanvasRenderingContext2D | null };
};

export type TileSource = OpenSeadragon.TileSource;
export type OpenSeadragonTileSourceProto = OpenSeadragon.TileSourceOptions & {
  getTilePostData(level: number, x: number, y: number): TileRequest;
  getRequestedTileSize(context: DownloadContext): Size;
  getTileBoundsInComplex(
    context: DownloadContext
  ): Omit<JuliaImageRequest, "width_px">;
  downloadTileStart(context: DownloadContext): void;
  // downloadTileAbort(context: DownloadContext): void;
  createTileCache(cache: TileCache, data: CanvasRenderingContext2D): void;
  destroyTileCache(cache: TileCache): void;
  getTileCacheData(cache: TileCache): TileCache["_data"];
  // getTileCacheDataAsImage(cache: TileCache): HTMLImageElement;
  getTileCacheDataAsContext2D(cache: TileCache): CanvasRenderingContext2D;
  unsafeGetTileBounds: TileSource["getTileBounds"];
};
