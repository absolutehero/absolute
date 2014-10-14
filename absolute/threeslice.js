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

        ThreeSlice.prototype = Object.create(PIXI.Sprite.prototype);

        ThreeSlice.prototype._initThreeSlice = function(options) {
            this.options = options;
            PIXI.Sprite.call(this, this._createBackground());
        };

        ThreeSlice.prototype._createBackground = function() {

            var left, centerTile, right, tempTexture,
                centerTexture = PIXI.Texture.fromFrame(this.options.images.center),
                tempContainer = new PIXI.DisplayObjectContainer();

            left = PIXI.Sprite.fromFrame(this.options.images.left);
            left.position.x = 0;
            left.position.y = 0;

            right = PIXI.Sprite.fromFrame(this.options.images.right);
            right.position.x = this.options.width - right.width;
            right.position.y = 0;

            centerTile = new PIXI.TilingSprite(centerTexture,
                        this.options.width - left.width - right.width,
                        centerTexture.height);

            centerTile.position.x = left.width;
            centerTile.position.y = 0;

            tempContainer.addChild(centerTile);
            tempContainer.addChild(left);
            tempContainer.addChild(right);

            tempTexture = tempContainer.generateTexture();

            centerTile.tilingTexture.destroy(true);

            return tempTexture;

        };

        ThreeSlice.prototype.destroy = function() {

            this.texture.destroy(true);

        };

        return ThreeSlice;
    }
);