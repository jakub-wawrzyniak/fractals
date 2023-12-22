import OpenSeadragon from "openseadragon";
import { getViewerDimentions, pointToComplex } from "./utils";
import { calcImage } from "../api";

export const VIEWER_ROOT_ID = "fractal";

/**
 *
 * @param {number} aspectRatio
 * @returns
 */
export const mountFractal = (aspectRatio) => {
  const { height, width } = getViewerDimentions(aspectRatio);
  let viewer = OpenSeadragon({
    id: VIEWER_ROOT_ID,
    prefixUrl: "",
    wrapHorizontal: false,
    // debugMode: true,
    visibilityRatio: 1,
    // minZoomImageRatio
    minZoomLevel: 1,

    showFullPageControl: false,
    showZoomControl: false,
    showHomeControl: false,
    showNavigator: false,
    tileSources: {
      //please, do not use Infinity, OSD internally builds a cached tile hierarchy
      height,
      width,
      tileSize: 512,
      maxIterations: 100,
      getTileUrl: function (level, x, y) {
        //note that we still have to implement getTileUrl
        //since we do, we use this to construct meaningful tile cache key
        //fractal has different data for different tiles - just distinguish
        //between all tiles
        return `${level}/${x}-${y}`;
      },
      getTilePostData: function (level, x, y) {
        //yup, handy post data
        return {
          dx: x,
          dy: y,
          level: level,
        };
      },
      iterateMandelbrot: function (refPoint) {
        var squareAndAddPoint = function (z, point) {
          let a = Math.pow(z.a, 2) - Math.pow(z.b, 2) + point.a;
          let b = 2 * z.a * z.b + point.b;
          z.a = a;
          z.b = b;
        };

        var length = function (z) {
          return Math.sqrt(Math.pow(z.a, 2) + Math.pow(z.b, 2));
        };

        let z = { a: 0, b: 0 };
        for (let i = 0; i < this.maxIterations; i++) {
          squareAndAddPoint(z, refPoint);
          if (length(z) > 2) return i / this.maxIterations;
        }
        return 1.0;
      },
      getRequestedTileSize(context) {
        const bounds = this.getTileBounds(
          context.postData.level,
          context.postData.dx,
          context.postData.dy,
          true
        );
        return {
          width: Math.floor(bounds.width),
          height: Math.floor(bounds.height),
        };
      },
      getTileBoundsInComplex(context) {
        let bounds = this.getTileBounds(
          context.postData.level,
          context.postData.dx,
          context.postData.dy,
          false
        );
        return {
          top_left: pointToComplex(bounds.getTopLeft()),
          bottom_right: pointToComplex(bounds.getBottomRight()),
        };
      },
      downloadTileStart: function (context) {
        const tileSize = this.getRequestedTileSize(context);
        const tileBounds = this.getTileBoundsInComplex(context);

        calcImage({ resolution: tileSize.width, ...tileBounds }).then(
          console.log
        );

        let bounds = this.getTileBounds(
          context.postData.level,
          context.postData.dx,
          context.postData.dy,
          false
        );

        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        if (tileSize.width < 1 || tileSize.height < 1) {
          canvas.width = 1;
          canvas.height = 1;
          context.finish(ctx);
          return;
        } else {
          canvas.width = tileSize.width;
          canvas.height = tileSize.height;
        }

        //don't really think about the rescaling, just played with
        // linear transforms until it was centered
        bounds.x = bounds.x * 2.5 - 1.5;
        bounds.width = bounds.width * 2.5;
        bounds.y = bounds.y * 2.5 - 1.2;
        bounds.height = bounds.height * 2.5;
        var imagedata = ctx.createImageData(tileSize.width, tileSize.height);
        for (let x = 0; x < tileSize.width; x++) {
          for (let y = 0; y < tileSize.height; y++) {
            let index = (y * tileSize.width + x) * 4;
            imagedata.data[index] = Math.floor(
              this.iterateMandelbrot({
                a: bounds.x + bounds.width * ((x + 1) / tileSize.width),
                b: bounds.y + bounds.height * ((y + 1) / tileSize.height),
              }) * 255
            );

            imagedata.data[index + 3] = 255;
          }
        }
        ctx.putImageData(imagedata, 0, 0);
        // note: we output context2D!
        context.finish(ctx);
      },
      downloadTileAbort: function (context) {
        //we could set a flag which would stop the execution,
        // and it would be right to do so, but it's not necessary
        // (could help in debug scenarios though, in case of cycling
        // it could kill it)
        //pass
      },

      createTileCache: function (cache, data) {
        //cache is the cache object meant to attach items to
        //data is context2D, just keep the reference
        cache._data = data;
      },

      destroyTileCache: function (cache) {
        //unset to allow GC collection
        cache._data = null;
      },

      getTileCacheData: function (cache) {
        //just return the raw data as it was given, part of API
        return cache._data;
      },

      getTileCacheDataAsImage: function () {
        // not implementing all the features brings limitations to the
        // system, namely tile.getImage() will not work and also
        // html-based drawing approach will not work
        throw "Lazy to implement";
      },

      getTileCacheDataAsContext2D: function (cache) {
        // our data is already context2D - what a luck!
        return cache._data;
      },
    },
  });
  return viewer;
};
