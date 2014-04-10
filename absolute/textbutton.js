/**
 * Created by lisawick on 4/9/14.
 */
define(['pixi','absolute/button', 'lodash', 'absolute/screenmetrics', 'absolute/platform'],
    function (PIXI, Button, _, ScreenMetrics, Platform) {


    var TextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, options) {

        var defaultOptions = {
            text : "",
            textStyle : { font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache", align: "center" }
        };

        this._initTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, _.extend(defaultOptions, options));
    };

    TextButton.constructor = TextButton;
    TextButton.prototype = Object.create(Button.prototype);

    TextButton.prototype._initTextButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, options) {

        Button.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap);

        this.text = options.text;
        this.textStyle = options.textStyle;

        this.label = new PIXI.BitmapText(this.text, this.textStyle);
        this.label.position.x = (this.width - this.label.textWidth) / 2;
        this.label.position.y = (this.height / 2) - this.label.textHeight;
        this.addChild(this.label);

        if (!Platform.supportsTouch()) {
            this.mouseover = function(evt) {
                this.setTexture(this.hoverImage);
                this.defaultY = this.position.y;
                this.position.y = this.defaultY + 2;
            };
        }

        this.mouseout = function(evt) {
            this.setTexture(this.defaultImage);
            this.position.y = this.defaultY;
        };
     };



    return TextButton;

});