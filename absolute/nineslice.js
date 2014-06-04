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
            var middleLeftSprite = new PIXI.Sprite.fromFrame(this.options.images.middleLeft),
                middleLeftTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleLeftSprite),
                    middleLeftSprite.width,
                        this.height - topLeft.height - bottomLeft.height
                );
            middleLeftTile.position.x = 0;
            middleLeftTile.position.y = topLeft.height;

            // Tile middle right
            var middleRightSprite = new PIXI.Sprite.fromFrame(this.options.images.middleRight),
                middleRightTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleRightSprite),
                    middleRightSprite.width,
                        this.height - topLeft.height - bottomLeft.height
                );
            middleRightTile.position.x = this.width - topRight.width;
            middleRightTile.position.y = topRight.height;

            // Tile top center
            var topCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.topCenter),
                topCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(topCenterSprite),
                        this.width - topLeft.width - topRight.width,
                    topCenterSprite.height
                );
            topCenterTile.position.x = topLeft.width;
            topCenterTile.position.y = 0;

            // Tile bottom center
            var bottomCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.bottomCenter),
                bottomCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(bottomCenterSprite),
                        this.width - bottomLeft.width - bottomRight.width,
                    bottomCenterSprite.height
                );
            bottomCenterTile.position.x = bottomLeft.width;
            bottomCenterTile.position.y = this.height - bottomLeft.height;


            // Tile middle center
            var middleCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.middleCenter),
                middleCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleCenterSprite),
                        this.width - topLeft.width - topRight.width,
                    Math.ceil(this.height - bottomRight.height - topRight.height)
                );
            middleCenterTile.position.x = topLeft.width;
            middleCenterTile.position.y = topLeft.height;

            this.container.addChild(topLeft);
            this.container.addChild(topCenterTile);
            this.container.addChild(topRight);

            this.container.addChild(middleLeftTile);
            this.container.addChild(middleCenterTile);
            this.container.addChild(middleRightTile);

            this.container.addChild(bottomLeft);
            this.container.addChild(bottomCenterTile);
            this.container.addChild(bottomRight);

            this.addChild(this.container);

        };

        NineSlice.prototype.getTextureFromSpriteSheet = function(tempSprite) {
            return tempSprite.generateTexture();
        };



        return NineSlice;
    }
);