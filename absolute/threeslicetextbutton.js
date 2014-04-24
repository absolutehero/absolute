/**
 * Created by lisawick on 4/23/14.
 */
define(['pixi','absolute/textbutton', 'absolute/screenmetrics', 'absolute/threeslice', 'lodash'],
    function (PIXI, TextButton, ScreenMetrics, ThreeSlice, _) {

        var ThreeSliceTextButton = function(threeSliceOptions, action, replaceOnHover, useTap, options) {

            var defaultOptions = {
                text : "",
                textStyle : { font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache", align: "center" }
            };

            this.container = new PIXI.DisplayObjectContainer();

            var defaultImage = this._createThreeSliceImage(threeSliceOptions);
            var hoverImage = this._createThreeSliceImage(threeSliceOptions);

            this._initThreeSliceTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, _.extend(defaultOptions, options));
        };

        ThreeSliceTextButton.constructor = ThreeSliceTextButton;
        ThreeSliceTextButton.prototype = Object.create(TextButton.prototype);

        ThreeSliceTextButton.prototype._initThreeSliceTextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, options) {
            TextButton.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap, options);
        };

        ThreeSliceTextButton.prototype._createThreeSliceImage = function(options) {

            var threeSlice = new ThreeSlice(options);

            var canvasRenderer = new PIXI.CanvasRenderer(threeSlice.width, threeSlice.height, null, true);

            this.container.addChild(threeSlice);
            canvasRenderer.render(threeSlice);
            this.container.removeChild(threeSlice);

            return PIXI.Texture.fromCanvas(canvasRenderer.view);
        };

        return ThreeSliceTextButton;
    });
