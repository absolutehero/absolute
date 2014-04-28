/**
 * Created by lisawick on 4/23/14.
 */
define(['pixi', 'lodash'],

    function(PIXI, _) {

        var ThreeSlice = function(options) {

            var defaultOptions = {
                'width': '470',
                'height':'126',
                'images': {
                    'left':'LW_3slice_btn_01.png',
                    'center':'LW_3slice_btn_02.png',
                    'right':'LW_3slice_btn_03.png'
                }
            };

            this._initThreeSlice(_.extend(defaultOptions, options));
        };

        ThreeSlice.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

        ThreeSlice.prototype._initThreeSlice = function(options) {

            PIXI.DisplayObjectContainer.call(this);

            this.options = options;
            this.cachedContent = this.options.content;

            this._setSize();
            this._createBackground();
        };

        ThreeSlice.prototype._setSize = function() {
            this.width = this.options.width;
            this.height = this.options.height;
        };

        ThreeSlice.prototype._createBackground = function() {

            this.container = new PIXI.DisplayObjectContainer();

            var left = PIXI.Sprite.fromFrame(this.options.images.left);
            left.position.x = 0;
            left.position.y = 0;

            var right = PIXI.Sprite.fromFrame(this.options.images.right);
            right.position.x = this.width - right.width;
            right.position.y = 0;

            // Tile center
            var center = new PIXI.Sprite.fromFrame(this.options.images.center),
                centerTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(center),
                        this.width - left.width - right.width,
                    center.height
                );
            centerTile.position.x = left.width;
            centerTile.position.y = 0;

            this.container.addChild(left);
            this.container.addChild(centerTile);
            this.container.addChild(right);

            this.addChild(this.container);

        };

        ThreeSlice.prototype.getTextureFromSpriteSheet = function(tempSprite) {

            var canvasRenderer = new PIXI.CanvasRenderer(tempSprite.width, tempSprite.height, null, true);

            this.container.addChild(tempSprite);
            canvasRenderer.render(tempSprite);
            this.container.removeChild(tempSprite);

            return PIXI.Texture.fromCanvas(canvasRenderer.view);

        };

        return ThreeSlice;
    }
);