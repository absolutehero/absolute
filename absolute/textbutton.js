/**
 * Created by lisawick on 4/9/14.
 */
define(['pixi','absolute/button', 'absolute/threeslice', 'lodash', 'absolute/screenmetrics'],
    function (PIXI, Button, ThreeSlice, _, ScreenMetrics) {


    var TextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions, threeSliceOptions) {

        var defaultTextStyleOptions = {
            text : "",
            textStyle : { font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache", align: "center" },
            useBitmapFont : true
        };

        var options = textStyleOptions || defaultTextStyleOptions;

        this._initTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, _.extend(defaultTextStyleOptions, options), threeSliceOptions);
    };

    TextButton.constructor = TextButton;
    TextButton.prototype = Object.create(Button.prototype);

    TextButton.prototype._initTextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions, threeSliceOptions) {

        this.textStyleOptions = textStyleOptions;

        Button.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions);

        this.setText(this.textStyleOptions.text);
    };

    TextButton.prototype.setText = function (text) {

        var label, labelTextureSprite = new PIXI.DisplayObjectContainer();
        if (this.labelContainer) {
            this.removeChild(this.labelContainer);
        }
        this.labelContainer = new PIXI.DisplayObjectContainer();

        if (this.textStyleOptions.useBitmapFont) {
            label = new PIXI.BitmapText(text, this.textStyleOptions);
        } else {
            label = new PIXI.Text(text, this.textStyleOptions);
        }

        labelTextureSprite = new PIXI.Sprite(label.generateTexture());

        this.labelContainer.width = labelTextureSprite.width;
        this.labelContainer.height = labelTextureSprite.height;
        this.labelContainer.pivot.x = this.labelContainer.width / 2;
        this.labelContainer.pivot.y = this.labelContainer.height / 2;
        this.labelContainer.x = this.width / 2;
        this.labelContainer.y = this.height / 2;
        this.labelContainer.addChild(labelTextureSprite);

        this.addChild(this.labelContainer);
    };

    return TextButton;

});