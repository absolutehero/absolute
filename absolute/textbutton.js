/**
 * Created by lisawick on 4/9/14.
 */
define(['pixi','absolute/button', 'absolute/threeslice', 'lodash', 'absolute/screenmetrics'],
    function (PIXI, Button, ThreeSlice, _, ScreenMetrics) {


    var TextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions, threeSliceOptions) {

        var defaultTextStyleOptions = {
            text : "",
            textStyle : { font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache", align: "center" }
        };

        var options = textStyleOptions || defaultTextStyleOptions;

        if (threeSliceOptions && typeof threeSliceOptions === 'object' ) {
            this.container = new PIXI.DisplayObjectContainer();
            defaultImage = this._createThreeSliceImage(threeSliceOptions);
            hoverImage = this._createThreeSliceImage(threeSliceOptions);
        }

        this._initTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, _.extend(defaultTextStyleOptions, options));
    };

    TextButton.constructor = TextButton;
    TextButton.prototype = Object.create(Button.prototype);

    TextButton.prototype._initTextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions) {

        Button.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap);

        this.text = textStyleOptions.text;
        this.textStyle = textStyleOptions.textStyle;

        this.label = new PIXI.BitmapText(this.text, this.textStyle);
        this.label.position.x = (this.width - this.label.textWidth) / 2;
        this.label.position.y = (this.height / 2) - this.label.textHeight;
        this.addChild(this.label);
    };

    TextButton.prototype._createThreeSliceImage = function(options) {

        var threeSlice = new ThreeSlice(options);

        var canvasRenderer = new PIXI.CanvasRenderer(threeSlice.width, threeSlice.height, null, true);

        this.container.addChild(threeSlice);
        canvasRenderer.render(threeSlice);
        this.container.removeChild(threeSlice);

        return PIXI.Texture.fromCanvas(canvasRenderer.view);
    };

    return TextButton;

});