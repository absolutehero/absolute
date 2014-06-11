/**
 * Created by craig on 9/26/13.
 */
define(
[
    'pixi',
    'absolute/platform',
    'absolute/audiomanager',
    'absolute/asyncqueue',
    'absolute/screenmetrics'
],
function (
    PIXI,
    Platform,
    AudioManager,
    AsyncQueue,
    ScreenMetrics
    )
{
    "use strict";

    var Loader = function () {
        this._initLoader();
    };

    Loader.prototype._initLoader = function () {

    };

    Loader.prototype.loadSound = function(assets, onProgress, onComplete) {
        AudioManager.init(function() {
            AudioManager.loadSounds(assets, onProgress, onComplete);
        });

    };

    Loader.prototype.loadArt = function(assets, onProgress, onComplete, forceLoad) {
        var total = assets.length;

        var paths = [];
        for (var i = 0; i < total; ++i) {
            var asset = assets[i],
                assetType = "image",
                skip = typeof asset.lazyload !== "undefined" ? asset.lazyload : false;

            if (!skip) {
                if (typeof asset !== "string") {
                    if (asset.type) {
                        assetType = asset.type;
                    }
                    asset = asset.name;
                }
                if (assetType === "image") {
                    if (asset.indexOf('.json') === -1) {
                        asset += ".json";
                    }
                }
                else if (assetType === "font") {
                    if (asset.indexOf('.fnt') === -1) {
                        asset += ".fnt";
                    }
                }

                paths.push(Platform.artPathPrefix + '/' + ScreenMetrics.getResClass() + '/' + asset);
            }
        }

        this.assetLoader = new PIXI.AssetLoader(paths);
        this.assetLoader.addEventListener('onComplete', function() {
            onComplete();
        });
        this.assetLoader.addEventListener('onProgress', function(loader) {
            onProgress(1 - (loader.content.loadCount / total));
        });

        this.assetLoader.load();
    };

    Loader.prototype.loadAssets = function (assets, onLoadProgress, onLoadComplete) {
        var aqueue = new AsyncQueue();
        aqueue.pushTasks([
            function (p, c) {
                this.loadArt(assets.artAssets, p, c);
            }.bind(this),
            function (p, c) {
                this.loadSound(assets.audioAssets, p, c);
            }.bind(this)
        ]);

        aqueue.run(onLoadProgress, onLoadComplete);
    };

    return Loader;

});