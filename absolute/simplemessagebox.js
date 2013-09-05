/**
 * Created by craig on 8/27/13.
 */
define(['pixi', 'absolute/button', 'absolute/coords'], function(PIXI, Button, Coords) {

    var SimpleMessageBox = function(width, height, textStyle) {
        this._initSimpleMessageBox(width, height, textStyle);
    };

    SimpleMessageBox.constructor = SimpleMessageBox;
    SimpleMessageBox.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    SimpleMessageBox.prototype._initSimpleMessageBox = function(width, height, textStyle) {
        PIXI.DisplayObjectContainer.call(this);
        this.width = width;
        this.height = height;
        this.textStyle = textStyle;
        this.textStyle.wordWrapWidth = width - 60;
        this.textStyle.wordWrap = true;

        var graphics = new PIXI.Graphics();
        graphics.lineStyle(8, 0x0, 1);
        graphics.beginFill(0xffffff, 1);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
        this.addChild(graphics);

        this.text = null;
    };

    SimpleMessageBox.prototype.setText = function(text) {
        if (this.text) {
            this.removeChild(this.text);
        }

        this.text = new PIXI.Text(text, this.textStyle);
        this.text.position.x = (this.width - this.text.width) / 2;
        this.text.position.y = Coords.y(30);
        this.addChild(this.text);
    };

    return SimpleMessageBox;
});