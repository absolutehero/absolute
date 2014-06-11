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

        this.addChild(this.placeholder);

        this.width = placeholder.width;
        this.height = placeholder.height
    };

    LazyLoadedSprite.prototype.load = function () {
        if (!PIXI.TextureCache[this.assetName]) {
            var loader = new Loader();
            this.isLoaded = true;
            loader.loadArt([{name: this.atlasName}], function () {}, function () {
                this._replaceAsset();
            }.bind(this));
        }
        else {
            this._replaceAsset();
        }
    };

    LazyLoadedSprite.prototype._replaceAsset = function () {
        if (this.placeHolder) {
            this.removeChild(this.placeHolder);
        }
        this.placeHolder = null;

        this.asset = PIXI.Sprite.fromFrame(this.assetName);
        this.addChild(this.asset);
    };

    Object.defineProperty(LazyLoadedSprite.prototype, 'loaded', {
        get: function() {
            return this.isLoaded;
        }
    });

    return LazyLoadedSprite;
});
