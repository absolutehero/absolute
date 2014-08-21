define(['pixi', 'absolute/screen', 'absolute/debug', 'lodash'],

    function(PIXI, Screen, Debug, _) {

        var NineSlice = function(options) {

            var defaultOptions = {
                'width': '100',
                'height':'100',
                'images': {
                    'topLeft':'MDS_9slice_modal_01.png',
                    'topCenter':'MDS_9slice_modal_02.png',
                    'topRight':'MDS_9slice_modal_03.png',
                    'middleLeft':'MDS_9slice_modal_04.png',
                    'middleCenter':'MDS_9slice_modal_05.png',
                    'middleRight':'MDS_9slice_modal_06.png',
                    'bottomLeft':'MDS_9slice_modal_07.png',
                    'bottomCenter':'MDS_9slice_modal_08.png',
                    'bottomRight':'MDS_9slice_modal_09.png'
                }
            };

            this._initNineSlice(_.extend(defaultOptions, options));
        };

        NineSlice.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

        NineSlice.prototype._initNineSlice = function(options) {

            PIXI.DisplayObjectContainer.call(this);

            this.options = options;
            this.cachedContent = this.options.content;

            this._setSize();
            this._createBackground();
        };


        NineSlice.prototype._setSize = function() {

            this.width = this.options.width;
            this.height = this.options.height;

        };

        NineSlice.prototype._createBackground = function() {

            this.container = new PIXI.DisplayObjectContainer();

            var topLeft = PIXI.Sprite.fromFrame(this.options.images.topLeft);
            topLeft.position.x = 0;
            topLeft.position.y = 0;

            var topRight = PIXI.Sprite.fromFrame(this.options.images.topRight);
            topRight.position.x = this.width - topRight.width;
            topRight.position.y = 0;

            var bottomLeft = PIXI.Sprite.fromFrame(this.options.images.bottomLeft);
            bottomLeft.position.x = 0;
            bottomLeft.position.y = this.height - bottomLeft.height;

            var bottomRight = PIXI.Sprite.fromFrame(this.options.images.bottomRight);
            bottomRight.position.x = this.width - bottomRight.width;
            bottomRight.position.y = this.height - bottomRight.height;

            // Tile middle left
            var middleLeftTexture = PIXI.Texture.fromFrame(this.options.images.middleLeft);
            this.middleLeftTile = new PIXI.TilingSprite(middleLeftTexture,
                middleLeftTexture.width,
                    this.height - topLeft.height - bottomLeft.height
            );
            this.middleLeftTile.position.x = 0;
            this.middleLeftTile.position.y = topLeft.height;

            // Tile middle right
            var middleRightTexture = PIXI.Texture.fromFrame(this.options.images.middleRight);
            this.middleRightTile = new PIXI.TilingSprite(middleRightTexture,
                middleRightTexture.width,
                    this.height - topLeft.height - bottomLeft.height
            );
            this.middleRightTile.position.x = this.width - topRight.width;
            this.middleRightTile.position.y = topRight.height;

            // Tile top center
            var topCenterTexture = PIXI.Texture.fromFrame(this.options.images.topCenter);
                this.topCenterTile = new PIXI.TilingSprite(topCenterTexture,
                        this.width - topLeft.width - topRight.width,
                    topCenterTexture.height
                );
            this.topCenterTile.position.x = topLeft.width;
            this.topCenterTile.position.y = 0;

            // Tile bottom center
            var bottomCenterTexture = PIXI.Texture.fromFrame(this.options.images.bottomCenter);
            this.bottomCenterTile = new PIXI.TilingSprite(bottomCenterTexture,
                    this.width - bottomLeft.width - bottomRight.width,
                bottomCenterTexture.height
            );
            this.bottomCenterTile.position.x = bottomLeft.width;
            this.bottomCenterTile.position.y = this.height - bottomLeft.height;


            // Tile middle center
            var middleCenterTexture = PIXI.Texture.fromFrame(this.options.images.middleCenter);
            this.middleCenterTile = new PIXI.TilingSprite(middleCenterTexture,
                    this.width - topLeft.width - topRight.width,
                Math.ceil(this.height - bottomRight.height - topRight.height)
            );
            this.middleCenterTile.position.x = topLeft.width;
            this.middleCenterTile.position.y = topLeft.height;

            this.container.addChild(topLeft);
            this.container.addChild(this.topCenterTile);
            this.container.addChild(topRight);

            this.container.addChild(this.middleLeftTile);
            this.container.addChild(this.middleCenterTile);
            this.container.addChild(this.middleRightTile);

            this.container.addChild(bottomLeft);
            this.container.addChild(this.bottomCenterTile);
            this.container.addChild(bottomRight);

            this.addChild(this.container);

            this.container.cacheAsBitmap = true;
        };

        NineSlice.prototype.destroy = function() {
            this.topCenterTile.tilingTexture.destroy(true);
            this.middleLeftTile.tilingTexture.destroy(true);
            this.middleCenterTile.tilingTexture.destroy(true);
            this.middleRightTile.tilingTexture.destroy(true);
            this.bottomCenterTile.tilingTexture.destroy(true);
        };


        return NineSlice;
    }
);