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

        if (this.labelContainer) {
            this.removeChild(this.labelContainer);
        }
        this.labelContainer = new PIXI.DisplayObjectContainer();

        if (this.textStyleOptions.useBitmapFont) {
            var labelBitmapText = new PIXI.BitmapText(text, this.textStyleOptions);
            this.label = new PIXI.Sprite(labelBitmapText.generateTexture());
        } else {
            this.label = new PIXI.Text(text, this.textStyleOptions);
        }

        this.labelContainer.width = this.label.width;
        this.labelContainer.height = this.label.height;
        this.labelContainer.pivot.x = this.labelContainer.width / 2;
        this.labelContainer.pivot.y = this.labelContainer.height / 2;
        this.labelContainer.x = this.width / 2;
        if (typeof this.textStyleOptions.position !== 'undefined') {
            if (typeof this.textStyleOptions.position.x === 'number') {
                this.labelContainer.x = this.textStyleOptions.position.x;
            }
            if (typeof this.textStyleOptions.position.y === 'number') {
                this.labelContainer.y = this.textStyleOptions.position.y;
            }
        }
        this.labelContainer.y = this.height / 2;
        this.labelContainer.addChild(this.label);

        this.addChild(this.labelContainer);
    };

    TextButton.prototype.destroy = function() {

        if(typeof this.label.destroy === 'function') {
            this.label.destroy(true);
        }

        Button.prototype.destroy.call(this);

    };

    return TextButton;

});