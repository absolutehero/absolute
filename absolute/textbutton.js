/**
 * Created by lisawick on 4/9/14.
 */
define(['pixi','absolute/button', 'absolute/threeslice', 'lodash', 'absolute/screenmetrics', 'absolute/coords'],
    function (PIXI, Button, ThreeSlice, _, ScreenMetrics, Coords) {


    var TextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions, threeSliceOptions) {

        var defaultTextStyleOptions = {
            text : "",
            textStyle : { font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache", align: "center" },
            useBitmapFont : true,
            buttonPadding : Coords.x(80)
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

        var textTexture;

        if (this.label) {
            this.removeChild(this.label);
            if(typeof this.label.destroy === 'function') {
                this.label.destroy(true);
            }
        }

        if (this.textStyleOptions.useBitmapFont) {
            var labelBitmapText = new PIXI.BitmapText(text, this.textStyleOptions);
            textTexture = labelBitmapText.generateTexture();

        } else {
            var labelPixiText = new PIXI.Text(text, this.textStyleOptions),
                tempContainer = new PIXI.DisplayObjectContainer();
            tempContainer.addChild(labelPixiText);
            textTexture = tempContainer.generateTexture();
            labelPixiText.destroy(true);
        }

        this.label = new PIXI.Sprite(textTexture);
        this.label.anchor.x = this.label.anchor.y = 0.5;

        if(this.textStyleOptions.scaleToFit && this.label.width > this.width - this.textStyleOptions.buttonPadding) {
            this.label.scale.x = this.label.scale.y = (this.width - this.textStyleOptions.buttonPadding) / this.label.width;
        }

        if (typeof this.textStyleOptions.position !== 'undefined') {
            if (typeof this.textStyleOptions.position.x === 'number') {
                this.label.x = this.textStyleOptions.position.x;
            }
            if (typeof this.textStyleOptions.position.y === 'number') {
                this.label.y = this.textStyleOptions.position.y;
            }
        } else {
            this.label.x = this.width / 2;
            this.label.y = this.height / 2;
        }

        this.addChild(this.label);

    };

    TextButton.prototype.destroy = function() {

        if(typeof this.label.destroy === 'function') {
            this.label.destroy(true);
        }

        Button.prototype.destroy.call(this);

    };

    return TextButton;

});