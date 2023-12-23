import OpenSeadragon from "openseadragon";
import { getViewerDimentions, pointToComplex } from "./utils";
import { JuliaImageRequest, calcImage } from "../api";
import {
  OpenSeadragonTileSourceProto,
  VIEWER_OPTIONS,
  TileSource,
} from "./config";

const createTileSource = (aspectRatio: number): any => {
  const { height, width } = getViewerDimentions(aspectRatio);
  const tileSource: OpenSeadragonTileSourceProto = {
    height,
    width,
    tileSize: 512,
    tileOverlap: 0,
    getTileUrl(level, x, y) {
      return `${level}/${x}-${y}`;
    },
    /** OSD internal method */
    getTilePostData(level: number, x: number, y: number) {
      // this is later passed as DownloadContext
      return {
        dx: x,
        dy: y,
        level: level,
      };
    },
    unsafeGetTileBounds(context, isSource) {
      // I know what you are thinking: wtf is this about?
      // Tbh, I spent 2 days trying to figure out, and you
      // wouldn't believe what authors of OSD are doing with
      // this whole object internally.

      // And yes, I took this code from their docs.
      // So yeah, supposedly this is legit.
      const { dx, dy, level } = context.postData;
      return (this as unknown as TileSource).getTileBounds(
        level,
        dx,
        dy,
        isSource
      );
    },
    getRequestedTileSize(context) {
      const bounds = this.unsafeGetTileBounds(context, true);
      // when true, bounds.x and bounds.y are always 0
      const { floor, max } = Math;
      return {
        width: max(floor(bounds.width), 1),
        height: max(floor(bounds.height), 1),
      };
    },
    getTileBoundsInComplex(context) {
      let bounds = this.unsafeGetTileBounds(context, false);
      // when false, bounds.width and bounds.height are always <1
      return {
        top_left: pointToComplex(bounds.getTopLeft()),
        bottom_right: pointToComplex(bounds.getBottomRight()),
      };
    },
    /** OSD internal method */
    downloadTileStart: async function (context) {
      const tileSize = this.getRequestedTileSize(context);
      const tileBounds = this.getTileBoundsInComplex(context);
      const request: JuliaImageRequest = {
        width_px: tileSize.width,
        ...tileBounds,
      };
      const image = await calcImage(request);
      const canvas = document.createElement("canvas");
      canvas.width = tileSize.width;
      canvas.height = tileSize.height;
      const ctx = canvas.getContext("2d")!;
      console.log({
        ...request,
        post: context.postData,
        bounds: this.unsafeGetTileBounds(context, false),
        topLeft: this.unsafeGetTileBounds(context, false).getTopLeft(),
        bottomRight: this.unsafeGetTileBounds(context, false).getBottomRight(),
      });
      ctx.putImageData(image, 0, 0);
      context.finish(ctx);
    },
    /** OSD internal method */
    createTileCache: function (cache, data) {
      //cache is the cache object meant to attach items to
      //data is context2D, just keep the reference
      cache._data = data;
    },
    /** OSD internal method */
    destroyTileCache: function (cache) {
      //unset to allow GC collection
      cache._data = null;
    },
    /** OSD internal method */
    getTileCacheData: function (cache) {
      //just return the raw data as it was given, part of API
      return cache;
    },
    /** OSD internal method */
    getTileCacheDataAsContext2D: function (cache) {
      if (cache._data === null) throw "Cache is empty";
      return cache._data;
    },
  };

  return tileSource;
};

export const mountFractal = (aspectRatio: number) => {
  let viewer = OpenSeadragon({
    ...VIEWER_OPTIONS,
    tileSources: [createTileSource(aspectRatio)],
  });
  return viewer;
};
