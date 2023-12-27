import OpenSeadragon from "openseadragon";
import { viewerDimensions, pointToComplex } from "./utils";
import { JuliaImageRequest, calcImage } from "../api";
import { OpenSeadragonTileSourcePrototype, VIEWER_OPTIONS } from "./config";

const createTileSource = (): OpenSeadragon.TileSource => {
  const { height, width } = viewerDimensions();
  const tileSource: OpenSeadragonTileSourcePrototype = {
    height,
    width,
    tileSize: 256,
    tileOverlap: 4,
    getTileUrl(level, x, y) {
      return `${level}/${x}-${y}`;
    },
    /** OSD internal method */
    getTilePostData(level, x, y) {
      // this is later passed as DownloadContext
      return { x, y, level };
    },
    internalGetTileBounds(context, isSource) {
      // I know what you are thinking: wtf is this about?
      // Tbh, I spent 2 days trying to figure it out, and you
      // wouldn't believe what authors of OSD are doing with
      // this whole object internally.

      // And btw, I took this code from their docs.
      // So yeah, supposedly this is legit.
      type TileSource = OpenSeadragon.TileSource;
      return (this as unknown as TileSource).getTileBounds(
        context.postData.level,
        context.postData.x,
        context.postData.y,
        isSource
      );
    },
    getRequestedTileSize(context) {
      const bounds = this.internalGetTileBounds(context, true);
      // when true, bounds.x and bounds.y are always 0
      const { floor, max } = Math;
      return {
        width: max(floor(bounds.width), 1),
        height: max(floor(bounds.height), 1),
      };
    },
    getTileBoundsInComplex(context) {
      const bounds = this.internalGetTileBounds(context, false);
      // when false, all values are expressed in OSD unit "viewport"
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

  return tileSource as unknown as OpenSeadragon.TileSource;
};

export let fractalViewer: OpenSeadragon.Viewer | null = null;
export const mountFractalViewer = () => {
  fractalViewer = OpenSeadragon({
    ...VIEWER_OPTIONS,
    tileSources: [createTileSource()],
  });
};
