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
            this.texture = this._createThreeSliceImage(threeSliceOptions);
            defaultImage = this.texture;
            hoverImage = this.texture;
        }

        this._initTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, _.extend(defaultTextStyleOptions, options));
    };

    TextButton.constructor = TextButton;
    TextButton.prototype = Object.create(Button.prototype);

    TextButton.prototype._initTextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions) {


        Button.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap);

        var label = new PIXI.BitmapText(textStyleOptions.text, textStyleOptions),
            labelTextureSprite = new PIXI.Sprite(label.generateTexture());

        var labelContainer = new PIXI.DisplayObjectContainer();
        labelContainer.width = labelTextureSprite.width;
        labelContainer.height = labelTextureSprite.height;
        labelContainer.pivot.x = labelContainer.width / 2;
        labelContainer.pivot.y = labelContainer.height / 2;
        labelContainer.x = this.width / 2;
        labelContainer.y = this.height / 2;
        labelContainer.addChild(labelTextureSprite);

        this.addChild(labelContainer);
    };

    TextButton.prototype._createThreeSliceImage = function(options) {

        var threeSlice = new ThreeSlice(options);

        return threeSlice.generateTexture();
    };

    return TextButton;

});