/**
 * User: craig
 * Date: 6/9/14
 * Time: 4:14 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'absolute/loader'], function(PIXI, Loader) {

    var LazyLoadedSprite = function(atlasName, assetName, placeholder) {
        this._initLazyLoadedSprite(atlasName, assetName, placeholder);
    };

    LazyLoadedSprite.constructor = LazyLoadedSprite;
    LazyLoadedSprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    LazyLoadedSprite.prototype._initLazyLoadedSprite = function(atlasName, assetName, placeholder) {
        PIXI.DisplayObjectContainer.call(this);

        this.atlasName = atlasName;
        this.assetName = assetName;
        this.placeholder = placeholder;
        this.isLoaded = false;
        this.isLoading = false;

        this.addChild(this.placeholder);
    };

    LazyLoadedSprite.prototype.load = function (onLoaded) {
        if (!PIXI.TextureCache[this.assetName]) {
            var loader = new Loader();
            this.isLoading = true;
            loader.loadArt([{name: this.atlasName}], function () {}, function () {
                this._replaceAsset();
                this.isLoaded = true;
                if (typeof onLoaded === "function") {
                    onLoaded(this);
                }
            }.bind(this));
        }
        else {
            this._replaceAsset();
        }
    };

    LazyLoadedSprite.prototype._replaceAsset = function () {
        this.asset = PIXI.Sprite.fromFrame(this.assetName);
        this.removeChild(this.placeholder);
        this.addChild(this.asset);
        this.placeholder = null;

    };

    Object.defineProperty(LazyLoadedSprite.prototype, 'loaded', {
        get: function() {
            return this.isLoaded;
        }
    });

    Object.defineProperty(LazyLoadedSprite.prototype, 'loading', {
        get: function() {
            return this.isLoading;
        }
    });

    return LazyLoadedSprite;
});
